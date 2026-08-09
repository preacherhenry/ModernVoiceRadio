import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import {
  Box, Typography, Card, Stack, TextField, Button, IconButton, Avatar, Chip,
  Switch, FormControlLabel, Tooltip, Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import type { ChatMessage } from '@apptypes/models';
import {
  useGetChatMessagesQuery, useSendChatMessageMutation, useDeleteChatMessageMutation,
  usePinChatMessageMutation, useGetChatLockStateQuery, useSetChatLockStateMutation,
} from '@features/chat/chatApi';
import { onChatLiveUpdates } from '@services/chatSocket';

const LiveChatPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: historyData, isLoading } = useGetChatMessagesQuery({ order: 'asc' });
  const { data: lockData } = useGetChatLockStateQuery();
  const [sendMessage, { isLoading: sending }] = useSendChatMessageMutation();
  const [deleteMessage] = useDeleteChatMessageMutation();
  const [pinMessage] = usePinChatMessageMutation();
  const [setLockState, { isLoading: togglingLock }] = useSetChatLockStateMutation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const seededRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const lockSeededRef = useRef(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const unsubscribe = onChatLiveUpdates({
      onNewMessage: (message) => {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      },
      onDeleted: (id) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      },
      onPinned: (message) => {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
      },
      onLockChanged: (nextLocked) => setLocked(nextLocked),
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const pinnedCount = useMemo(() => messages.filter((m) => m.is_pinned).length, [messages]);

  const handleSend = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    try {
      await sendMessage(trimmed).unwrap();
      setDraft('');
    } catch {
      enqueueSnackbar('Failed to send message', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id).unwrap();
    } catch {
      enqueueSnackbar('Failed to delete message', { variant: 'error' });
    }
  };

  const handleTogglePin = async (message: ChatMessage) => {
    try {
      await pinMessage({ id: message.id, isPinned: !message.is_pinned }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update pin status', { variant: 'error' });
    }
  };

  const handleToggleLock = async () => {
    const next = !locked;
    try {
      await setLockState(next).unwrap();
      enqueueSnackbar(next ? 'Chat locked — only moderators can send messages' : 'Chat unlocked', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update chat lock', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Live Chat</Typography>
          <Typography variant="body2" color="text.secondary">
            Moderate the live chat, post as the station, and lock it when needed
            {pinnedCount > 0 ? ` · ${pinnedCount} pinned` : ''}
          </Typography>
        </Box>
        <Tooltip title={locked ? 'Only moderators/admins can currently send messages' : 'Anyone signed in can currently send messages'}>
          <FormControlLabel
            control={(
              <Switch
                checked={locked}
                onChange={handleToggleLock}
                disabled={togglingLock}
                color="error"
              />
            )}
            label={(
              <Stack direction="row" alignItems="center" gap={0.5}>
                {locked ? <LockIcon fontSize="small" color="error" /> : <LockOpenIcon fontSize="small" color="success" />}
                <Typography variant="body2" fontWeight={600}>{locked ? 'Locked' : 'Open'}</Typography>
              </Stack>
            )}
          />
        </Tooltip>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Box
          ref={scrollRef}
          sx={{
            height: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5, px: 1,
          }}
        >
          {isLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ m: 'auto' }}>Loading messages…</Typography>
          ) : messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ m: 'auto' }}>No messages yet.</Typography>
          ) : (
            messages.map((message) => (
              <Stack key={message.id} direction="row" spacing={1.5} alignItems="flex-start">
                <Avatar src={message.avatar_url ?? undefined} sx={{ width: 32, height: 32 }}>
                  {message.display_name?.[0]?.toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    flex: 1, bgcolor: message.is_pinned ? 'warning.light' : 'action.hover', borderRadius: 2, p: 1.25,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={700}>{message.display_name}</Typography>
                      {message.is_pinned && <Chip size="small" label="Pinned" color="warning" />}
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </Typography>
                    </Stack>
                    <Stack direction="row">
                      <Tooltip title={message.is_pinned ? 'Unpin' : 'Pin'}>
                        <IconButton size="small" onClick={() => handleTogglePin(message)}>
                          {message.is_pinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(message.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{message.message}</Typography>
                </Box>
              </Stack>
            ))
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Post as the station…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          />
          <Button variant="contained" onClick={handleSend} disabled={sending || !draft.trim()}>Send</Button>
        </Stack>
      </Card>
    </Box>
  );
};

export default LiveChatPage;
