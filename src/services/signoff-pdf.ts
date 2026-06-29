import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { SignoffTemplate } from '@/constants/project-signoffs';
import { getSignaturePreviewSegments, parseSignatureRecord } from '@/components/projects/SignaturePad';
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
  const ink = rgb(0, 0.137, 0.176);

  page.drawImage(formImage, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

  for (const field of template.pdfFields) {
    const x = (field.x / 100) * PAGE_WIDTH;
    const width = (field.width / 100) * PAGE_WIDTH;
    const height = (field.height / 100) * PAGE_HEIGHT;
    const top = (field.y / 100) * PAGE_HEIGHT;
    const y = PAGE_HEIGHT - top - height + 2;

    if (field.type === 'signature') {
      const signature = parseSignatureRecord(signatureData);
      const segments = getSignaturePreviewSegments(signature, width / Math.max(height, 1));
      if (segments.length) {
        for (const segment of segments) {
          page.drawLine({
            start: {
              x: x + segment.x1 * width,
              y: y + height - segment.y1 * height,
            },
            end: {
              x: x + segment.x2 * width,
              y: y + height - segment.y2 * height,
            },
            thickness: 0.28,
            color: ink,
          });
        }
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

    const { data } = supabase.storage.from('project-signoffs').getPublicUrl(storagePath);
    return data.publicUrl;
  } catch (err) {
    console.error('[signoff-pdf] upload failed:', err);
    return null;
  }
}
