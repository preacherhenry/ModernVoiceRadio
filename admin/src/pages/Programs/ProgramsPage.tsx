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
import type { Program } from '@apptypes/models';
import { useGetProgramsQuery, useDeleteProgramMutation } from '@features/programs/programsApi';
import ProgramFormDialog from './ProgramFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const ProgramsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useGetProgramsQuery({ search: search || undefined });
  const [deleteProgram] = useDeleteProgramMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [toDelete, setToDelete] = useState<Program | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (program: Program) => { setEditing(program); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProgram(toDelete.id).unwrap();
      enqueueSnackbar('Program deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete program', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Program>[] = [
    {
      field: 'title',
      headerName: 'Program',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar variant="rounded" src={params.row.cover_image_url ?? undefined}>{params.row.title[0]}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.title}</Typography>
            <Typography variant="caption" color="text.secondary">{params.row.category || '—'}</Typography>
          </Box>
        </Stack>
      ),
    },
    { field: 'description', headerName: 'Description', flex: 1.4, minWidth: 260, valueGetter: (_value, row) => row.description || '—' },
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
          <Typography variant="h4" fontWeight={700}>Programs</Typography>
          <Typography variant="body2" color="text.secondary">Manage on-air shows and their presenters</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Program</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search programs…"
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

      <ProgramFormDialog open={formOpen} program={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete program"
        description={`Are you sure you want to delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default ProgramsPage;
