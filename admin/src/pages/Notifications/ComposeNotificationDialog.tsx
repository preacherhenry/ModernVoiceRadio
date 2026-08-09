import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box, MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCreateNotificationMutation } from '@features/notifications/notificationsApi';

const TYPE_OPTIONS = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'breaking_news', label: 'Breaking News' },
  { value: 'live_show', label: 'Live Show' },
  { value: 'new_podcast', label: 'New Podcast' },
];

const TOPIC_OPTIONS = ['all', 'breaking_news', 'live_show', 'new_podcast'];

const schema = yup.object({
  title: yup.string().max(180).required('Title is required'),
  body: yup.string().required('Body is required'),
  type: yup.string().required(),
  imageUrl: yup.string().url('Must be a valid URL').optional(),
  targetTopic: yup.string().required(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const ComposeNotificationDialog: React.FC<Props> = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createNotification, { isLoading }] = useCreateNotificationMutation();

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', body: '', type: 'announcement', imageUrl: '', targetTopic: 'all',
    },
  });

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (values: FormValues) => {
    try {
      await createNotification({
        title: values.title,
        body: values.body,
        type: values.type,
        imageUrl: values.imageUrl || undefined,
        targetTopic: values.targetTopic,
      }).unwrap();
      enqueueSnackbar('Notification sent', { variant: 'success' });
      handleClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Failed to send notification';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Compose Notification</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="body" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Message" error={!!errors.body} helperText={errors.body?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="type" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Type">
                {TYPE_OPTIONS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="targetTopic" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Target audience">
                {TOPIC_OPTIONS.map((t) => <MenuItem key={t} value={t}>{t === 'all' ? 'Everyone' : t}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="imageUrl" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Image URL (optional)" error={!!errors.imageUrl} helperText={errors.imageUrl?.message} />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isLoading}>Send Notification</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComposeNotificationDialog;
