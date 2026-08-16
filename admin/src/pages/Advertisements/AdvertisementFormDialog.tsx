import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box, Stack, MenuItem, Typography, Divider,
  IconButton, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { Advertisement } from '@apptypes/models';
import { useCreateAdvertisementMutation, useUpdateAdvertisementMutation } from '@features/advertisements/advertisementsApi';
import { apiErrorMessage } from '@utils/apiError';

const PLACEMENTS = [
  { value: 'home_banner', label: 'Home Banner' },
  { value: 'interstitial', label: 'Interstitial' },
  { value: 'news_inline', label: 'News Inline' },
];

/** Mirrors MAX_SUPPORTING_IMAGES in backend/src/services/advertisementService.js. */
const MAX_SUPPORTING = 4;

/** A supporting picture already saved on the server, or one picked in this session. */
type SupportingItem =
  | { kind: 'existing'; id: string; url: string }
  | { kind: 'new'; file: File; url: string };

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
  const [supporting, setSupporting] = useState<SupportingItem[]>([]);
  /** Ids of already-saved supporting pictures the admin removed; sent on save. */
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);

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
      setSupporting(
        (advertisement?.media ?? []).map((m) => ({ kind: 'existing' as const, id: m.id, url: m.media_url })),
      );
      setRemovedMediaIds([]);
    }
  }, [open, advertisement, reset]);

  // Object URLs created for local previews are released when the dialog closes, so
  // picking several images across edits doesn't leak blobs for the tab's lifetime.
  useEffect(() => () => {
    supporting.forEach((item) => { if (item.kind === 'new') URL.revokeObjectURL(item.url); });
  }, [supporting]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSupportingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const room = MAX_SUPPORTING - supporting.length;
    const accepted = picked.slice(0, Math.max(room, 0));
    if (picked.length > accepted.length) {
      enqueueSnackbar(`Only ${MAX_SUPPORTING} supporting pictures are allowed`, { variant: 'warning' });
    }
    setSupporting((prev) => [
      ...prev,
      ...accepted.map((file) => ({ kind: 'new' as const, file, url: URL.createObjectURL(file) })),
    ]);
    // Reset so re-picking the same file still fires a change event.
    e.target.value = '';
  };

  const removeSupporting = (index: number) => {
    setSupporting((prev) => {
      const item = prev[index];
      if (item.kind === 'existing') setRemovedMediaIds((ids) => [...ids, item.id]);
      else URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
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
    supporting.forEach((item) => {
      if (item.kind === 'new') formData.append('supporting', item.file);
    });
    if (removedMediaIds.length) formData.append('removedMediaIds', JSON.stringify(removedMediaIds));

    if (!advertisement && !imageFile) {
      enqueueSnackbar('A main poster is required', { variant: 'error' });
      return;
    }

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
      const message = apiErrorMessage(err, 'Something went wrong');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{advertisement ? 'Edit Advertisement' : 'Add Advertisement'}</DialogTitle>
      <DialogContent>
        {/* ---- Main poster (required) ---- */}
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Main Poster <Box component="span" sx={{ color: 'error.main' }}>*</Box>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Shown in the Home Screen banner. Use a 2.8:1 image (recommended 1400 × 500 px) so it
            fills the banner without being cropped.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={imagePreview ?? undefined}
              variant="rounded"
              sx={{ width: 196, height: 70, bgcolor: 'action.hover' }}
            >
              <AddPhotoAlternateIcon color="disabled" />
            </Avatar>
            <Button component="label" size="small" variant="outlined">
              {imagePreview ? 'Replace Poster' : 'Upload Poster'}
              <input type="file" hidden accept="image/*" onChange={onImageChange} />
            </Button>
          </Stack>
        </Box>

        {/* ---- Supporting pictures (optional, up to 4) ---- */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Supporting Pictures <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>(Optional, up to {MAX_SUPPORTING})</Box>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Shown as a swipeable gallery when a listener taps the advert. Any shape — they are
            never cropped.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            {supporting.map((item, index) => (
              <Box key={item.kind === 'existing' ? item.id : `${item.file.name}-${index}`} sx={{ position: 'relative' }}>
                <Avatar src={item.url} variant="rounded" sx={{ width: 84, height: 84 }} />
                <IconButton
                  size="small"
                  aria-label="Remove picture"
                  onClick={() => removeSupporting(index)}
                  sx={{
                    position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper',
                    border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'error.main', color: 'common.white' },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ))}

            {supporting.length < MAX_SUPPORTING && (
              <Button
                component="label"
                variant="outlined"
                sx={{
                  width: 84, height: 84, minWidth: 84, borderStyle: 'dashed',
                  display: 'flex', flexDirection: 'column', gap: 0.5,
                }}
              >
                <AddPhotoAlternateIcon fontSize="small" />
                <Typography variant="caption">Add</Typography>
                <input type="file" hidden multiple accept="image/*" onChange={onSupportingChange} />
              </Button>
            )}
          </Stack>

          {supporting.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {supporting.length} of {MAX_SUPPORTING} added
              {removedMediaIds.length > 0 && ` · ${removedMediaIds.length} will be removed on save`}
            </Typography>
          )}
        </Box>

        {!advertisement && !imagePreview && (
          <Alert severity="info" sx={{ mb: 2 }}>
            A main poster is required. Supporting pictures are optional — an advert can have
            anywhere from 1 to {MAX_SUPPORTING + 1} images in total.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

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
