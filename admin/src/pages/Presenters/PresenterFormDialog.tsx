import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box,
  Switch, FormControlLabel, Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { Presenter } from '@apptypes/models';
import { useCreatePresenterMutation, useUpdatePresenterMutation } from '@features/presenters/presentersApi';

const schema = yup.object({
  fullName: yup.string().min(2, 'Too short').required('Full name is required'),
  roleTitle: yup.string().optional(),
  bio: yup.string().optional(),
  email: yup.string().email('Invalid email').optional(),
  phone: yup.string().optional(),
  instagram: yup.string().optional(),
  twitter: yup.string().optional(),
  facebook: yup.string().optional(),
  tiktok: yup.string().optional(),
  isFeatured: yup.boolean().default(false),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  presenter: Presenter | null;
  onClose: () => void;
}

const PresenterFormDialog: React.FC<Props> = ({ open, presenter, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createPresenter, { isLoading: creating }] = useCreatePresenterMutation();
  const [updatePresenter, { isLoading: updating }] = useUpdatePresenterMutation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '', roleTitle: '', bio: '', email: '', phone: '', instagram: '', twitter: '', facebook: '', tiktok: '', isFeatured: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: presenter?.full_name ?? '',
        roleTitle: presenter?.role_title ?? '',
        bio: presenter?.bio ?? '',
        email: presenter?.email ?? '',
        phone: presenter?.phone ?? '',
        instagram: presenter?.socials?.instagram ?? '',
        twitter: presenter?.socials?.twitter ?? '',
        facebook: presenter?.socials?.facebook ?? '',
        tiktok: presenter?.socials?.tiktok ?? '',
        isFeatured: presenter?.is_featured ?? false,
      });
      setPhotoFile(null);
      setPhotoPreview(presenter?.photo_url ?? null);
    }
  }, [open, presenter, reset]);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('fullName', values.fullName);
    if (values.roleTitle) formData.append('roleTitle', values.roleTitle);
    if (values.bio) formData.append('bio', values.bio);
    if (values.email) formData.append('email', values.email);
    if (values.phone) formData.append('phone', values.phone);
    formData.append('socials', JSON.stringify({
      instagram: values.instagram, twitter: values.twitter, facebook: values.facebook, tiktok: values.tiktok,
    }));
    formData.append('isFeatured', String(values.isFeatured));
    if (photoFile) formData.append('photo', photoFile);

    try {
      if (presenter) {
        await updatePresenter({ id: presenter.id, data: formData }).unwrap();
        enqueueSnackbar('Presenter updated', { variant: 'success' });
      } else {
        await createPresenter(formData).unwrap();
        enqueueSnackbar('Presenter created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || 'Something went wrong';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{presenter ? 'Edit Presenter' : 'Add Presenter'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
          <Avatar src={photoPreview ?? undefined} sx={{ width: 84, height: 84 }} />
          <Button component="label" size="small">
            Upload Photo
            <input type="file" hidden accept="image/*" onChange={onPhotoChange} />
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <Controller name="fullName" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Full name" error={!!errors.fullName} helperText={errors.fullName?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Controller name="roleTitle" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Role title" placeholder="Breakfast Show Host" />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="bio" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Biography" />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Email" error={!!errors.email} helperText={errors.email?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="phone" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Phone" />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="instagram" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Instagram URL" />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="twitter" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Twitter/X URL" />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="facebook" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Facebook URL" />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="tiktok" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="TikTok URL" />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="isFeatured" control={control} render={({ field }) => (
              <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Featured presenter" />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {presenter ? 'Save Changes' : 'Create Presenter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PresenterFormDialog;
