import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAssistant } from './useAssistant';
import type { Conversation, ConversationMessage } from '@/database/schema/conversations';

const mockSendMessage = jest.fn();
let mockRows: Conversation[] = [];
let mockNextId = 0;
type Predicate = (row: Conversation) => boolean;
const mockLimit = jest.fn((filter: Predicate, count: number) => Promise.resolve(mockRows.filter(filter).slice(0, count)));
const mockInsert = jest.fn((row: Conversation) => { mockRows.push(row); return Promise.resolve(); });
const mockUpdate = jest.fn((values: Partial<Conversation>, filter: Predicate) => {
  mockRows = mockRows.map((row) => filter(row) ? { ...row, ...values } : row);
  return Promise.resolve();
});
const mockDelete = jest.fn((filter: Predicate) => {
  mockRows = mockRows.filter((row) => !filter(row));
  return Promise.resolve();
});
jest.mock('@/services/ai/assistant', () => ({ sendMessage: (...args: unknown[]) => mockSendMessage(...args) }));
jest.mock('@/store/auth', () => ({ useAuthStore: (select: (state: unknown) => unknown) => select({ user: { id: 'installer-1' } }) }));
jest.mock('@/utils/id', () => ({ createLocalId: () => `new-chat-${++mockNextId}` }));
jest.mock('@/database/schema/conversations', () => ({ conversations: { id: 'id', installerId: 'installerId', updatedAt: 'updatedAt' } }));
jest.mock('drizzle-orm', () => ({
  eq: (key: keyof Conversation, value: string) => (row: Conversation) => row[key] === value,
  and: (...filters: Predicate[]) => (row: Conversation) => filters.every((filter) => filter(row)),
  desc: (value: string) => value,
}));
jest.mock('@/database/client', () => ({ db: {
  select: () => ({ from: () => ({ where: (filter: Predicate) => ({
    orderBy: () => Promise.resolve(mockRows.filter(filter)),
    limit: (count: number) => mockLimit(filter, count),
  }) }) }),
  insert: () => ({ values: (row: Conversation) => mockInsert(row) }),
  update: () => ({ set: (values: Partial<Conversation>) => ({ where: (filter: Predicate) => mockUpdate(values, filter) }) }),
  delete: () => ({ where: (filter: Predicate) => mockDelete(filter) }),
} }));

const msg = (content: string, id = content): ConversationMessage => ({ id, content, role: 'user', source: 'local_guide', timestamp: '2026-09-08' });
const chat = (id: string): Conversation => ({
  id, installerId: 'installer-1', title: `Job ${id}`, messages: [msg(`Original ${id}`)],
  createdAt: '2026-09-08', updatedAt: '2026-09-08',
});
const response = { content: 'Checked next step', source: 'local_guide', isOffline: true };
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { resolve, promise };
}
async function openHook() {
  const hook = renderHook(() => useAssistant());
  await waitFor(() => expect(hook.result.current.conversationId).toBe('A'));
  await waitFor(() => expect(hook.result.current.isBusy).toBe(false));
  return hook;
}

describe('useAssistant conversation operation safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRows = [chat('A'), chat('B')];
    mockNextId = 0;
    mockSendMessage.mockReset().mockResolvedValue(response);
  });

  it('blocks same-render double sends, switching, new, clear and delete until the answer is saved', async () => {
    const pending = deferred<typeof response>();
    mockSendMessage.mockReturnValueOnce(pending.promise);
    const { result } = await openHook();
    let sending!: Promise<void>;
    act(() => {
      sending = result.current.send('Question for A');
      void result.current.send('Duplicate tap');
    });
    await waitFor(() => expect(mockSendMessage).toHaveBeenCalledTimes(1));
    await act(async () => {
      await result.current.selectChat('B');
      await result.current.startNewChat();
      await result.current.clearHistory();
      await result.current.deleteChat('A');
    });
    expect(result.current.conversationId).toBe('A');
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(mockRows.find((row) => row.id === 'B')!.messages).toEqual([msg('Original B')]);
    await act(async () => { pending.resolve(response); await sending; });
    expect(result.current.messages.at(-1)?.content).toBe(response.content);
    expect(result.current.isBusy).toBe(false);
    await act(async () => { await result.current.selectChat('B'); });
    expect(result.current.messages).toEqual([msg('Original B')]);
    expect(result.current.conversationTitle).toBe('Job B');
  });

  it('blocks sending while a selected chat is still loading', async () => {
    const { result } = await openHook();
    const pending = deferred<Conversation[]>();
    mockLimit.mockReturnValueOnce(pending.promise);
    let switching!: Promise<void>;
    act(() => { switching = result.current.selectChat('B'); });
    await act(async () => { await result.current.send('Must not use A context'); });
    expect(mockSendMessage).not.toHaveBeenCalled();
    await act(async () => { pending.resolve([chat('B')]); await switching; });
    expect(result.current.messages).toEqual([msg('Original B')]);
  });

  it('uses the current snapshot even when an old send handler is invoked after new chat', async () => {
    const { result } = await openHook();
    const olderSend = result.current.send;
    await act(async () => { await result.current.startNewChat(); });
    expect(result.current.conversationId).toBe('new-chat-1');
    await act(async () => { await olderSend('Brand new job'); });
    expect(mockSendMessage).toHaveBeenCalledWith('Brand new job', []);
    expect(mockRows.find((row) => row.id === 'A')!.messages).toEqual([msg('Original A')]);
    expect(result.current.messages.map((item) => item.content)).toEqual(['Brand new job', response.content]);
  });

  it('retains all saved messages and lesson metadata without forgetting old job facts', async () => {
    const previous = Array.from({ length: 100 }, (_, i) => msg(`Saved ${i}`));
    mockRows[0].messages = previous;
    const guideLesson = { intro: 'Check first', steps: ['One', 'Two'], cursor: 0, safetyNote: 'Stop if unsure' };
    mockSendMessage.mockResolvedValueOnce({ ...response, guideLesson });
    const { result } = await openHook();
    await act(async () => { await result.current.send('Next question'); });
    expect(mockSendMessage.mock.calls[0][1]).toHaveLength(100);
    expect(result.current.messages).toHaveLength(102);
    expect(result.current.messages[0]).toEqual(previous[0]);
    expect(result.current.messages.at(-1)?.guideLesson).toEqual(guideLesson);
    expect(mockRows[0].messages).toHaveLength(102);
  });

  it('still answers when the first save fails, then clears the marker if the retry saves', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = await openHook();
    mockUpdate.mockRejectedValueOnce(new Error('Storage failed'));
    await act(async () => { await result.current.send('  Question that cannot save  '); });
    expect(mockSendMessage).toHaveBeenCalledWith('Question that cannot save', [msg('Original A')]);
    expect(result.current.messages.at(-1)?.content).toBe(response.content);
    expect(result.current.notSaved).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isBusy).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(mockRows.find((row) => row.id === 'A')?.messages).toHaveLength(3);
    warning.mockRestore();
  });

  it('shows a not-saved marker instead of blocking when every save fails', async () => {
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = await openHook();
    mockUpdate.mockRejectedValue(new Error('Storage failed'));
    await act(async () => { await result.current.send('Question that cannot save'); });
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(result.current.messages.at(-1)?.content).toBe(response.content);
    expect(result.current.notSaved).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isBusy).toBe(false);
    await act(async () => { await result.current.startNewChat(); });
    expect(result.current.conversationId).toBe('new-chat-1');
    expect(result.current.notSaved).toBe(false);
    warning.mockRestore();
  });
});
