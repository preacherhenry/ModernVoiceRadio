import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Stack, Card, Switch, Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import type { AudioStream } from '@apptypes/models';
import {
  useGetAudioStreamsQuery, useDeleteAudioStreamMutation, useUpdateAudioStreamMutation,
} from '@features/audioStreams/audioStreamsApi';
import AudioStreamFormDialog from './AudioStreamFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const AudioStreamsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isFetching } = useGetAudioStreamsQuery();
  const [deleteStream] = useDeleteAudioStreamMutation();
  const [updateStream] = useUpdateAudioStreamMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AudioStream | null>(null);
  const [toDelete, setToDelete] = useState<AudioStream | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (stream: AudioStream) => { setEditing(stream); setFormOpen(true); };

  const toggleActive = async (stream: AudioStream) => {
    try {
      await updateStream({ id: stream.id, data: { isActive: !stream.is_active } }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    enqueueSnackbar('Stream URL copied', { variant: 'success' });
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteStream(toDelete.id).unwrap();
      enqueueSnackbar('Stream deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete stream', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<AudioStream>[] = [
    {
      field: 'name',
      headerName: 'Stream',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={600}>{params.row.name}</Typography>
          {params.row.is_default && <Chip size="small" color="primary" label="Default" />}
        </Stack>
      ),
    },
    { field: 'protocol', headerName: 'Protocol', width: 110, renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" /> },
    {
      field: 'url',
      headerName: 'Stream URL',
      flex: 1.4,
      minWidth: 240,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>{params.value}</Typography>
          <Tooltip title="Copy URL">
            <IconButton size="small" onClick={() => copyUrl(params.value as string)}>
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    { field: 'bitrate_kbps', headerName: 'Bitrate', width: 100, valueFormatter: (value) => `${value} kbps` },
    { field: 'format', headerName: 'Format', width: 90 },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 90,
      renderCell: (params) => <Switch size="small" checked={params.value} onChange={() => toggleActive(params.row)} />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton size="small" onClick={() => openEdit(params.row)}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setToDelete(params.row)}><DeleteIcon fontSize="small" /></IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Audio Streams</Typography>
          <Typography variant="body2" color="text.secondary">Manage Icecast / SHOUTcast / HLS stream endpoints</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Stream</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <DataGrid
          autoHeight
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          getRowHeight={() => 60}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Card>

      <AudioStreamFormDialog open={formOpen} stream={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete audio stream"
        description={toDelete?.is_default
          ? `"${toDelete?.name}" is currently the DEFAULT stream — deleting it may interrupt live playback for listeners until a new default is set. Continue?`
          : `Delete "${toDelete?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default AudioStreamsPage;
