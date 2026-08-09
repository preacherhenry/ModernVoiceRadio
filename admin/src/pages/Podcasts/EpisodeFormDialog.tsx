import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box,
  Switch, FormControlLabel, Stack, Typography, Chip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { PodcastEpisode } from '@apptypes/models';
import { useCreateEpisodeMutation, useUpdateEpisodeMutation } from '@features/podcasts/podcastsApi';

const schema = yup.object({
  title: yup.string().min(2, 'Too short').required('Title is required'),
  description: yup.string().optional(),
  durationSeconds: yup.number().min(0).optional(),
  episodeNumber: yup.number().min(0).optional(),
  seasonNumber: yup.number().min(0).optional(),
  isPublished: yup.boolean().default(true),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  podcastId: string;
  episode: PodcastEpisode | null;
  onClose: () => void;
}

const EpisodeFormDialog: React.FC<Props> = ({
  open, podcastId, episode, onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createEpisode, { isLoading: creating }] = useCreateEpisodeMutation();
  const [updateEpisode, { isLoading: updating }] = useUpdateEpisodeMutation();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', description: '', durationSeconds: 0, episodeNumber: undefined, seasonNumber: undefined, isPublished: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: episode?.title ?? '',
        description: episode?.description ?? '',
        durationSeconds: episode?.duration_seconds ?? 0,
        episodeNumber: episode?.episode_number ?? undefined,
        seasonNumber: undefined,
        isPublished: episode?.is_published ?? true,
      });
      setAudioFile(null);
      setCoverFile(null);
    }
  }, [open, episode, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!episode && !audioFile) {
      enqueueSnackbar('An audio file is required for a new episode', { variant: 'warning' });
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', String(values.description));
    if (values.durationSeconds !== undefined) formData.append('durationSeconds', String(values.durationSeconds));
    if (values.episodeNumber !== undefined) formData.append('episodeNumber', String(values.episodeNumber));
    if (values.seasonNumber !== undefined) formData.append('seasonNumber', String(values.seasonNumber));
    formData.append('isPublished', String(values.isPublished));
    if (audioFile) formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    try {
      if (episode) {
        await updateEpisode({ id: episode.id, data: formData }).unwrap();
        enqueueSnackbar('Episode updated', { variant: 'success' });
      } else {
        await createEpisode({ podcastId, data: formData }).unwrap();
        enqueueSnackbar('Episode published', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Something went wrong';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{episode ? 'Edit Episode' : 'Add Episode'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Description" />
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="durationSeconds" control={control} render={({ field }) => (
              <TextField {...field} type="number" fullWidth label="Duration (seconds)" onChange={(e) => field.onChange(Number(e.target.value))} />
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="episodeNumber" control={control} render={({ field }) => (
              <TextField {...field} type="number" fullWidth label="Episode #" onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="seasonNumber" control={control} render={({ field }) => (
              <TextField {...field} type="number" fullWidth label="Season #" onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )}
            />
          </Grid>

          <Grid item xs={6}>
            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />}>
              {audioFile ? audioFile.name : 'Upload Audio *'}
              <input type="file" hidden accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
            </Button>
            {episode && !audioFile && (
              <Typography variant="caption" color="text.secondary">Leave empty to keep existing audio</Typography>
            )}
          </Grid>
          <Grid item xs={6}>
            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />}>
              {coverFile ? coverFile.name : 'Upload Cover (optional)'}
              <input type="file" hidden accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Controller name="isPublished" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Published" />
              )}
              />
              {episode && <Chip size="small" label={`${episode.play_count} plays`} variant="outlined" />}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {episode ? 'Save Changes' : 'Publish Episode'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EpisodeFormDialog;
