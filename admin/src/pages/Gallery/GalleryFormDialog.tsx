import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box,
  ToggleButtonGroup, ToggleButton, Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCreateGalleryItemMutation } from '@features/gallery/galleryApi';
import { apiErrorMessage } from '@utils/apiError';

const schema = yup.object({
  title: yup.string().optional(),
  mediaType: yup.string().oneOf(['photo', 'video']).required(),
  eventName: yup.string().optional(),
  eventDate: yup.string().optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const GalleryFormDialog: React.FC<Props> = ({ open, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createItem, { isLoading }] = useCreateGalleryItemMutation();
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const {
    control, handleSubmit, reset, watch,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', mediaType: 'photo', eventName: '', eventDate: '',
    },
  });
  const mediaType = watch('mediaType');

  const handleClose = () => {
    reset();
    setMediaFile(null);
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!mediaFile) {
      enqueueSnackbar('Please select a file to upload', { variant: 'warning' });
      return;
    }
    const formData = new FormData();
    if (values.title) formData.append('title', values.title);
    formData.append('mediaType', values.mediaType);
    if (values.eventName) formData.append('eventName', values.eventName);
    if (values.eventDate) formData.append('eventDate', values.eventDate);
    formData.append('media', mediaFile);

    try {
      await createItem(formData).unwrap();
      enqueueSnackbar('Media uploaded', { variant: 'success' });
      handleClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'Upload failed');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Gallery Media</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="mediaType" control={control} render={({ field }) => (
              <ToggleButtonGroup {...field} exclusive onChange={(_e, v) => v && field.onChange(v)} fullWidth>
                <ToggleButton value="photo">Photo</ToggleButton>
                <ToggleButton value="video">Video</ToggleButton>
              </ToggleButtonGroup>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button component="label" fullWidth variant="outlined" startIcon={<UploadFileIcon />}>
              {mediaFile ? mediaFile.name : `Upload ${mediaType === 'video' ? 'Video' : 'Photo'}`}
              <input type="file" hidden accept={mediaType === 'video' ? 'video/*' : 'image/*'} onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title (optional)" />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="eventName" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Event name (optional)" />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="eventDate" control={control} render={({ field }) => (
              <TextField {...field} type="date" fullWidth label="Event date" InputLabelProps={{ shrink: true }} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Uploads are one-shot — to change metadata later, delete and re-upload the item.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isLoading}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GalleryFormDialog;
