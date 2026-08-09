import React, { useState } from 'react';
import {
  Box, Typography, Card, Stack, Select, MenuItem, Chip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import type { SongRequest } from '@apptypes/models';
import { useGetSongRequestsQuery, useUpdateSongRequestStatusMutation } from '@features/songRequests/songRequestsApi';

const STATUS_OPTIONS: SongRequest['status'][] = ['pending', 'approved', 'played', 'rejected'];
const STATUS_COLORS: Record<SongRequest['status'], 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  pending: 'warning', approved: 'info', played: 'success', rejected: 'error',
};

const SongRequestsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data, isLoading, isFetching } = useGetSongRequestsQuery(statusFilter === 'all' ? undefined : { status: statusFilter });
  const [updateStatus] = useUpdateSongRequestStatusMutation();

  const handleStatusChange = async (id: string, status: SongRequest['status']) => {
    try {
      await updateStatus({ id, status }).unwrap();
      enqueueSnackbar('Status updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const columns: GridColDef<SongRequest>[] = [
    { field: 'requester_name', headerName: 'Requested By', flex: 1, minWidth: 160 },
    { field: 'song_title', headerName: 'Song', flex: 1, minWidth: 180 },
    { field: 'artist_name', headerName: 'Artist', flex: 1, minWidth: 160 },
    { field: 'message', headerName: 'Message', flex: 1.4, minWidth: 200, valueGetter: (_value, row) => row.message || '—' },
    {
      field: 'created_at',
      headerName: 'Submitted',
      width: 150,
      valueFormatter: (value) => formatDistanceToNow(new Date(value as string), { addSuffix: true }),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value as SongRequest['status'])}
          renderValue={(value) => <Chip size="small" label={value} color={STATUS_COLORS[value as SongRequest['status']]} />}
          sx={{ width: '100%' }}
        >
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </Select>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Song Requests</Typography>
          <Typography variant="body2" color="text.secondary">Listener song requests submitted from the mobile app</Typography>
        </Box>
        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
        </Select>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <DataGrid
          autoHeight
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          getRowHeight={() => 56}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field: 'created_at', sort: 'desc' }] } }}
        />
      </Card>
    </Box>
  );
};

export default SongRequestsPage;
