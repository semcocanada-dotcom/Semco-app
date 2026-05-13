import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Project } from '@/database/schema/projects';
import type { BatchLog } from '@/database/schema/batches';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildBatchRows(batches: BatchLog[]): string {
  if (batches.length === 0) {
    return '<tr><td colspan="4" style="text-align:center;color:#A0A0A0;">No batch logs recorded</td></tr>';
  }
  return batches
    .map(
      (b) => `
      <tr>
        <td>${b.productId}</td>
        <td>${b.batchNumber}</td>
        <td>${b.quantityKg != null ? `${b.quantityKg} kg` : '—'}</td>
        <td>${b.coverageAchievedSqm != null ? `${b.coverageAchievedSqm} m²` : '—'}</td>
      </tr>`,
    )
    .join('');
}

function buildHtml(project: Project, batches: BatchLog[], installerName: string): string {
  const completionDate = formatDate(project.completionDate ?? project.updatedAt);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #1a1a1a; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #C8A96E; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 24px; font-weight: 700; color: #C8A96E; letter-spacing: 1px; }
    .brand-sub { font-size: 11px; color: #555; margin-top: 2px; text-transform: uppercase; letter-spacing: 1px; }
    .doc-title { text-align: right; }
    .doc-title h1 { font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .doc-title p { font-size: 11px; color: #777; margin-top: 4px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #C8A96E; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .field label { font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
    .field span { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f5f5f5; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; border-bottom: 2px solid #ddd; }
    td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; color: #1a1a1a; }
    tr:last-child td { border-bottom: none; }
    .warranty-box { border: 2px solid #C8A96E; border-radius: 8px; padding: 16px; margin-top: 24px; background: #FFFDF7; }
    .warranty-box p { font-size: 12px; color: #444; line-height: 1.6; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 10px; color: #aaa; }
    .sig-line { width: 200px; border-bottom: 1px solid #999; margin-bottom: 4px; height: 32px; }
    .sig-label { font-size: 10px; color: #777; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SEMCO</div>
      <div class="brand-sub">Certified Installer Network</div>
    </div>
    <div class="doc-title">
      <h1>Warranty Certificate</h1>
      <p>Issued: ${completionDate}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Installer</div>
    <div class="grid">
      <div class="field"><label>Certified Installer</label><span>${installerName}</span></div>
      <div class="field"><label>Completion Date</label><span>${completionDate}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Client & Site</div>
    <div class="grid">
      <div class="field"><label>Client Name</label><span>${project.clientName ?? '—'}</span></div>
      <div class="field"><label>Site Address</label><span>${project.siteAddress ?? '—'}</span></div>
      <div class="field"><label>Email</label><span>${project.clientEmail ?? '—'}</span></div>
      <div class="field"><label>Phone</label><span>${project.clientPhone ?? '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Application Specification</div>
    <div class="grid">
      <div class="field"><label>Substrate</label><span>${project.substrateType?.replace(/_/g, ' ') ?? '—'}</span></div>
      <div class="field"><label>Total Area</label><span>${project.totalAreaSqm != null ? `${project.totalAreaSqm} m²` : '—'}</span></div>
      <div class="field"><label>Finish</label><span>${project.finishType ?? '—'}</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Product & Batch Log</div>
    <table>
      <thead>
        <tr>
          <th>Product SKU</th>
          <th>Batch Number</th>
          <th>Quantity</th>
          <th>Coverage</th>
        </tr>
      </thead>
      <tbody>
        ${buildBatchRows(batches)}
      </tbody>
    </table>
  </div>

  <div class="warranty-box">
    <div class="section-title" style="margin-bottom:8px;">Warranty Statement</div>
    <p>
      This certificate confirms that the microcement installation described above was completed by a
      Semco Certified Installer using genuine Semco products applied in accordance with current Semco
      technical data sheets and application guidelines. The installation is covered by Semco's standard
      materials warranty against defects in product quality for a period of two (2) years from the date
      of completion, subject to correct substrate preparation, application conditions, and ongoing
      maintenance per Semco care guidelines.
    </p>
  </div>

  <div class="footer">
    <div>
      <p>Semco Canada · semco.ca</p>
      <p>Generated by Semco Pro</p>
    </div>
    <div>
      <div class="sig-line"></div>
      <div class="sig-label">Installer Signature</div>
    </div>
  </div>
</body>
</html>`;
}

export async function generateWarrantyPdf(
  project: Project,
  batches: BatchLog[],
  installerName: string,
): Promise<string> {
  const html = buildHtml(project, batches, installerName);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function shareWarrantyPdf(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Warranty Certificate',
    UTI: 'com.adobe.pdf',
  });
}
