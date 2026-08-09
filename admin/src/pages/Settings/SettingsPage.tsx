import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Grid, TextField, Button, Stack, IconButton, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import {
  useGetContactInfoQuery, useUpdateContactInfoMutation, useGetSettingsQuery, useUpdateSettingMutation,
} from '@features/settings/settingsApi';

const contactSchema = yup.object({
  stationName: yup.string().optional(),
  phone: yup.string().optional(),
  whatsapp: yup.string().optional(),
  email: yup.string().email('Invalid email').optional(),
  address: yup.string().optional(),
  latitude: yup.number().min(-90).max(90).optional(),
  longitude: yup.number().min(-180).max(180).optional(),
  facebookUrl: yup.string().url('Must be a valid URL').optional(),
  instagramUrl: yup.string().url('Must be a valid URL').optional(),
  tiktokUrl: yup.string().url('Must be a valid URL').optional(),
  youtubeUrl: yup.string().url('Must be a valid URL').optional(),
  twitterUrl: yup.string().url('Must be a valid URL').optional(),
  websiteUrl: yup.string().url('Must be a valid URL').optional(),
});
type ContactFormValues = yup.InferType<typeof contactSchema>;

const ContactInfoSection: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data } = useGetContactInfoQuery();
  const [updateContact, { isLoading }] = useUpdateContactInfoMutation();

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<ContactFormValues>({ resolver: yupResolver(contactSchema) });

  useEffect(() => {
    if (data?.data) {
      const c = data.data;
      reset({
        stationName: c.station_name ?? '',
        phone: c.phone ?? '',
        whatsapp: c.whatsapp ?? '',
        email: c.email ?? '',
        address: c.address ?? '',
        latitude: c.latitude ?? undefined,
        longitude: c.longitude ?? undefined,
        facebookUrl: c.facebook_url ?? '',
        instagramUrl: c.instagram_url ?? '',
        tiktokUrl: c.tiktok_url ?? '',
        youtubeUrl: c.youtube_url ?? '',
        twitterUrl: c.twitter_url ?? '',
        websiteUrl: c.website_url ?? '',
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await updateContact(values).unwrap();
      enqueueSnackbar('Contact information saved', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to save contact information', { variant: 'error' });
    }
  };

  const field = (name: keyof ContactFormValues, label: string, extra?: object) => (
    <Controller
      name={name}
      control={control}
      render={({ field: f }) => (
        <TextField
          {...f}
          value={f.value ?? ''}
          fullWidth
          label={label}
          error={!!errors[name]}
          helperText={errors[name]?.message as string}
          {...extra}
        />
      )}
    />
  );

  return (
    <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>Station Contact Information</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>{field('stationName', 'Station Name')}</Grid>
        <Grid item xs={12} sm={6}>{field('email', 'Email')}</Grid>
        <Grid item xs={12} sm={6}>{field('phone', 'Phone')}</Grid>
        <Grid item xs={12} sm={6}>{field('whatsapp', 'WhatsApp')}</Grid>
        <Grid item xs={12}>{field('address', 'Address')}</Grid>
        <Grid item xs={12} sm={6}>{field('latitude', 'Latitude', { type: 'number' })}</Grid>
        <Grid item xs={12} sm={6}>{field('longitude', 'Longitude', { type: 'number' })}</Grid>
        <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
        <Grid item xs={12} sm={6}>{field('facebookUrl', 'Facebook URL')}</Grid>
        <Grid item xs={12} sm={6}>{field('instagramUrl', 'Instagram URL')}</Grid>
        <Grid item xs={12} sm={6}>{field('tiktokUrl', 'TikTok URL')}</Grid>
        <Grid item xs={12} sm={6}>{field('youtubeUrl', 'YouTube URL')}</Grid>
        <Grid item xs={12} sm={6}>{field('twitterUrl', 'Twitter/X URL')}</Grid>
        <Grid item xs={12} sm={6}>{field('websiteUrl', 'Website URL')}</Grid>
      </Grid>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        sx={{ mt: 3 }}
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        Save Contact Info
      </Button>
    </Card>
  );
};

const SettingRow: React.FC<{ settingKey: string; value: unknown }> = ({ settingKey, value }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [updateSetting, { isLoading }] = useUpdateSettingMutation();
  const isArray = Array.isArray(value);
  const [text, setText] = useState(isArray ? (value as unknown[]).join(', ') : String(value ?? ''));

  const handleSave = async () => {
    let parsed: unknown = text;
    if (isArray) {
      parsed = text.split(',').map((v) => v.trim()).filter(Boolean).map((v) => (Number.isNaN(Number(v)) ? v : Number(v)));
    } else if (!Number.isNaN(Number(text)) && text.trim() !== '') {
      parsed = Number(text);
    }
    try {
      await updateSetting({ key: settingKey, value: parsed }).unwrap();
      enqueueSnackbar(`${settingKey} updated`, { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update setting', { variant: 'error' });
    }
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1 }}>
      <TextField
        size="small"
        fullWidth
        label={settingKey.replace(/_/g, ' ')}
        value={text}
        onChange={(e) => setText(e.target.value)}
        helperText={isArray ? 'Comma-separated values' : undefined}
      />
      <IconButton onClick={handleSave} disabled={isLoading} color="primary">
        <SaveIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

const AppSettingsSection: React.FC = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const entries = Object.entries(data?.data ?? {});

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={700} mb={2}>App Settings</Typography>
      {isLoading && <Typography variant="body2" color="text.secondary">Loading…</Typography>}
      {!isLoading && !entries.length && <Typography variant="body2" color="text.secondary">No settings configured yet.</Typography>}
      <Stack divider={<Divider />}>
        {entries.map(([key, value]) => <SettingRow key={key} settingKey={key} value={value} />)}
      </Stack>
    </Card>
  );
};

const SettingsPage: React.FC = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} mb={0.5}>Settings</Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>Station contact details and app configuration</Typography>
    <ContactInfoSection />
    <AppSettingsSection />
  </Box>
);

export default SettingsPage;
