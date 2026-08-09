import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Avatar, Chip, IconButton, Stack, Card,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { formatDistanceToNow } from 'date-fns';
import { useSnackbar } from 'notistack';
import type { NewsArticle } from '@apptypes/models';
import { useGetNewsQuery, useDeleteNewsMutation } from '@features/news/newsApi';
import NewsFormDialog from './NewsFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const NewsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useGetNewsQuery({ search: search || undefined });
  const [deleteNews] = useDeleteNewsMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [toDelete, setToDelete] = useState<NewsArticle | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (article: NewsArticle) => { setEditing(article); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteNews(toDelete.id).unwrap();
      enqueueSnackbar('Article deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete article', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  const columns: GridColDef<NewsArticle>[] = [
    {
      field: 'title',
      headerName: 'Article',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <Avatar variant="rounded" src={params.row.cover_image_url ?? undefined}>{params.row.title[0]}</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 320 }}>{params.row.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(params.row.published_at), { addSuffix: true })}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'flags',
      headerName: 'Flags',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          {params.row.is_breaking && <Chip size="small" color="error" label="Breaking" />}
          {params.row.is_trending && <Chip size="small" color="warning" label="Trending" />}
        </Stack>
      ),
    },
    { field: 'view_count', headerName: 'Views', width: 90 },
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>News</Typography>
          <Typography variant="body2" color="text.secondary">Publish station news and breaking stories</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Article</Button>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search articles…"
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

      <NewsFormDialog open={formOpen} article={editing} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete article"
        description={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default NewsPage;
