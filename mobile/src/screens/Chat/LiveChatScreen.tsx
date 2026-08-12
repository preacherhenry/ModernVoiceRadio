import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  StyleSheet, View, Text, Pressable, FlatList, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import ScreenContainer from '@components/common/ScreenContainer';
import { AuthWall, useRequiresAuth } from '@components/common/AuthRequired';
import Avatar from '@components/common/Avatar';
import AppButton from '@components/common/AppButton';
import LoadingIndicator from '@components/common/LoadingIndicator';
import ErrorState from '@components/common/ErrorState';
import EmptyState from '@components/common/EmptyState';

import { useAppSelector } from '@redux/hooks';
import { useGetChatHistoryQuery, useGetPinnedMessagesQuery, useGetChatLockStateQuery } from '@redux/api/chatApi';
import {
  sendChatMessage, onNewChatMessage, onChatModeration, onChatLockChanged, authenticateChatSocket,
} from '@services/chatSocketService';

import { useAppTheme } from '@theme/ThemeProvider';
import { spacing, radius } from '@constants/spacing';
import { fontFamily, fontSize, typeStyles } from '@constants/typography';
import { truncate, formatRelativeTime } from '@utils/formatters';
import type { ChatMessage } from '@apptypes/models';
import type { ProfileStackParamList } from '@navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'LiveChat'>;

const LiveChatScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const { status, user, accessToken } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  const isModerator = !!user && ['moderator', 'admin', 'super_admin'].includes(user.role);
  const { blocked, resolving } = useRequiresAuth();

  const {
    data: historyData, isLoading, isError, refetch,
  } = useGetChatHistoryQuery({ order: 'asc' });
  const { data: pinnedData } = useGetPinnedMessagesQuery();
  const pinnedMessages = pinnedData?.data ?? [];
  const { data: lockData } = useGetChatLockStateQuery();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const seededRef = useRef(false);
  const [draft, setDraft] = useState('');
  const [socketError, setSocketError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const lockSeededRef = useRef(false);
  const isLockedForMe = locked && !isModerator;

  useEffect(() => {
    if (historyData?.data && !seededRef.current) {
      setMessages(historyData.data);
      seededRef.current = true;
    }
  }, [historyData]);

  useEffect(() => {
    if (lockData?.data && !lockSeededRef.current) {
      setLocked(lockData.data.locked);
      lockSeededRef.current = true;
    }
  }, [lockData]);

  // The socket connects once and stays connected — if that happened before the access
  // token was ready (rehydration still in progress, or the user wasn't logged in yet),
  // or the token later refreshes, the connection needs to be explicitly re-authenticated.
  // It doesn't happen automatically.
  useEffect(() => {
    if (accessToken) authenticateChatSocket(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const unsubscribeNew = onNewChatMessage((message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    const unsubscribeMod = onChatModeration({
      onDeleted: (messageId) => setMessages((prev) => prev.filter((m) => m.id !== messageId)),
      onError: (message) => setSocketError(message),
    });
    const unsubscribeLock = onChatLockChanged((nextLocked) => setLocked(nextLocked));
    return () => {
      unsubscribeNew();
      unsubscribeMod();
      unsubscribeLock();
    };
  }, []);

  useEffect(() => {
    if (!socketError) return undefined;
    const timeout = setTimeout(() => setSocketError(null), 4000);
    return () => clearTimeout(timeout);
  }, [socketError]);

  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!isAuthenticated) {
      setSocketError(t('chat.signInPrompt'));
      return;
    }
    if (isLockedForMe) {
      setSocketError(t('chat.lockedMessage'));
      return;
    }
    sendChatMessage(trimmed);
    setDraft('');
  }, [draft, isAuthenticated, isLockedForMe, t]);

  const goToSignIn = useCallback(() => {
    (navigation.getParent()?.getParent() as any)?.navigate('Auth', { screen: 'Login' });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: ChatMessage }) => (
    <View style={styles.messageRow}>
      <Avatar uri={item.avatar_url} name={item.display_name} size={32} />
      <View style={[styles.messageBubble, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.messageHeaderRow}>
          <Text numberOfLines={1} style={[styles.displayName, { color: colors.primary }]}>{item.display_name}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
        <Text style={[styles.messageText, { color: colors.textPrimary }]}>{item.message}</Text>
      </View>
    </View>
  ), [colors]);

  // Guests get the sign-in wall instead of this feature. Placed after every hook
  // so hook order stays stable across the authenticated/guest branches.
  if (blocked) {
    return (
      <AuthWall
        resolving={resolving}
        titleKey="home.quickLinks.liveChat"
        descriptionKey="authGate.liveChat"
        icon="chat-processing-outline"
      />
    );
  }

  return (
    <ScreenContainer scroll={false} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flexFull}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
      >
        <View style={styles.header}>
          <Text style={[typeStyles.h2, { color: colors.textPrimary }]}>{t('home.quickLinks.liveChat')}</Text>
          <Text style={[typeStyles.body, { color: colors.textSecondary }]}>{t('chat.subtitle')}</Text>
        </View>

        {pinnedMessages.length > 0 && (
          <FlatList
            horizontal
            data={pinnedMessages}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pinnedList}
            renderItem={({ item }) => (
              <View style={[styles.pinnedChip, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons name="pin" size={12} color={colors.primary} />
                <Text numberOfLines={1} style={[styles.pinnedChipText, { color: colors.textPrimary }]}>
                  {truncate(item.message, 60)}
                </Text>
              </View>
            )}
          />
        )}

        <View style={styles.listWrap}>
          {isLoading && messages.length === 0 ? (
            <LoadingIndicator fullscreen />
          ) : isError && messages.length === 0 ? (
            <ErrorState onRetry={refetch} />
          ) : messages.length === 0 ? (
            <EmptyState icon="chat-outline" title={t('chat.emptyTitle')} description={t('chat.emptyDescription')} />
          ) : (
            <FlatList
              data={invertedMessages}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {!!socketError && (
          <View style={[styles.errorBanner, { backgroundColor: colors.error }]}>
            <Text style={styles.errorBannerText}>{socketError}</Text>
          </View>
        )}

        {!isAuthenticated ? (
          <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <AppButton label={t('chat.signInPrompt')} onPress={goToSignIn} style={styles.signInButton} />
          </View>
        ) : isLockedForMe ? (
          <View style={[styles.inputRow, styles.lockedRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.lockedText, { color: colors.textMuted }]}>{t('chat.lockedMessage')}</Text>
          </View>
        ) : (
          <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.textInput, { color: colors.textPrimary, backgroundColor: colors.surfaceVariant }]}
              placeholder={t('chat.messagePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!draft.trim()}
              style={[styles.sendButton, { backgroundColor: colors.primary }, !draft.trim() && styles.sendButtonDisabled]}
            >
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flexFull: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  pinnedList: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingBottom: spacing.sm },
  pinnedChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 6,
    borderRadius: radius.pill, maxWidth: 220,
  },
  pinnedChipText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs, flexShrink: 1 },
  listWrap: { flex: 1 },
  messagesContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  messageRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm, alignItems: 'flex-start' },
  messageBubble: { flex: 1, borderRadius: radius.md, padding: spacing.sm },
  messageHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  displayName: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, flexShrink: 1 },
  time: { fontFamily: fontFamily.body, fontSize: 10 },
  messageText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, marginTop: 2 },
  errorBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.xs, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: spacing.sm },
  errorBannerText: { color: '#FFFFFF', fontFamily: fontFamily.bodyMedium, fontSize: fontSize.xs, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm, paddingBottom: Platform.OS === 'ios' ? 100 : 80, borderTopWidth: StyleSheet.hairlineWidth,
  },
  lockedRow: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  lockedText: { fontFamily: fontFamily.bodyMedium, fontSize: fontSize.sm },
  textInput: {
    flex: 1, borderRadius: radius.lg, paddingHorizontal: spacing.sm, paddingVertical: 10,
    maxHeight: 100, fontFamily: fontFamily.body, fontSize: fontSize.base,
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
  signInButton: { flex: 1 },
});

export default LiveChatScreen;
