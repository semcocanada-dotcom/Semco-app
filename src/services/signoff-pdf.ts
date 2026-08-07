import { Platform } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { LineCapStyle, PDFDocument, StandardFonts, rgb } from 'pdf-lib/dist/pdf-lib.esm.js';
import type { SignoffTemplate } from '@/constants/project-signoffs';
import { getCroppedSignaturePath, parseSignatureRecord } from '@/components/projects/SignaturePad';
import { supabase } from '@/services/supabase';
import {
  CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL,
  CUSTOMER_SIGNOFF_SUPPORT_URL,
  readCustomerSignoffConsentAudit,
} from '@/services/customer-signoff-consent';
import { SEMCO_PRIVACY_EMAIL } from '@/constants/legal';

type CreateFilledSignoffPdfInput = {
  projectId: string;
  template: SignoffTemplate;
  values: Record<string, string>;
  signatureData?: string | null;
};

export type FilledSignoffPdf = {
  bytes: Uint8Array;
  localUri: string | null;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'form';
}

async function getAssetBytes(source: SignoffTemplate['pdfPage']) {
  const asset = Asset.fromModule(source as number);
  await asset.downloadAsync();
  const response = await fetch(asset.localUri ?? asset.uri);
  if (!response.ok) throw new Error(`Could not load ${asset.name || 'sign-off form'} (${response.status}).`);
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
}: CreateFilledSignoffPdfInput): Promise<FilledSignoffPdf> {
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

  const privacyAudit = readCustomerSignoffConsentAudit(values);
  if (privacyAudit) {
    pdfDoc.setSubject(
      `Customer privacy acknowledgement ${privacyAudit.version} accepted ${privacyAudit.acceptedAt}`,
    );
    pdfDoc.setKeywords([
      'Semco Pro',
      'customer privacy acknowledgement',
      privacyAudit.version,
      privacyAudit.acceptedAt,
    ]);

    const auditPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const margin = 54;
    const contentWidth = PAGE_WIDTH - (margin * 2);
    let auditY = PAGE_HEIGHT - 64;

    auditPage.drawText('Customer Privacy Acknowledgement', {
      x: margin,
      y: auditY,
      size: 18,
      font: bold,
      color: ink,
    });
    auditY -= 30;
    auditPage.drawText(`Notice version: ${privacyAudit.version}`, {
      x: margin,
      y: auditY,
      size: 10,
      font: regular,
      color: ink,
    });
    auditY -= 16;
    auditPage.drawText(`Accepted (UTC): ${privacyAudit.acceptedAt}`, {
      x: margin,
      y: auditY,
      size: 10,
      font: regular,
      color: ink,
    });
    auditY -= 16;
    auditPage.drawText(`Project: ${projectId} | Form: ${template.title}`, {
      x: margin,
      y: auditY,
      size: 10,
      font: regular,
      color: ink,
      maxWidth: contentWidth,
    });
    auditY -= 30;

    for (const line of wrapText(privacyAudit.notice, 88)) {
      auditPage.drawText(line, {
        x: margin,
        y: auditY,
        size: 10,
        font: regular,
        color: ink,
        maxWidth: contentWidth,
      });
      auditY -= 15;
    }

    auditY -= 12;
    for (const line of [
      `Privacy policy: ${CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL}`,
      `Privacy contact: ${SEMCO_PRIVACY_EMAIL}`,
      `Support: ${CUSTOMER_SIGNOFF_SUPPORT_URL}`,
    ]) {
      auditPage.drawText(line, {
        x: margin,
        y: auditY,
        size: 8,
        font: regular,
        color: ink,
        maxWidth: contentWidth,
      });
      auditY -= 13;
    }

    auditPage.drawText(
      'Audit receipt: the customer selected I Agree & Continue before sign-off details or the signature were captured.',
      {
        x: margin,
        y: 44,
        size: 8,
        font: bold,
        color: ink,
        maxWidth: contentWidth,
      },
    );
  }

  const bytes = await pdfDoc.save();
  if (Platform.OS === 'web') {
    return { bytes, localUri: null };
  }

  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory is unavailable.');
  }

  const base64 = await pdfDoc.saveAsBase64({ dataUri: false });
  const directory = `${FileSystem.documentDirectory}semco-signoffs/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const filename = `${sanitizeFilePart(projectId)}-${sanitizeFilePart(template.type)}-${Date.now()}.pdf`;
  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return { bytes, localUri: uri };
}

export async function uploadSignoffPdf(
  pdf: FilledSignoffPdf,
  installerId: string,
  projectId: string,
  signoffId: string,
  template: SignoffTemplate,
): Promise<string | null> {
  try {
    if (pdf.bytes.byteLength === 0) return null;
    const storagePath = `${installerId}/${projectId}/${signoffId}/${sanitizeFilePart(template.type)}.pdf`;

    const { error } = await supabase.storage
      .from('project-signoffs')
      .upload(storagePath, pdf.bytes, {
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
