import * as FileSystem from 'expo-file-system';
import {
  extractReceiptData,
  ReceiptOcrError,
  type ReceiptOcrInvoker,
} from '@lib/ocr';

jest.mock('expo-file-system', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
}));

const readAsStringAsync = FileSystem.readAsStringAsync as jest.MockedFunction<
  typeof FileSystem.readAsStringAsync
>;

function createInvoker(): jest.MockedFunction<ReceiptOcrInvoker> {
  return jest.fn();
}

async function expectOcrFailure(
  promise: Promise<unknown>,
  code: ReceiptOcrError['code'],
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected receipt OCR to fail');
  } catch (error) {
    expect(error).toBeInstanceOf(ReceiptOcrError);
    expect((error as ReceiptOcrError).code).toBe(code);
  }
}

describe('receipt OCR runtime failures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readAsStringAsync.mockResolvedValue('cmVjZWlwdA==');
  });

  it('reports a local attachment read failure without transmitting anything', async () => {
    const invokeReceiptOcr = createInvoker();
    readAsStringAsync.mockRejectedValue(new Error('file unavailable'));

    await expectOcrFailure(
      extractReceiptData('file:///receipt.jpg', 'image/jpeg', invokeReceiptOcr),
      'file_read_failed',
    );

    expect(invokeReceiptOcr).not.toHaveBeenCalled();
  });

  it('reports service failures and does not retry the transmission', async () => {
    const invokeReceiptOcr = createInvoker();
    invokeReceiptOcr.mockResolvedValue({ data: null, error: new Error('service unavailable') });

    await expectOcrFailure(
      extractReceiptData('file:///receipt.pdf', 'application/pdf', invokeReceiptOcr),
      'service_unavailable',
    );

    expect(invokeReceiptOcr).toHaveBeenCalledTimes(1);
  });

  it('reports malformed and empty recognition responses instead of returning silent empty data', async () => {
    const malformedInvoker = createInvoker();
    malformedInvoker.mockResolvedValue({ data: {}, error: null });

    await expectOcrFailure(
      extractReceiptData('file:///receipt.jpg', 'image/jpeg', malformedInvoker),
      'invalid_response',
    );

    const noTextInvoker = createInvoker();
    noTextInvoker.mockResolvedValue({ data: { rawText: '  \n ' }, error: null });

    await expectOcrFailure(
      extractReceiptData('file:///receipt.jpg', 'image/jpeg', noTextInvoker),
      'no_text_detected',
    );

    expect(malformedInvoker).toHaveBeenCalledTimes(1);
    expect(noTextInvoker).toHaveBeenCalledTimes(1);
  });

  it('still parses a successful response and transmits only once', async () => {
    const invokeReceiptOcr = createInvoker();
    invokeReceiptOcr.mockResolvedValue({
      data: { rawText: 'Prairie Therapy\nTOTAL $125.00' },
      error: null,
    });

    const result = await extractReceiptData(
      'file:///receipt.jpg',
      'image/jpeg',
      invokeReceiptOcr,
    );

    expect(result.businessName).toBe('Prairie Therapy');
    expect(result.amount).toBe(125);
    expect(invokeReceiptOcr).toHaveBeenCalledTimes(1);
    expect(invokeReceiptOcr).toHaveBeenCalledWith({
      content: 'cmVjZWlwdA==',
      mimeType: 'image/jpeg',
    });
  });
});
