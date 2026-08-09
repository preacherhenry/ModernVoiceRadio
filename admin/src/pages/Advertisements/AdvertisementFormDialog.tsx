import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box, Stack, MenuItem, Typography, Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { Advertisement } from '@apptypes/models';
import { useCreateAdvertisementMutation, useUpdateAdvertisementMutation } from '@features/advertisements/advertisementsApi';

const PLACEMENTS = [
  { value: 'home_banner', label: 'Home Banner' },
  { value: 'interstitial', label: 'Interstitial' },
  { value: 'news_inline', label: 'News Inline' },
];

const schema = yup.object({
  title: yup.string().min(2, 'Too short').required('Title is required'),
  targetUrl: yup.string().url('Must be a valid URL').optional(),
  placement: yup.string().required(),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
  displayOrder: yup.number().min(0).default(0),
  description: yup.string().max(2000).optional(),
  contactPhone: yup.string().max(30).optional(),
  contactWhatsapp: yup.string().max(30).optional(),
  contactEmail: yup.string().email('Must be a valid email').optional(),
  contactAddress: yup.string().max(500).optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  advertisement: Advertisement | null;
  onClose: () => void;
}

const AdvertisementFormDialog: React.FC<Props> = ({ open, advertisement, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createAd, { isLoading: creating }] = useCreateAdvertisementMutation();
  const [updateAd, { isLoading: updating }] = useUpdateAdvertisementMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      targetUrl: '',
      placement: 'home_banner',
      startDate: '',
      endDate: '',
      displayOrder: 0,
      description: '',
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: '',
      contactAddress: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: advertisement?.title ?? '',
        targetUrl: advertisement?.target_url ?? '',
        placement: advertisement?.placement ?? 'home_banner',
        startDate: advertisement?.start_date?.slice(0, 10) ?? '',
        endDate: advertisement?.end_date?.slice(0, 10) ?? '',
        displayOrder: advertisement?.display_order ?? 0,
        description: advertisement?.description ?? '',
        contactPhone: advertisement?.contact_phone ?? '',
        contactWhatsapp: advertisement?.contact_whatsapp ?? '',
        contactEmail: advertisement?.contact_email ?? '',
        contactAddress: advertisement?.contact_address ?? '',
      });
      setImageFile(null);
      setImagePreview(advertisement?.image_url ?? null);
    }
  }, [open, advertisement, reset]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.targetUrl) formData.append('targetUrl', values.targetUrl);
    formData.append('placement', values.placement);
    if (values.startDate) formData.append('startDate', values.startDate);
    if (values.endDate) formData.append('endDate', values.endDate);
    formData.append('displayOrder', String(values.displayOrder));
    if (values.description) formData.append('description', values.description);
    if (values.contactPhone) formData.append('contactPhone', values.contactPhone);
    if (values.contactWhatsapp) formData.append('contactWhatsapp', values.contactWhatsapp);
    if (values.contactEmail) formData.append('contactEmail', values.contactEmail);
    if (values.contactAddress) formData.append('contactAddress', values.contactAddress);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (advertisement) {
        await updateAd({ id: advertisement.id, data: formData }).unwrap();
        enqueueSnackbar('Advertisement updated', { variant: 'success' });
      } else {
        await createAd(formData).unwrap();
        enqueueSnackbar('Advertisement created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Something went wrong';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{advertisement ? 'Edit Advertisement' : 'Add Advertisement'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
          <Avatar src={imagePreview ?? undefined} variant="rounded" sx={{ width: 160, height: 70 }} />
          <Button component="label" size="small">
            Upload Image
            <input type="file" hidden accept="image/*" onChange={onImageChange} />
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="targetUrl" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Target URL" error={!!errors.targetUrl} helperText={errors.targetUrl?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="placement" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Placement">
                {PLACEMENTS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="displayOrder" control={control} render={({ field }) => (
              <TextField {...field} type="number" fullWidth label="Display order" onChange={(e) => field.onChange(Number(e.target.value))} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="startDate" control={control} render={({ field }) => (
              <TextField {...field} type="date" fullWidth label="Start date" InputLabelProps={{ shrink: true }} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="endDate" control={control} render={({ field }) => (
              <TextField {...field} type="date" fullWidth label="End date" InputLabelProps={{ shrink: true }} />
            )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="text.secondary">
              More info (shown on the ad&apos;s details page, e.g. for Interstitial)
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Description" error={!!errors.description} helperText={errors.description?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="contactPhone" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Contact phone" error={!!errors.contactPhone} helperText={errors.contactPhone?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="contactWhatsapp" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Contact WhatsApp" error={!!errors.contactWhatsapp} helperText={errors.contactWhatsapp?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="contactEmail" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Contact email" error={!!errors.contactEmail} helperText={errors.contactEmail?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="contactAddress" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Contact address" error={!!errors.contactAddress} helperText={errors.contactAddress?.message} />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {advertisement ? 'Save Changes' : 'Create Advertisement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvertisementFormDialog;
