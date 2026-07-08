import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { LineCapStyle, PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SignoffTemplate } from '@/constants/project-signoffs';
import { getCroppedSignaturePath, parseSignatureRecord } from '@/components/projects/SignaturePad';
import { supabase } from '@/services/supabase';

type CreateFilledSignoffPdfInput = {
  projectId: string;
  template: SignoffTemplate;
  values: Record<string, string>;
  signatureData?: string | null;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'form';
}

async function getAssetBytes(source: SignoffTemplate['pdfPage']) {
  const resolved = Image.resolveAssetSource(source);
  const response = await fetch(resolved.uri);
  return response.arrayBuffer();
}

function wrapText(text: string, maxChars: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function normalizeDate(value: string) {
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!isoDate) return value;
  return `${Number(isoDate[2])}/${Number(isoDate[3])}/${isoDate[1]}`;
}

export async function createFilledSignoffPdf({
  projectId,
  template,
  values,
  signatureData,
}: CreateFilledSignoffPdfInput) {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable.');
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const formImage = await pdfDoc.embedJpg(await getAssetBytes(template.pdfPage));
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0, 0.08, 0.1);
  const signatureInk = rgb(0, 0, 0);

  page.drawImage(formImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  for (const field of template.pdfFields) {
    const x = (field.x / 100) * PAGE_WIDTH;
    const width = (field.width / 100) * PAGE_WIDTH;
    const height = (field.height / 100) * PAGE_HEIGHT;
    const top = (field.y / 100) * PAGE_HEIGHT;
    const y = PAGE_HEIGHT - top - height + 2;

    if (field.type === 'signature') {
      const signature = parseSignatureRecord(signatureData);
      const path = getCroppedSignaturePath(signature, 12);
      if (path) {
        const marginX = Math.min(5, width * 0.015);
        const marginY = Math.min(1, height * 0.03);
        const availableWidth = Math.max(width - (marginX * 2), 1);
        const availableHeight = Math.max(height - (marginY * 2), 1);
        const scale = Math.min(availableWidth / path.width, availableHeight / path.height);
        const drawWidth = path.width * scale;
        const drawHeight = path.height * scale;
        const drawX = x + marginX + ((availableWidth - drawWidth) / 2);
        const drawY = (PAGE_HEIGHT - top - height) + marginY + ((availableHeight - drawHeight) / 2);

        page.drawSvgPath(path.d, {
          x: drawX,
          y: drawY + drawHeight,
          scale,
          borderColor: signatureInk,
          borderWidth: Math.max(1.9, Math.min(3.4, path.strokeWidth * scale * 2.1)),
          borderLineCap: LineCapStyle.Round,
        });
      }
      continue;
    }

    const value = field.type === 'date' ? normalizeDate(values[field.id] ?? '') : values[field.id];
    if (!value) continue;

    const fontSize = field.fontSize ?? 10;
    if (field.type === 'multiline') {
      const maxChars = Math.max(26, Math.floor(width / (fontSize * 0.47)));
      wrapText(value, maxChars).slice(0, 5).forEach((line, index) => {
        page.drawText(line, {
          x: x + 3,
          y: y + height - 13 - (index * (fontSize + 4)),
          size: fontSize,
          font: regular,
          color: ink,
          maxWidth: width - 6,
        });
      });
    } else {
      page.drawText(value, {
        x: x + 3,
        y,
        size: fontSize,
        font: field.id === 'customerName' ? bold : regular,
        color: ink,
        maxWidth: width - 6,
      });
    }
  }

  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  const directory = `${FileSystem.documentDirectory}semco-signoffs/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const filename = `${sanitizeFilePart(projectId)}-${sanitizeFilePart(template.type)}-${Date.now()}.pdf`;
  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

export async function uploadSignoffPdf(
  localUri: string,
  installerId: string,
  projectId: string,
  signoffId: string,
  template: SignoffTemplate,
): Promise<string | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) return null;

    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const storagePath = `${installerId}/${projectId}/${signoffId}/${sanitizeFilePart(template.type)}.pdf`;

    const { error } = await supabase.storage
      .from('project-signoffs')
      .upload(storagePath, bytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('[signoff-pdf] upload error:', error);
      return null;
    }

    // The project-signoffs bucket is private; store the storage path and
    // create a signed URL at view time (see getSignoffPdfViewUrl).
    return storagePath;
  } catch (err) {
    console.error('[signoff-pdf] upload failed:', err);
    return null;
  }
}

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function getSignoffPdfViewUrl(pdfUrl: string): Promise<string | null> {
  // Rows synced before the bucket went private stored a full public URL.
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;

  try {
    const { data, error } = await supabase.storage
      .from('project-signoffs')
      .createSignedUrl(pdfUrl, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.error('[signoff-pdf] signed url error:', error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('[signoff-pdf] signed url failed:', err);
    return null;
  }
}
