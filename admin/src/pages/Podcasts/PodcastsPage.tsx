import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Avatar, Chip, IconButton, Stack, Card, Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { Podcast } from '@apptypes/models';
import { useGetPodcastsQuery, useDeletePodcastMutation } from '@features/podcasts/podcastsApi';
import PodcastFormDialog from './PodcastFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const PodcastsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useGetPodcastsQuery({ search: search || undefined });
  const [deletePodcast] = useDeletePodcastMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [toDelete, setToDelete] = useState<Podcast | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (podcast: Podcast) => { setEditing(podcast); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePodcast(toDelete.id).unwrap();
      enqueueSnackbar('Podcast deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete podcast', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Podcast>[] = [
    {
      field: 'title',
      headerName: 'Podcast',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar variant="rounded" src={params.row.cover_image_url ?? undefined}>{params.row.title[0]}</Avatar>
          <Typography variant="body2" fontWeight={600}>{params.row.title}</Typography>
        </Stack>
      ),
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 110,
      renderCell: (params) => (params.value ? <Chip size="small" color="primary" label="Featured" /> : null),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip size="small" label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} variant="outlined" />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <Tooltip title="Manage episodes">
            <IconButton size="small" onClick={() => navigate(`/podcasts/${params.row.id}/episodes`)}>
              <QueueMusicIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
          <Typography variant="h4" fontWeight={700}>Podcasts</Typography>
          <Typography variant="body2" color="text.secondary">Manage podcast series and episodes</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Podcast</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search podcasts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: 320 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
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

      <PodcastFormDialog open={formOpen} podcast={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete podcast"
        description={`Delete "${toDelete?.title}" and all of its episodes? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default PodcastsPage;
