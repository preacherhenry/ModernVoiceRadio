import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, ImageList, ImageListItem, ImageListItemBar, IconButton,
  ToggleButtonGroup, ToggleButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline';
import { useSnackbar } from 'notistack';
import type { GalleryItem } from '@apptypes/models';
import { useGetGalleryQuery, useDeleteGalleryItemMutation } from '@features/gallery/galleryApi';
import GalleryFormDialog from './GalleryFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const GalleryPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [mediaType, setMediaType] = useState<'photo' | 'video' | undefined>(undefined);
  const { data, isLoading } = useGetGalleryQuery({ media_type: mediaType });
  const [deleteItem] = useDeleteGalleryItemMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteItem(toDelete.id).unwrap();
      enqueueSnackbar('Media deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete media', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Gallery</Typography>
          <Typography variant="body2" color="text.secondary">Photos and videos from station events</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>Add Media</Button>
      </Stack>

      <ToggleButtonGroup
        value={mediaType ?? 'all'}
        exclusive
        size="small"
        onChange={(_e, v) => setMediaType(v === 'all' ? undefined : v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="photo">Photos</ToggleButton>
        <ToggleButton value="video">Videos</ToggleButton>
      </ToggleButtonGroup>

      {isLoading ? <CircularProgress size={28} /> : (
        <ImageList cols={5} gap={12} sx={{ mt: 0 }}>
          {(data?.data ?? []).map((item) => (
            <ImageListItem key={item.id} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <img
                src={item.thumbnail_url ?? item.media_url}
                alt={item.title ?? 'Gallery media'}
                loading="lazy"
                style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
              {item.media_type === 'video' && (
                <PlayCircleIcon sx={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#fff', fontSize: 40, opacity: 0.85,
                }}
                />
              )}
              <ImageListItemBar
                title={item.title || item.event_name || '—'}
                actionIcon={(
                  <IconButton sx={{ color: '#fff' }} onClick={() => setToDelete(item)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
      {!isLoading && !data?.data?.length && (
        <Typography variant="body2" color="text.secondary">No media uploaded yet.</Typography>
      )}

      <GalleryFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete media"
        description="Are you sure you want to delete this item? This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default GalleryPage;
