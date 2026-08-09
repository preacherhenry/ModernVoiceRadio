import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box,
  Switch, FormControlLabel, Stack, MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { Podcast } from '@apptypes/models';
import {
  useGetPodcastCategoriesQuery, useCreatePodcastMutation, useUpdatePodcastMutation,
} from '@features/podcasts/podcastsApi';
import { useGetPresentersQuery } from '@features/presenters/presentersApi';

const schema = yup.object({
  title: yup.string().min(2, 'Too short').required('Title is required'),
  categoryId: yup.string().optional(),
  presenterId: yup.string().optional(),
  description: yup.string().optional(),
  isFeatured: yup.boolean().default(false),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  podcast: Podcast | null;
  onClose: () => void;
}

const PodcastFormDialog: React.FC<Props> = ({ open, podcast, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: categoriesData } = useGetPodcastCategoriesQuery();
  const { data: presentersData } = useGetPresentersQuery();
  const [createPodcast, { isLoading: creating }] = useCreatePodcastMutation();
  const [updatePodcast, { isLoading: updating }] = useUpdatePodcastMutation();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', categoryId: '', presenterId: '', description: '', isFeatured: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: podcast?.title ?? '',
        categoryId: podcast?.category_id ?? '',
        presenterId: podcast?.presenter_id ?? '',
        description: podcast?.description ?? '',
        isFeatured: podcast?.is_featured ?? false,
      });
      setCoverFile(null);
      setCoverPreview(podcast?.cover_image_url ?? null);
    }
  }, [open, podcast, reset]);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    if (values.presenterId) formData.append('presenterId', values.presenterId);
    if (values.description) formData.append('description', values.description);
    formData.append('isFeatured', String(values.isFeatured));
    if (coverFile) formData.append('cover', coverFile);

    try {
      if (podcast) {
        await updatePodcast({ id: podcast.id, data: formData }).unwrap();
        enqueueSnackbar('Podcast updated', { variant: 'success' });
      } else {
        await createPodcast(formData).unwrap();
        enqueueSnackbar('Podcast created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Something went wrong';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{podcast ? 'Edit Podcast' : 'Add Podcast'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
          <Avatar src={coverPreview ?? undefined} variant="rounded" sx={{ width: 96, height: 96 }} />
          <Button component="label" size="small">
            Upload Cover
            <input type="file" hidden accept="image/*" onChange={onCoverChange} />
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Category">
                <MenuItem value="">None</MenuItem>
                {(categoriesData?.data ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="presenterId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Host presenter">
                <MenuItem value="">None</MenuItem>
                {(presentersData?.data ?? []).map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Description" />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="isFeatured" control={control} render={({ field }) => (
              <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Featured podcast" />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {podcast ? 'Save Changes' : 'Create Podcast'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PodcastFormDialog;
