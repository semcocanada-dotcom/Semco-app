import React from 'react';
import { FlatList } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import AssistantScreen from '../../../app/(app)/assistant';
import type { ConversationMessage } from '@/database/schema/conversations';

const mockSend = jest.fn().mockResolvedValue(undefined);
const mockAssistantState = {
  messages: [] as ConversationMessage[], savedChats: [], conversationId: 'chat-1',
  conversationTitle: 'New chat', isLoading: false, isBusy: false, error: null,
  send: mockSend, clearHistory: jest.fn(), startNewChat: jest.fn(), selectChat: jest.fn(), deleteChat: jest.fn(),
};
jest.mock('@/hooks/useAssistant', () => ({ useAssistant: () => mockAssistantState }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), canGoBack: () => false }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@/utils/haptics', () => ({ lightImpactHaptic: jest.fn(), mediumImpactHaptic: jest.fn(), selectionHaptic: jest.fn() }));
jest.mock('./ChatBubble', () => ({ ChatBubble: () => null }));
jest.mock('./TypingIndicator', () => ({ TypingIndicator: () => null }));
jest.mock('./SavedChatsSheet', () => ({ SavedChatsSheet: () => null }));

const reply: ConversationMessage = {
  id: 'reply-1', role: 'assistant', content: 'Let us work through it.',
  source: 'local_guide', timestamp: '2026-09-08T12:00:00Z',
};

describe('AssistantScreen offline guide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssistantState.messages = [];
    mockAssistantState.isLoading = false;
    mockAssistantState.isBusy = false;
  });

  it('offers plain-language trouble prompts without a paid AI or photo-analysis promise', () => {
    const screen = render(<AssistantScreen />);
    expect(screen.getByText("Let's work through your job")).toBeTruthy();
    expect(screen.getByText(/Free, offline guidance/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Ask: The coating is peeling. What should I check?'));
    expect(mockSend).toHaveBeenCalledWith('The coating is peeling. What should I check?');
  });

  it('does not send another starter while a reply is being prepared', () => {
    mockAssistantState.isLoading = true;
    const screen = render(<AssistantScreen />);
    fireEvent.press(screen.getByLabelText('Ask: What is the difference between X-Bond and MicroBond?'));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('disables saved-chat and new-chat controls while a conversation operation is pending', () => {
    mockAssistantState.isBusy = true;
    const screen = render(<AssistantScreen />);
    expect(screen.getByLabelText('Open saved chats').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByLabelText('Start new chat').props.accessibilityState.disabled).toBe(true);
    fireEvent.press(screen.getByLabelText('Start new chat'));
    expect(mockAssistantState.startNewChat).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Ask: What is the difference between X-Bond and MicroBond?'));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('follows new messages near the end but leaves reading and expanded references in place', () => {
    const scrollToEnd = jest.spyOn(FlatList.prototype, 'scrollToEnd').mockImplementation(() => {});
    mockAssistantState.messages = [reply];
    const screen = render(<AssistantScreen />);
    const contentChanged = () => fireEvent(screen.UNSAFE_getByType(FlatList), 'contentSizeChange', 400, 2000);
    contentChanged();
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: false });
    scrollToEnd.mockClear();

    contentChanged(); // Expanding an existing answer does not add a message.
    expect(scrollToEnd).not.toHaveBeenCalled();
    fireEvent.scroll(screen.UNSAFE_getByType(FlatList), {
      nativeEvent: { contentSize: { height: 2000 }, layoutMeasurement: { height: 600 }, contentOffset: { y: 100 } },
    });
    mockAssistantState.messages = [reply, { ...reply, id: 'reply-2' }];
    screen.rerender(<AssistantScreen />);
    contentChanged();
    expect(scrollToEnd).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Jump to latest message'));
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
    scrollToEnd.mockClear();

    mockAssistantState.messages = [...mockAssistantState.messages, { ...reply, id: 'reply-3' }];
    screen.rerender(<AssistantScreen />);
    contentChanged();
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
    scrollToEnd.mockRestore();
  });
});
