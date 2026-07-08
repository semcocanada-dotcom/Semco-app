import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { format, parseISO } from 'date-fns';
import { PDFDocument, type PDFForm } from 'pdf-lib';
import { MILEAGE_FORM_BASE64 } from '../assets/forms/mileageFormBase64';
import { RESPITE_FORM_BASE64 } from '../assets/forms/respiteFormBase64';

export interface MileagePdfRow {
  trip_date: string;
  description: string | null;
  distance_km: number;
  rate_per_km: number;
  reimbursement_amount: number;
}

export interface MileagePdfInput {
  childName: string;
  healthServicesNumber: string | null;
  parentName: string;
  parentEmail: string;
  monthLabel: string;
  rows: MileagePdfRow[];
  total: number;
  submittedDate?: string;
}

export interface ExpensePdfRow {
  expense_date: string;      // YYYY-MM-DD
  category_label: string;   // human-readable category
  provider_name: string | null;
  description: string | null;
  amount: number;
}

export interface ExpensePdfInput {
  childName: string;
  healthServicesNumber: string | null;
  parentName: string;
  parentEmail: string;
  monthLabel: string;
  rows: ExpensePdfRow[];
  total: number;
  submittedDate?: string;
}

// Set an AcroForm text field, tolerating field-name mismatches so a single bad
// name doesn't abort the whole export. Field names below are verified against
// the embedded SK government PDFs (55 mileage / 54 respite fields, all matched).
function setField(form: PDFForm, name: string, value: string): void {
  try {
    form.getTextField(name).setText(value);
  } catch {
    console.warn(`[pdfForms] Could not fill AcroForm field "${name}"`);
  }
}

// User-entered values must be escaped before interpolation into the HTML
// print templates (the AcroForm path sets field values directly and is safe).
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Encode bytes to base64 in slices — spreading a large Uint8Array into
// String.fromCharCode overflows the call stack on multi-page PDFs.
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const SLICE = 0x8000;
  for (let i = 0; i < bytes.length; i += SLICE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + SLICE));
  }
  return btoa(binary);
}

export async function generateAndShareMileagePdf(data: MileagePdfInput): Promise<void> {
  const html = buildMileageHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Mileage Claim — ${data.monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

// Fill and share the official SK government AcroForm PDF. A month with more
// trips than fit on one page (9) spills onto additional pages, all combined
// into a single multi-page PDF; each page is a complete form with its own total.
async function fillMileagePage(
  data: MileagePdfInput, rows: MileagePdfRow[], pageTotal: number,
): Promise<PDFDocument> {
  const pdfDoc  = await PDFDocument.load(
    Uint8Array.from(atob(MILEAGE_FORM_BASE64), c => c.charCodeAt(0))
  );
  const form    = pdfDoc.getForm();
  const child   = splitName(data.childName);
  const parent  = splitName(data.parentName);
  const today   = data.submittedDate ?? format(new Date(), 'yyyy-MM-dd');

  setField(form, 'Child First name', child.first);
  setField(form, 'Child Last Name', child.last);
  setField(form, 'Health Services Number', data.healthServicesNumber ?? '');
  setField(form, 'Parent/Guardian First Name', parent.first);
  setField(form, 'Parent/Guardian Last name', parent.last);
  setField(form, 'email address', data.parentEmail);
  setField(form, 'Month', data.monthLabel);

  rows.forEach((row, i) => {
    const n = i + 1;
    setField(form, `Date MMDDYYRow${n}`, fmtDate(row.trip_date));
    setField(form, `Purpose of Travel include eligible serviceappointment type and locationRow${n}`, row.description ?? '');
    setField(form, `Distance kmRow${n}`, Number(row.distance_km).toFixed(1));
    setField(form, `Mileage Rate Row${n}`, `$${Number(row.rate_per_km).toFixed(4)}`);
    setField(form, `Expense Amount  km x mileage rateRow${n}`, `$${Number(row.reimbursement_amount).toFixed(2)}`);
  });

  setField(form, 'Total', `$${pageTotal.toFixed(2)}`);
  setField(form, 'Printed Name ParentGuardian', data.parentName);
  setField(form, 'Date MMDDYYYY', fmtDateLong(today));
  form.flatten();
  return pdfDoc;
}

export async function fillAndShareOfficialMileagePdf(data: MileagePdfInput): Promise<void> {
  const ROWS_PER_PAGE = 9;
  const groups = data.rows.length ? chunk(data.rows, ROWS_PER_PAGE) : [[]];

  const master = await PDFDocument.create();
  for (const rows of groups) {
    const pageTotal = rows.reduce((s, r) => s + Number(r.reimbursement_amount), 0);
    const filled = await fillMileagePage(data, rows, pageTotal);
    const copied = await master.copyPages(filled, filled.getPageIndices());
    copied.forEach(p => master.addPage(p));
  }

  const pdfBytes = await master.save();
  const b64 = bytesToBase64(pdfBytes);
  const path = `${FileSystem.cacheDirectory}MileageInvoice_${data.monthLabel.replace(/\s/g, '_')}.pdf`;
  await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/pdf',
      dialogTitle: `Mileage Invoice — ${data.monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

export interface RespitePdfRow {
  session_date:  string;        // YYYY-MM-DD
  provider_name: string;
  provider_phone: string | null;
  amount_paid:   number;
}

export interface RespitePdfInput {
  childName:            string;
  healthServicesNumber: string | null;
  parentName:           string;
  parentEmail:          string;
  monthLabel:           string;
  rows:                 RespitePdfRow[];
  total:                number;
  submittedDate?:       string;
}

async function fillRespitePage(
  data: RespitePdfInput, rows: RespitePdfRow[], pageTotal: number,
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.load(
    Uint8Array.from(atob(RESPITE_FORM_BASE64), c => c.charCodeAt(0))
  );
  const form   = pdfDoc.getForm();
  const child  = splitName(data.childName);
  const parent = splitName(data.parentName);
  const today  = data.submittedDate ?? format(new Date(), 'yyyy-MM-dd');

  setField(form, 'Child First Name', child.first);
  setField(form, 'Child Last Name', child.last);
  setField(form, 'Health Services Number', data.healthServicesNumber ?? '');
  setField(form, 'Parent/Guardian First name', parent.first);
  setField(form, 'Parent/Guardian Last Name', parent.last);
  setField(form, 'Email Address', data.parentEmail);
  setField(form, 'Month', data.monthLabel);

  rows.forEach((row, i) => {
    const n = i + 1;
    setField(form, `Date MMDDYYRow${n}`, fmtDate(row.session_date));
    setField(form, `Service Provider nameRow${n}`, row.provider_name);
    setField(form, `Phone NumberRow${n}`, row.provider_phone ?? '');
    setField(form, `Amount Paid Row${n}`, `$${Number(row.amount_paid).toFixed(2)}`);
  });

  setField(form, 'Total', `$${pageTotal.toFixed(2)}`);
  setField(form, 'Printed Name ParentGuardian', data.parentName);
  setField(form, 'Date MMDDYYYY', fmtDateLong(today));
  form.flatten();
  return pdfDoc;
}

export async function fillAndShareOfficialRespitePdf(data: RespitePdfInput): Promise<void> {
  const ROWS_PER_PAGE = 11;
  const groups = data.rows.length ? chunk(data.rows, ROWS_PER_PAGE) : [[]];

  const master = await PDFDocument.create();
  for (const rows of groups) {
    const pageTotal = rows.reduce((s, r) => s + Number(r.amount_paid), 0);
    const filled = await fillRespitePage(data, rows, pageTotal);
    const copied = await master.copyPages(filled, filled.getPageIndices());
    copied.forEach(p => master.addPage(p));
  }

  const pdfBytes = await master.save();
  const b64 = bytesToBase64(pdfBytes);
  const path = `${FileSystem.cacheDirectory}RespiteInvoice_${data.monthLabel.replace(/\s/g, '_')}.pdf`;
  await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/pdf',
      dialogTitle: `Respite Invoice — ${data.monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

export async function generateAndShareExpensePdf(data: ExpensePdfInput): Promise<void> {
  const html = buildExpenseHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Expense Claim — ${data.monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

function fmtDate(isoDate: string): string {
  // YYYY-MM-DD → MM/DD/YY
  try {
    return format(parseISO(isoDate), 'MM/dd/yy');
  } catch {
    return isoDate;
  }
}

function fmtDateLong(isoDate: string): string {
  // YYYY-MM-DD → MM/DD/YYYY
  try {
    return format(parseISO(isoDate), 'MM/dd/yyyy');
  } catch {
    return isoDate;
  }
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function buildMileageHtml(data: MileagePdfInput): string {
  const child = splitName(data.childName);
  const parent = splitName(data.parentName);
  const today = data.submittedDate ?? format(new Date(), 'yyyy-MM-dd');

  // Pad to at least 9 rows so the form looks like the official version
  const MIN_ROWS = 9;
  const paddedRows = [...data.rows];
  while (paddedRows.length < MIN_ROWS) {
    paddedRows.push(null as unknown as MileagePdfRow);
  }

  const tableRows = paddedRows.map((row) => {
    if (!row) {
      return `<tr>
        <td class="td-date">&nbsp;</td>
        <td class="td-purpose">&nbsp;</td>
        <td class="td-num">&nbsp;</td>
        <td class="td-num">&nbsp;</td>
        <td class="td-num">&nbsp;</td>
      </tr>`;
    }
    return `<tr>
      <td class="td-date">${fmtDate(row.trip_date)}</td>
      <td class="td-purpose">${esc(row.description ?? '')}</td>
      <td class="td-num">${Number(row.distance_km).toFixed(1)}</td>
      <td class="td-num">$${Number(row.rate_per_km).toFixed(4)}</td>
      <td class="td-num">$${Number(row.reimbursement_amount).toFixed(2)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
    color: #000;
    padding: 28px 32px;
    background: #fff;
  }
  .title-main {
    font-size: 20px;
    font-weight: 400;
    color: #1a1a1a;
    margin-bottom: 2px;
  }
  .title-sub {
    font-size: 14px;
    font-weight: 700;
    color: #215732;
    margin-bottom: 4px;
  }
  .instructions {
    font-size: 11px;
    color: #333;
    margin-bottom: 18px;
  }
  .instructions a { color: #215732; }

  .section-heading {
    font-size: 12px;
    font-weight: 700;
    color: #215732;
    margin-bottom: 4px;
    margin-top: 14px;
  }
  .field-row {
    display: flex;
    border-bottom: 1px solid #000;
    margin-bottom: 14px;
  }
  .field-cell {
    flex: 1;
    padding-bottom: 4px;
    padding-right: 12px;
  }
  .field-cell-wide { flex: 2; }
  .field-label {
    font-size: 9px;
    color: #555;
    margin-top: 4px;
    display: block;
  }
  .field-value {
    font-size: 12px;
    min-height: 16px;
  }
  .divider {
    border: none;
    border-top: 1px solid #ccc;
    margin: 14px 0;
  }
  .month-row {
    font-size: 12px;
    font-weight: 700;
    color: #215732;
    margin-bottom: 10px;
  }
  .month-value {
    font-weight: 400;
    color: #000;
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 120px;
    padding-left: 4px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }
  th {
    background: #215732;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    padding: 6px 6px;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #215732;
  }
  th.th-purpose { text-align: left; }
  td {
    border: 1px solid #bbb;
    padding: 5px 6px;
    font-size: 11px;
    height: 22px;
    vertical-align: middle;
  }
  .td-date { width: 72px; text-align: center; }
  .td-purpose { text-align: left; }
  .td-num { width: 72px; text-align: right; }

  .total-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 0;
    border: 1px solid #bbb;
    border-top: none;
  }
  .total-label {
    font-size: 11px;
    font-weight: 700;
    padding: 6px 10px;
    text-align: right;
    flex: 1;
  }
  .total-value {
    font-size: 11px;
    font-weight: 700;
    padding: 6px 10px;
    width: 100px;
    border-left: 1px solid #bbb;
    text-align: right;
  }

  .sig-row {
    display: flex;
    margin-top: 16px;
    gap: 32px;
  }
  .sig-cell { flex: 1; }
  .sig-line {
    border-bottom: 1px solid #000;
    min-height: 28px;
    margin-bottom: 4px;
    font-size: 12px;
    padding-bottom: 2px;
  }
  .sig-label { font-size: 9px; color: #555; }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 28px;
  }
  .footer-site {
    font-size: 13px;
    font-weight: 700;
    color: #215732;
    font-style: italic;
  }
  .footer-logo {
    font-size: 18px;
    font-weight: 700;
    color: #215732;
    font-style: italic;
  }
  .footer-logo span {
    color: #F4C430;
    font-style: normal;
  }
  .asterisk-note {
    font-size: 10px;
    color: #333;
    margin-top: 6px;
    margin-bottom: 14px;
  }
</style>
</head>
<body>
  <div class="title-main">Autism Spectrum Disorder Individualized Funding (ASD-IF)</div>
  <div class="title-sub">Monthly Mileage Invoice Form: Expense Information</div>
  <p class="instructions">
    Instructions to complete this invoice form can be found on
    <a href="https://saskatchewan.ca/autism">saskatchewan.ca/autism</a>.
  </p>

  <div class="section-heading">Child Information</div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-value">${esc(child.first)}</div>
      <span class="field-label">Child First Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${esc(child.last)}</div>
      <span class="field-label">Child Last Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${esc(data.healthServicesNumber ?? '')}</div>
      <span class="field-label">Health Services Number</span>
    </div>
  </div>

  <div class="section-heading">Parent/Guardian Information*</div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-value">${esc(parent.first)}</div>
      <span class="field-label">Parent/Guardian First Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${esc(parent.last)}</div>
      <span class="field-label">Parent/Guardian Last Name</span>
    </div>
    <div class="field-cell field-cell-wide">
      <div class="field-value">${esc(data.parentEmail)}</div>
      <span class="field-label">Email Address</span>
    </div>
  </div>
  <p class="asterisk-note">
    *This is the information of the ASD-IF funding applicant. If you are not sure which parent is the
    funding applicant, please contact <a href="mailto:autismif@gov.sk.ca">autismif@gov.sk.ca</a>.
  </p>

  <hr class="divider">

  <div class="month-row">
    Month: <span class="month-value">${data.monthLabel}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th class="td-date">Date<br><span style="font-weight:400;font-size:9px">(MM/DD/YY)</span></th>
        <th class="th-purpose">
          Purpose of Travel<br>
          <span style="font-weight:400;font-size:9px">[include eligible service/appointment type and location]</span>
        </th>
        <th class="td-num">Distance<br>(km)</th>
        <th class="td-num">Mileage Rate<br>($)</th>
        <th class="td-num">Expense Amount ($)<br><span style="font-weight:400;font-size:9px">[km x mileage rate]</span></th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="total-row">
    <div class="total-label">Total ($)</div>
    <div class="total-value">$${data.total.toFixed(2)}</div>
  </div>

  <div class="sig-row">
    <div class="sig-cell">
      <div class="sig-line">${esc(data.parentName)}</div>
      <div class="sig-label">Printed Name (Parent/Guardian)</div>
    </div>
    <div class="sig-cell">
      <div class="sig-line">${fmtDateLong(today)}</div>
      <div class="sig-label">Date (MM/DD/YYYY)</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-site">saskatchewan.ca</div>
    <div class="footer-logo">Saskatchewan<span>&#x2F;</span></div>
  </div>
</body>
</html>`;
}

function buildExpenseHtml(data: ExpensePdfInput): string {
  const child  = splitName(data.childName);
  const parent = splitName(data.parentName);
  const today  = data.submittedDate ?? format(new Date(), 'yyyy-MM-dd');

  const MIN_ROWS = 8;
  const padded = [...data.rows];
  while (padded.length < MIN_ROWS) padded.push(null as unknown as ExpensePdfRow);

  const rows = padded.map(r => r ? `<tr>
    <td class="tc">${fmtDate(r.expense_date)}</td>
    <td>${esc(r.category_label)}</td>
    <td>${esc(r.provider_name ?? '')}</td>
    <td>${esc(r.description ?? '')}</td>
    <td class="tr">$${Number(r.amount).toFixed(2)}</td>
  </tr>` : `<tr><td class="tc">&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td class="tr">&nbsp;</td></tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:11px;color:#000;padding:28px 32px;background:#fff}
  .t1{font-size:20px;font-weight:400;color:#1a1a1a;margin-bottom:2px}
  .t2{font-size:14px;font-weight:700;color:#215732;margin-bottom:4px}
  .inst{font-size:11px;color:#333;margin-bottom:18px}
  .sh{font-size:12px;font-weight:700;color:#215732;margin-bottom:4px;margin-top:14px}
  .fr{display:flex;border-bottom:1px solid #000;margin-bottom:14px}
  .fc{flex:1;padding-bottom:4px;padding-right:12px}
  .fc2{flex:2}
  .fl{font-size:9px;color:#555;margin-top:4px;display:block}
  .fv{font-size:12px;min-height:16px}
  hr{border:none;border-top:1px solid #ccc;margin:14px 0}
  .mr{font-size:12px;font-weight:700;color:#215732;margin-bottom:10px}
  .mv{font-weight:400;color:#000;border-bottom:1px solid #000;display:inline-block;min-width:120px;padding-left:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:0}
  th{background:#215732;color:#fff;font-size:10px;font-weight:700;padding:6px;text-align:left;border:1px solid #215732}
  td{border:1px solid #bbb;padding:5px 6px;font-size:11px;height:22px;vertical-align:middle}
  .tc{text-align:center;width:68px}
  .tr{text-align:right;width:78px}
  .tot{display:flex;justify-content:flex-end;border:1px solid #bbb;border-top:none}
  .tl{font-size:11px;font-weight:700;padding:6px 10px;text-align:right;flex:1}
  .tv{font-size:11px;font-weight:700;padding:6px 10px;width:100px;border-left:1px solid #bbb;text-align:right}
  .sr{display:flex;margin-top:16px;gap:32px}
  .sc{flex:1}
  .sl{border-bottom:1px solid #000;min-height:28px;margin-bottom:4px;font-size:12px;padding-bottom:2px}
  .slb{font-size:9px;color:#555}
  .ft{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px}
  .fs{font-size:13px;font-weight:700;color:#215732;font-style:italic}
  .fl2{font-size:18px;font-weight:700;color:#215732;font-style:italic}
  .fl2 span{color:#F4C430;font-style:normal}
  .an{font-size:10px;color:#333;margin-top:6px;margin-bottom:14px}
</style></head><body>
  <div class="t1">Autism Spectrum Disorder Individualized Funding (ASD-IF)</div>
  <div class="t2">Monthly Expense Claim Form</div>
  <p class="inst">Instructions: <a href="https://saskatchewan.ca/autism">saskatchewan.ca/autism</a></p>

  <div class="sh">Child Information</div>
  <div class="fr">
    <div class="fc"><div class="fv">${esc(child.first)}</div><span class="fl">Child First Name</span></div>
    <div class="fc"><div class="fv">${esc(child.last)}</div><span class="fl">Child Last Name</span></div>
    <div class="fc"><div class="fv">${esc(data.healthServicesNumber ?? '')}</div><span class="fl">Health Services Number</span></div>
  </div>

  <div class="sh">Parent/Guardian Information*</div>
  <div class="fr">
    <div class="fc"><div class="fv">${esc(parent.first)}</div><span class="fl">First Name</span></div>
    <div class="fc"><div class="fv">${esc(parent.last)}</div><span class="fl">Last Name</span></div>
    <div class="fc fc2"><div class="fv">${esc(data.parentEmail)}</div><span class="fl">Email Address</span></div>
  </div>
  <p class="an">*ASD-IF funding applicant. Questions? <a href="mailto:autismif@gov.sk.ca">autismif@gov.sk.ca</a></p>
  <hr>

  <div class="mr">Month: <span class="mv">${data.monthLabel}</span></div>
  <table>
    <thead><tr>
      <th class="tc">Date<br><span style="font-weight:400;font-size:9px">(MM/DD/YY)</span></th>
      <th>Service Type</th>
      <th>Provider / Organization</th>
      <th>Description</th>
      <th class="tr">Amount ($)</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="tot">
    <div class="tl">Total ($)</div>
    <div class="tv">$${data.total.toFixed(2)}</div>
  </div>

  <div class="sr">
    <div class="sc"><div class="sl">${esc(data.parentName)}</div><div class="slb">Printed Name (Parent/Guardian)</div></div>
    <div class="sc"><div class="sl">${fmtDateLong(today)}</div><div class="slb">Date (MM/DD/YYYY)</div></div>
  </div>

  <div class="ft">
    <div class="fs">saskatchewan.ca</div>
    <div class="fl2">Saskatchewan<span>&#x2F;</span></div>
  </div>
</body></html>`;
}
