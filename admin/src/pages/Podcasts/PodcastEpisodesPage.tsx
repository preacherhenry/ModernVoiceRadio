import React, { useState } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Stack, Card, Avatar,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { PodcastEpisode } from '@apptypes/models';
import {
  useGetEpisodesQuery, useGetPodcastQuery, useDeleteEpisodeMutation,
} from '@features/podcasts/podcastsApi';
import EpisodeFormDialog from './EpisodeFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  return hrs > 0
    ? `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${mins}:${String(secs).padStart(2, '0')}`;
}

const PodcastEpisodesPage: React.FC = () => {
  const { podcastId = '' } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: podcastData } = useGetPodcastQuery(podcastId, { skip: !podcastId });
  const { data, isLoading, isFetching } = useGetEpisodesQuery({ podcastId }, { skip: !podcastId });
  const [deleteEpisode] = useDeleteEpisodeMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PodcastEpisode | null>(null);
  const [toDelete, setToDelete] = useState<PodcastEpisode | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (episode: PodcastEpisode) => { setEditing(episode); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteEpisode(toDelete.id).unwrap();
      enqueueSnackbar('Episode deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete episode', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<PodcastEpisode>[] = [
    {
      field: 'title',
      headerName: 'Episode',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar variant="rounded" src={params.row.cover_image_url ?? undefined}>{params.row.title[0]}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.title}</Typography>
            {!!params.row.episode_number && <Typography variant="caption" color="text.secondary">Ep. {params.row.episode_number}</Typography>}
          </Box>
        </Stack>
      ),
    },
    { field: 'duration_seconds', headerName: 'Duration', width: 110, valueFormatter: (value) => formatDuration(value as number) },
    { field: 'play_count', headerName: 'Plays', width: 100 },
    {
      field: 'is_published',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Published' : 'Draft'} color={params.value ? 'success' : 'default'} variant="outlined" />
      ),
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/podcasts')} sx={{ mb: 2 }}>Back to Podcasts</Button>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>{podcastData?.data?.title ?? 'Episodes'}</Typography>
          <Typography variant="body2" color="text.secondary">Manage episodes for this podcast</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Episode</Button>
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

      <EpisodeFormDialog open={formOpen} podcastId={podcastId} episode={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete episode"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default PodcastEpisodesPage;
