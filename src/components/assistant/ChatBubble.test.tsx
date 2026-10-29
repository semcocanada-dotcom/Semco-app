import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking, Alert } from 'react-native';
import { GUIDE_VIDEOS } from '@/knowledge/guide-videos';
import { ChatBubble } from './ChatBubble';
import type { ConversationMessage } from '@/database/schema/conversations';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/utils/haptics', () => ({ lightImpactHaptic: jest.fn() }));
jest.mock('react-native-markdown-display', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text>{children}</Text>;
  },
  MarkdownIt: () => ({}),
}));
jest.mock('@/knowledge/technical-docs', () => ({
  TECHNICAL_DOCS: [{ id: 'doc-prep', title: 'Prep manual', sourceDocument: 'Prep.pdf' }],
  TECHNICAL_DOC_PAGES: [{ docId: 'doc-prep', sourceDocument: 'Prep.pdf', pageNumber: 2, text: 'The saved page wording.' }],
}));
jest.mock('@/knowledge/doc-catalog', () => ({ getPrimaryDocGroup: () => 'manuals' }));

const message: ConversationMessage = {
  id: 'reply-1', role: 'assistant', content: 'Let us check the surface first.',
  source: 'local_guide', timestamp: '2026-09-08T12:00:00Z',
  citations: [{ id: 'ref-1', documentName: 'Prep.pdf', title: 'Prep manual', pageNumber: 2, docId: 'doc-prep' }],
};

describe('ChatBubble references', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps references unobtrusive and opens the actual saved page on request', () => {
    const screen = render(<ChatBubble message={message} />);
    expect(screen.queryByText('Prep manual · p. 2')).toBeNull();
    fireEvent.press(screen.getByLabelText('Show references'));
    expect(screen.queryByText('The saved page wording.')).toBeNull();
    fireEvent.press(screen.getByLabelText('Read saved reference Prep manual · p. 2'));
    expect(screen.getByText('The saved page wording.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Browse Product Docs for Prep manual · p. 2'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/products', params: { group: 'manuals' } });
  });

  it('does not invent an open action from an unknown document ID', () => {
    const screen = render(<ChatBubble message={{ ...message, citations: [{
      id: 'unknown', docId: 'not-a-real-doc', documentName: 'Field rule', pageNumber: 1,
    }] }} />);
    fireEvent.press(screen.getByLabelText('Show references'));
    expect(screen.getByText('Field rule · p. 1')).toBeTruthy();
    expect(screen.getByText('Reference label only; the page text is not saved here.')).toBeTruthy();
    expect(screen.queryByLabelText(/Read saved reference/)).toBeNull();
    expect(screen.queryByLabelText(/Browse Product Docs/)).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps page numbers distinct, deduplicates identical references, and does not substitute page one', () => {
    const screen = render(<ChatBubble message={{ ...message, citations: [
      message.citations![0], { ...message.citations![0], id: 'duplicate' },
      { ...message.citations![0], id: 'missing-page', pageNumber: 5 },
    ] }} />);
    expect(screen.getByText('References (2)')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Show references'));
    expect(screen.queryByLabelText('Read saved reference Prep manual · p. 5')).toBeNull();
  });

  it('does not add reference controls to an installer message', () => {
    const screen = render(<ChatBubble message={{ ...message, role: 'user' }} />);
    expect(screen.queryByLabelText('Show references')).toBeNull();
  });

  it('preserves attribution in older chats without structured citations', () => {
    const screen = render(<ChatBubble message={{
      ...message, citations: undefined, content: 'Check the surface.\n\nSource: Prep.pdf p2',
    }} />);
    expect(screen.getByText(/Source: Prep.pdf p2/)).toBeTruthy();
  });

  it('renders dealer summaries as selectable text without sending anything', () => {
    const content = 'Here is a draft you can copy to your SEMCO dealer. Nothing has been sent.\n\nIssue: Peeling.';
    const screen = render(<ChatBubble message={{ ...message, provider: 'local-instructor', content, citations: [] }} />);
    expect(screen.getByText(content).props.selectable).toBe(true);
    expect(screen.getByText('Long-press the draft to select and copy it.')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens a verified video only after an explicit tap', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    const video = GUIDE_VIDEOS[0];
    const screen = render(<ChatBubble message={{ ...message, videos: [video] }} />);
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText(/Internet is needed to watch/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText(`Watch ${video.title} on YouTube`));
    await waitFor(() => expect(open).toHaveBeenCalledWith(video.url));
    open.mockRestore();
  });

  it('does not open arbitrary URLs planted in saved video metadata', () => {
    const video = { ...GUIDE_VIDEOS[0], url: 'javascript:alert(1)' };
    const screen = render(<ChatBubble message={{ ...message, videos: [video] }} />);
    expect(screen.queryByLabelText(/Watch .* on YouTube/)).toBeNull();
  });

  it('shows a useful message if a video cannot open', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('offline'));
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const video = GUIDE_VIDEOS[0];
    const screen = render(<ChatBubble message={{ ...message, videos: [video] }} />);
    fireEvent.press(screen.getByLabelText(`Watch ${video.title} on YouTube`));
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Could not open video', expect.any(String)));
    open.mockRestore();
    alert.mockRestore();
  });
});
