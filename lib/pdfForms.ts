import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format, parseISO } from 'date-fns';

export const UNOFFICIAL_WORKSHEET_NOTICE =
  'Unofficial — not a Government of Saskatchewan form';
export const INDEPENDENCE_NOTICE =
  'Autism Fund Tracker is independent and not affiliated with or endorsed by the Government of Saskatchewan.';

const OFFICIAL_PROGRAM_PORTAL = 'https://autismfunding.saskatchewan.ca/';
export const OFFICIAL_MILEAGE_FORM_URL =
  'https://publications.saskatchewan.ca/api/v1/products/123746/formats/144047/download';
export const OFFICIAL_RESPITE_FORM_URL =
  'https://publications.saskatchewan.ca/api/v1/products/123751/formats/144051/download';

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
  expense_date: string;
  category_label: string;
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

export interface RespitePdfRow {
  session_date: string;
  provider_name: string;
  provider_phone: string | null;
  amount_paid: number;
}

export interface RespitePdfInput {
  childName: string;
  healthServicesNumber: string | null;
  parentName: string;
  parentEmail: string;
  monthLabel: string;
  rows: RespitePdfRow[];
  total: number;
  submittedDate?: string;
}

type WorksheetColumn = {
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string;
};

type WorksheetInput = {
  title: string;
  monthLabel: string;
  childName: string;
  healthServicesNumber: string | null;
  parentName: string;
  parentEmail: string;
  submittedDate?: string;
  columns: WorksheetColumn[];
  rows: string[][];
  total: number;
  totalLabel: string;
  recordkeepingNote: string;
  officialFormLabel?: string;
  officialFormUrl?: string;
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy');
  } catch {
    return isoDate;
  }
}

function cad(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(Number(amount) || 0);
}

async function sharePdf(html: string, dialogTitle: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle,
      UTI: 'com.adobe.pdf',
    });
  }
}

function buildWorksheetHtml(input: WorksheetInput): string {
  const preparedDate = input.submittedDate
    ? fmtDate(input.submittedDate)
    : format(new Date(), 'MMM d, yyyy');
  const identityRows = [
    ['Child', input.childName],
    ['Health Services Number', input.healthServicesNumber || 'Not provided'],
    ['Parent / guardian', input.parentName],
    ['Contact email', input.parentEmail],
    ['Record month', input.monthLabel],
    ['Worksheet prepared', preparedDate],
  ];
  const headers = input.columns.map((column) => (
    `<th style="text-align:${column.align ?? 'left'};${column.width ? `width:${column.width};` : ''}">${esc(column.label)}</th>`
  )).join('');
  const renderedRows = input.rows.length > 0
    ? input.rows.map((row) => `<tr>${input.columns.map((column, index) => (
        `<td style="text-align:${column.align ?? 'left'}">${esc(row[index] ?? '')}</td>`
      )).join('')}</tr>`)
    : [`<tr><td colspan="${input.columns.length}" class="empty">No records for this period</td></tr>`];
  const pageSize = 10;
  const rowPages = Array.from(
    { length: Math.ceil(renderedRows.length / pageSize) },
    (_, pageIndex) => renderedRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
  );
  const tables = rowPages.map((pageRows, pageIndex) => {
    const isLastPage = pageIndex === rowPages.length - 1;
    return `
      <section class="${pageIndex > 0 ? 'continuation' : ''}">
        ${pageIndex > 0 ? `
          <div class="notice">
            <strong>${esc(UNOFFICIAL_WORKSHEET_NOTICE)}</strong>
            <span>${esc(INDEPENDENCE_NOTICE)}</span>
          </div>
          <div class="continuation-title">${esc(input.title)} &mdash; continued</div>
          <div class="period">${esc(input.monthLabel)}</div>
        ` : ''}
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${pageRows.join('')}</tbody>
        </table>
        ${isLastPage ? `
          <div class="total">${esc(input.totalLabel)}:&nbsp; <span>${esc(cad(input.total))}</span></div>
          <div class="resource">
            Verify current program rules and complete any required government form separately.
            ${input.officialFormUrl ? `<br>External official form: <a href="${input.officialFormUrl}">${esc(input.officialFormLabel ?? 'Saskatchewan.ca PDF')}</a>` : ''}
            <br>Official online expense submission portal:
            <a href="${OFFICIAL_PROGRAM_PORTAL}">${OFFICIAL_PROGRAM_PORTAL}</a>
          </div>
          <div class="footer">${esc(UNOFFICIAL_WORKSHEET_NOTICE)} &nbsp;&bull;&nbsp; ${esc(INDEPENDENCE_NOTICE)}</div>
        ` : ''}
      </section>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @page { margin: 24mm 14mm 25mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #10213f; font-family: Arial, Helvetica, sans-serif; font-size: 10.5px; line-height: 1.45; }
    .notice { border: 2px solid #d64045; border-radius: 8px; background: #fff5f5; padding: 10px 12px; margin-bottom: 18px; }
    .notice strong { display: block; color: #a51d25; font-size: 13px; text-transform: uppercase; letter-spacing: .35px; }
    .notice span { display: block; color: #5b2430; margin-top: 4px; }
    .brand { color: #173b73; font-size: 12px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase; }
    h1 { color: #173b73; font-size: 24px; margin: 3px 0 2px; }
    .continuation { page-break-before: always; break-before: page; }
    .continuation-title { color: #173b73; font-size: 18px; font-weight: 700; margin: 0 0 2px; }
    .period { color: #5f6f89; font-size: 13px; margin-bottom: 14px; }
    .purpose { border-left: 4px solid #7657c8; background: #f7f5ff; padding: 9px 11px; margin: 0 0 16px; }
    .identity { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #d6dce8; border-radius: 7px; overflow: hidden; margin-bottom: 18px; }
    .field { padding: 7px 9px; border-bottom: 1px solid #e2e6ef; }
    .field:nth-child(odd) { border-right: 1px solid #e2e6ef; }
    .label { color: #6b778d; display: block; font-size: 8px; font-weight: 700; letter-spacing: .45px; text-transform: uppercase; }
    .value { color: #172746; display: block; font-size: 10.5px; margin-top: 2px; min-height: 15px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th { background: #173b73; color: white; border: 1px solid #173b73; padding: 7px 6px; font-size: 9px; overflow-wrap: anywhere; }
    td { border: 1px solid #d6dce8; padding: 6px; vertical-align: top; overflow-wrap: anywhere; }
    tbody tr:nth-child(even) { background: #f8f9fc; }
    .empty { color: #6b778d; text-align: center; padding: 18px; }
    .total { display: flex; justify-content: flex-end; margin-top: 8px; font-size: 13px; font-weight: 700; }
    .total span { min-width: 130px; border-bottom: 2px solid #173b73; padding: 5px 2px; text-align: right; }
    .resource { margin-top: 18px; border: 1px solid #d6dce8; border-radius: 7px; padding: 9px 11px; color: #44516a; }
    .resource a { color: #3155a4; }
    .footer { margin-top: 10px; border-top: 1px solid #d6dce8; padding-top: 6px; color: #6b778d; font-size: 8px; text-align: center; page-break-inside: avoid; }
  </style>
</head>
<body>
  <div class="notice">
    <strong>${esc(UNOFFICIAL_WORKSHEET_NOTICE)}</strong>
    <span>${esc(INDEPENDENCE_NOTICE)}</span>
  </div>
  <div class="brand">Autism Fund Tracker</div>
  <h1>${esc(input.title)}</h1>
  <div class="period">${esc(input.monthLabel)}</div>
  <p class="purpose">${esc(input.recordkeepingNote)} This worksheet is for personal recordkeeping only. It is not a claim, application, invoice, approval, or proof of eligibility, and it is not submitted automatically.</p>
  <div class="identity">
    ${identityRows.map(([label, value]) => `<div class="field"><span class="label">${esc(label)}</span><span class="value">${esc(value)}</span></div>`).join('')}
  </div>
  ${tables}
</body>
</html>`;
}

export async function generateAndShareMileageWorksheetPdf(data: MileagePdfInput): Promise<void> {
  const html = buildWorksheetHtml({
    title: 'Mileage Record Worksheet',
    monthLabel: data.monthLabel,
    childName: data.childName,
    healthServicesNumber: data.healthServicesNumber,
    parentName: data.parentName,
    parentEmail: data.parentEmail,
    submittedDate: data.submittedDate,
    columns: [
      { label: 'Date', width: '13%' },
      { label: 'Trip purpose and destination' },
      { label: 'Distance (km)', align: 'right', width: '14%' },
      { label: 'Rate / km', align: 'right', width: '13%' },
      { label: 'Calculated amount', align: 'right', width: '16%' },
    ],
    rows: data.rows.map((row) => [
      fmtDate(row.trip_date),
      row.description ?? '',
      Number(row.distance_km).toFixed(1),
      cad(Number(row.rate_per_km)),
      cad(Number(row.reimbursement_amount)),
    ]),
    total: data.total,
    totalLabel: 'Recorded mileage amount',
    recordkeepingNote: 'Use this independent worksheet to review the mileage trips you recorded in Autism Fund Tracker.',
    officialFormLabel: 'Government of Saskatchewan mileage form (opens externally)',
    officialFormUrl: OFFICIAL_MILEAGE_FORM_URL,
  });
  await sharePdf(html, `Mileage worksheet — ${data.monthLabel}`);
}

export async function generateAndShareExpenseWorksheetPdf(data: ExpensePdfInput): Promise<void> {
  const html = buildWorksheetHtml({
    title: 'Expense Record Worksheet',
    monthLabel: data.monthLabel,
    childName: data.childName,
    healthServicesNumber: data.healthServicesNumber,
    parentName: data.parentName,
    parentEmail: data.parentEmail,
    submittedDate: data.submittedDate,
    columns: [
      { label: 'Date', width: '13%' },
      { label: 'Category', width: '18%' },
      { label: 'Provider', width: '21%' },
      { label: 'Description' },
      { label: 'Recorded amount', align: 'right', width: '16%' },
    ],
    rows: data.rows.map((row) => [
      fmtDate(row.expense_date),
      row.category_label,
      row.provider_name ?? '',
      row.description ?? '',
      cad(Number(row.amount)),
    ]),
    total: data.total,
    totalLabel: 'Recorded expense amount',
    recordkeepingNote: 'Use this independent worksheet to review the expenses you recorded in Autism Fund Tracker.',
  });
  await sharePdf(html, `Expense worksheet — ${data.monthLabel}`);
}

export async function generateAndShareRespiteWorksheetPdf(data: RespitePdfInput): Promise<void> {
  const html = buildWorksheetHtml({
    title: 'Respite Record Worksheet',
    monthLabel: data.monthLabel,
    childName: data.childName,
    healthServicesNumber: data.healthServicesNumber,
    parentName: data.parentName,
    parentEmail: data.parentEmail,
    submittedDate: data.submittedDate,
    columns: [
      { label: 'Date', width: '16%' },
      { label: 'Respite provider' },
      { label: 'Provider phone', width: '24%' },
      { label: 'Recorded amount', align: 'right', width: '20%' },
    ],
    rows: data.rows.map((row) => [
      fmtDate(row.session_date),
      row.provider_name,
      row.provider_phone ?? '',
      cad(Number(row.amount_paid)),
    ]),
    total: data.total,
    totalLabel: 'Recorded respite amount',
    recordkeepingNote: 'Use this independent worksheet to review the respite sessions you recorded in Autism Fund Tracker.',
    officialFormLabel: 'Government of Saskatchewan respite form (opens externally)',
    officialFormUrl: OFFICIAL_RESPITE_FORM_URL,
  });
  await sharePdf(html, `Respite worksheet — ${data.monthLabel}`);
}
