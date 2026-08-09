import React, { useState } from 'react';
import {
  Box, Typography, Button, Avatar, Chip, IconButton, Stack, Card, Switch,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import type { Advertisement } from '@apptypes/models';
import { useGetAdvertisementsQuery, useDeleteAdvertisementMutation, useUpdateAdvertisementMutation } from '@features/advertisements/advertisementsApi';
import AdvertisementFormDialog from './AdvertisementFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const PLACEMENT_LABELS: Record<string, string> = {
  home_banner: 'Home Banner', interstitial: 'Interstitial', news_inline: 'News Inline',
};

const AdvertisementsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isFetching } = useGetAdvertisementsQuery();
  const [deleteAd] = useDeleteAdvertisementMutation();
  const [updateAd] = useUpdateAdvertisementMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [toDelete, setToDelete] = useState<Advertisement | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (ad: Advertisement) => { setEditing(ad); setFormOpen(true); };

  const toggleActive = async (ad: Advertisement) => {
    const formData = new FormData();
    formData.append('isActive', String(!ad.is_active));
    try {
      await updateAd({ id: ad.id, data: formData }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAd(toDelete.id).unwrap();
      enqueueSnackbar('Advertisement deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete advertisement', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<Advertisement>[] = [
    {
      field: 'title',
      headerName: 'Advertisement',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar variant="rounded" src={params.row.image_url} sx={{ width: 56, height: 32 }} />
          <Typography variant="body2" fontWeight={600}>{params.row.title}</Typography>
        </Stack>
      ),
    },
    {
      field: 'placement',
      headerName: 'Placement',
      width: 150,
      renderCell: (params) => <Chip size="small" label={PLACEMENT_LABELS[params.value] ?? params.value} />,
    },
    { field: 'impressions', headerName: 'Impressions', width: 120 },
    { field: 'clicks', headerName: 'Clicks', width: 100 },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <Switch size="small" checked={params.value} onChange={() => toggleActive(params.row)} />
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
          <Typography variant="h4" fontWeight={700}>Advertisements</Typography>
          <Typography variant="body2" color="text.secondary">Manage sponsored banners and in-app placements</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Advertisement</Button>
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

      <AdvertisementFormDialog open={formOpen} advertisement={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete advertisement"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default AdvertisementsPage;
