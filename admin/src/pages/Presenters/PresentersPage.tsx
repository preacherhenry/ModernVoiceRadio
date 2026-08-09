import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Avatar, Chip, IconButton, Stack, Card,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import type { Presenter } from '@apptypes/models';
import { useGetPresentersQuery, useDeletePresenterMutation } from '@features/presenters/presentersApi';
import PresenterFormDialog from './PresenterFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const PresentersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useGetPresentersQuery({ search: search || undefined });
  const [deletePresenter] = useDeletePresenterMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Presenter | null>(null);
  const [toDelete, setToDelete] = useState<Presenter | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (presenter: Presenter) => { setEditing(presenter); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePresenter(toDelete.id).unwrap();
      enqueueSnackbar('Presenter deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete presenter', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Presenter>[] = [
    {
      field: 'full_name',
      headerName: 'Presenter',
      flex: 1,
      minWidth: 240,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar src={params.row.photo_url ?? undefined}>{params.row.full_name[0]}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.role_title || '—'}</Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200, valueGetter: (_value, row) => row.email || '—' },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 120,
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
          <Typography variant="h4" fontWeight={700}>Presenters</Typography>
          <Typography variant="body2" color="text.secondary">Manage on-air talent profiles</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Presenter</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search presenters…"
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

      <PresenterFormDialog open={formOpen} presenter={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete presenter"
        description={`Are you sure you want to delete "${toDelete?.full_name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default PresentersPage;
