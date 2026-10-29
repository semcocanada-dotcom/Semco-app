import React from 'react';
import { FlatList, KeyboardAvoidingView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render } from '@testing-library/react-native';
import AssistantScreen from '../../../app/(app)/assistant';
import type { ConversationMessage } from '@/database/schema/conversations';

const SAFE_AREA = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function assistantTree() {
  return (
    <SafeAreaProvider initialMetrics={SAFE_AREA}>
      <AssistantScreen />
    </SafeAreaProvider>
  );
}

function renderAssistant() {
  return render(assistantTree());
}

const mockSend = jest.fn().mockResolvedValue(undefined);
const mockAssistantState = {
  messages: [] as ConversationMessage[], savedChats: [], conversationId: 'chat-1',
  conversationTitle: 'New chat', isLoading: false, isBusy: false, error: null as string | null,
  notSaved: false,
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
    mockAssistantState.notSaved = false;
    mockAssistantState.error = null;
  });

  it('offers plain-language trouble prompts without a paid AI or photo-analysis promise', () => {
    const screen = renderAssistant();
    expect(screen.getByText("Let's work through your job")).toBeTruthy();
    expect(screen.getByText(/Free, offline guidance/)).toBeTruthy();
    expect(screen.getByText(/offline guide/)).toBeTruthy();
    expect(screen.queryByText(/providers\//)).toBeNull();
    fireEvent.press(screen.getByLabelText('Ask: The coating is peeling. What should I check?'));
    expect(mockSend).toHaveBeenCalledWith('The coating is peeling. What should I check?');
  });

  it('does not send another starter while a reply is being prepared', () => {
    mockAssistantState.isLoading = true;
    const screen = renderAssistant();
    fireEvent.press(screen.getByLabelText('Ask: What is the difference between X-Bond and MicroBond?'));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('disables saved-chat and new-chat controls while a conversation operation is pending', () => {
    mockAssistantState.isBusy = true;
    const screen = renderAssistant();
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
    const screen = renderAssistant();
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
    screen.rerender(assistantTree());
    contentChanged();
    expect(scrollToEnd).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Jump to latest message'));
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
    scrollToEnd.mockClear();

    mockAssistantState.messages = [...mockAssistantState.messages, { ...reply, id: 'reply-3' }];
    screen.rerender(assistantTree());
    contentChanged();
    expect(scrollToEnd).toHaveBeenCalledWith({ animated: true });
    scrollToEnd.mockRestore();
  });

  it('derives the keyboard offset from the header and safe-area inset', () => {
    const screen = renderAssistant();
    fireEvent(screen.getByTestId('assistant-header'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 64 } },
    });
    const avoider = screen.UNSAFE_getByType(KeyboardAvoidingView);
    expect(avoider.props.keyboardVerticalOffset).toBe(64 + SAFE_AREA.insets.top);
    expect(avoider.props.keyboardVerticalOffset).not.toBe(90);
  });

  it('shows a small not-saved marker instead of a dead-end save error', () => {
    mockAssistantState.notSaved = true;
    const screen = renderAssistant();
    expect(screen.getByText('Not saved on this device')).toBeTruthy();
    expect(screen.queryByText(/could not be saved/)).toBeNull();
    expect(screen.getByText(/offline guide/)).toBeTruthy();
  });
});
