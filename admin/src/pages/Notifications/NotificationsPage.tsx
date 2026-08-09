import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, Stack, Card,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';
import type { NotificationItem } from '@apptypes/models';
import { useGetNotificationsQuery } from '@features/notifications/notificationsApi';
import ComposeNotificationDialog from './ComposeNotificationDialog';

const TYPE_COLORS: Record<string, 'default' | 'error' | 'info' | 'success'> = {
  breaking_news: 'error', live_show: 'info', new_podcast: 'success', announcement: 'default',
};

const NotificationsPage: React.FC = () => {
  const { data, isLoading, isFetching } = useGetNotificationsQuery();
  const [composeOpen, setComposeOpen] = useState(false);

  const columns: GridColDef<NotificationItem>[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 220 },
    { field: 'body', headerName: 'Message', flex: 1.4, minWidth: 260 },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => <Chip size="small" label={params.value} color={TYPE_COLORS[params.value] ?? 'default'} />,
    },
    { field: 'target_topic', headerName: 'Audience', width: 130 },
    {
      field: 'sent_at',
      headerName: 'Sent',
      width: 180,
      valueFormatter: (value) => (value ? format(new Date(value as string), 'MMM d, yyyy · h:mm a') : '—'),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Broadcast push notifications to the mobile app</Typography>
        </Box>
        <Button variant="contained" startIcon={<SendIcon />} onClick={() => setComposeOpen(true)}>Compose Notification</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <DataGrid
          autoHeight
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          getRowHeight={() => 64}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Card>

      <ComposeNotificationDialog open={composeOpen} onClose={() => setComposeOpen(false)} />
    </Box>
  );
};

export default NotificationsPage;
