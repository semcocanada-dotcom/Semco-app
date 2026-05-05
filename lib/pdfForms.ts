import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';

export interface MileagePdfRow {
  trip_date: string;       // YYYY-MM-DD from DB
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
  monthLabel: string;      // 'May 2026'
  rows: MileagePdfRow[];
  total: number;
  submittedDate?: string;  // YYYY-MM-DD, defaults to today
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
      <td class="td-purpose">${row.description ?? ''}</td>
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
      <div class="field-value">${child.first}</div>
      <span class="field-label">Child First Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${child.last}</div>
      <span class="field-label">Child Last Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${data.healthServicesNumber ?? ''}</div>
      <span class="field-label">Health Services Number</span>
    </div>
  </div>

  <div class="section-heading">Parent/Guardian Information*</div>
  <div class="field-row">
    <div class="field-cell">
      <div class="field-value">${parent.first}</div>
      <span class="field-label">Parent/Guardian First Name</span>
    </div>
    <div class="field-cell">
      <div class="field-value">${parent.last}</div>
      <span class="field-label">Parent/Guardian Last Name</span>
    </div>
    <div class="field-cell field-cell-wide">
      <div class="field-value">${data.parentEmail}</div>
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
      <div class="sig-line">${data.parentName}</div>
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
