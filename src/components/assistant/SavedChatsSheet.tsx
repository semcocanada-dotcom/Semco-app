import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '@/components/ui';
import { Colors, Fonts, Layout, Radius, Spacing, TAP_TARGET_MIN, Typography } from '@/constants/theme';
import type { AssistantConversationSummary } from '@/hooks/useAssistant';

interface SavedChatsSheetProps {
  visible: boolean;
  chats: AssistantConversationSummary[];
  activeChatId: string;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export function SavedChatsSheet({
  visible,
  chats,
  activeChatId,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SavedChatsSheetProps) {
  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    onClose();
  };

  const confirmDelete = (chat: AssistantConversationSummary) => {
    Alert.alert(
      'Delete saved chat?',
      `This will delete "${chat.title}" and its messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteChat(chat.id),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <SafeAreaView style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Saved Chats</Text>
              <Text style={styles.subtitle}>Open prior install questions and answers.</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconBtn}
              accessibilityLabel="Close saved chats"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleNewChat}
            style={styles.newChatBtn}
            accessibilityLabel="Start a new chat"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={20} color={Colors.white} />
            <Text style={styles.newChatText}>New chat</Text>
          </TouchableOpacity>

          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="chatbubbles-outline"
                title="No saved chats"
                body="Ask a question and the chat will save automatically."
              />
            }
            renderItem={({ item }) => {
              const isActive = item.id === activeChatId;

              return (
                <View style={[styles.chatRow, isActive && styles.chatRowActive]}>
                  <TouchableOpacity
                    onPress={() => handleSelectChat(item.id)}
                    style={styles.chatOpen}
                    accessibilityLabel={`Open saved chat ${item.title}`}
                    accessibilityRole="button"
                  >
                    <View style={[styles.chatIcon, isActive && styles.chatIconActive]}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={20}
                        color={isActive ? Colors.white : Colors.primary}
                      />
                    </View>
                    <View style={styles.chatText}>
                      <Text style={styles.chatTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.chatPreview} numberOfLines={2}>
                        {item.lastMessagePreview}
                      </Text>
                      <Text style={styles.chatMeta}>
                        {formatChatDate(item.updatedAt)} | {item.messageCount} messages
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    style={styles.deleteBtn}
                    accessibilityLabel={`Delete saved chat ${item.title}`}
                    accessibilityRole="button"
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function formatChatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheetWrap: {
    backgroundColor: Colors.overlay,
  },
  sheet: {
    width: '100%',
    maxWidth: Layout.screenMaxWidth,
    alignSelf: 'center',
    maxHeight: '86%',
    backgroundColor: Colors.appBackground,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    color: Colors.navy,
    fontFamily: Fonts.bold,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  iconBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    borderRadius: TAP_TARGET_MIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newChatBtn: {
    minHeight: TAP_TARGET_MIN,
    borderRadius: Radius.md,
    backgroundColor: Colors.semcoOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  newChatText: {
    color: Colors.white,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  list: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
  },
  chatRowActive: {
    borderColor: Colors.lightTeal,
    backgroundColor: Colors.primaryMuted,
  },
  chatIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  chatIconActive: {
    backgroundColor: Colors.primary,
  },
  chatOpen: {
    flex: 1,
    minHeight: TAP_TARGET_MIN,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chatText: {
    flex: 1,
    gap: 3,
  },
  chatTitle: {
    color: Colors.navy,
    fontFamily: Fonts.semibold,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  chatPreview: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.sm,
    lineHeight: Typography.size.sm * 1.35,
  },
  chatMeta: {
    color: Colors.textDisabled,
    fontFamily: Fonts.regular,
    fontSize: Typography.size.xs,
  },
  deleteBtn: {
    width: TAP_TARGET_MIN,
    height: TAP_TARGET_MIN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
