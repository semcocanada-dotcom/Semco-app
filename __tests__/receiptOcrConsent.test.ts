import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(
  path.join(__dirname, '..', 'app', '(tabs)', 'expenses.tsx'),
  'utf8',
);

function functionSource(name: string, nextName: string): string {
  const start = source.indexOf(`function ${name}`);
  const end = source.indexOf(`function ${nextName}`, start + 1);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe('receipt OCR consent', () => {
  it('offers attachment without recognition and invokes OCR only after explicit choice', () => {
    const consent = functionSource('handleReceiptCaptured', 'showPermissionSettingsAlert');
    const recognition = functionSource('recognizeReceipt', 'promptForReceiptRecognition');
    const attachment = functionSource('attachReceipt', 'recognizeReceipt');

    expect(consent).toContain('Google Cloud Vision');
    expect(consent).toContain("text: 'Cancel'");
    expect(consent).toContain("text: 'Attach without recognition'");
    expect(consent).toContain("text: 'Use text recognition'");
    expect(consent).toContain('void recognizeReceipt(uri, mime)');
    expect(recognition).toContain('await analyseReceipt(');
    expect(recognition).toContain("supabase.functions.invoke('receipt-ocr'");
    expect(attachment).not.toContain('analyseReceipt');
  });

  it('keeps a failed attachment usable and presents a clear manual-entry fallback', () => {
    const recognition = functionSource('recognizeReceipt', 'promptForReceiptRecognition');

    expect(recognition).toContain('setOcrFailed(true)');
    expect(recognition).toContain('Your receipt is still attached');
    expect(recognition).toContain('Enter the expense details manually');
    expect(recognition).not.toContain('setReceiptUri(null)');
    expect(source).toContain('Receipt attached. Text recognition did not complete');
    expect(source).toContain('Review text recognition');
  });

  it('never retries transmission automatically and requires renewed consent', () => {
    const recognition = functionSource('recognizeReceipt', 'promptForReceiptRecognition');
    const retryDisclosure = functionSource('promptForReceiptRecognition', 'handleReceiptCaptured');

    expect((recognition.match(/analyseReceipt\(/g) ?? [])).toHaveLength(1);
    expect((recognition.match(/recognizeReceipt\(/g) ?? [])).toHaveLength(1);
    expect(retryDisclosure).toContain('It is only sent if you choose Use text recognition');
    expect(retryDisclosure).toContain("text: 'Not now'");
    expect(retryDisclosure).toContain("text: 'Use text recognition'");
    expect(retryDisclosure).toContain('void recognizeReceipt(uri, mime)');
    expect(source).toContain('onPress={() => promptForReceiptRecognition(receiptUri, receiptMime)}');
  });

  it('routes camera, system photo picker, and document picker through the same disclosure', () => {
    const pickerSource = source.slice(source.indexOf('async function pickCamera'), source.indexOf('async function uploadReceipt'));
    expect((pickerSource.match(/handleReceiptCaptured\(/g) ?? [])).toHaveLength(3);
    expect(pickerSource).toContain('launchCameraAsync');
    expect(pickerSource).toContain('launchImageLibraryAsync');
    expect(pickerSource).toContain('DocumentPicker.getDocumentAsync');
  });

  it('uses the iOS system photo picker without requesting full library access', () => {
    expect(source).not.toContain('requestMediaLibraryPermissionsAsync');
  });
});
