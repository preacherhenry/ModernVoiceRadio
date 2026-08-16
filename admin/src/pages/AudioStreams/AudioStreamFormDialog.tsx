import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box,
  Switch, FormControlLabel, MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { AudioStream } from '@apptypes/models';
import { useCreateAudioStreamMutation, useUpdateAudioStreamMutation } from '@features/audioStreams/audioStreamsApi';
import { apiErrorMessage } from '@utils/apiError';

const PROTOCOLS = ['icecast', 'shoutcast', 'hls'];
const FORMATS = ['mp3', 'aac', 'ogg'];

const schema = yup.object({
  name: yup.string().min(1).max(120).required('Name is required'),
  url: yup.string().url('Must be a valid URL').required('Stream URL is required'),
  protocol: yup.string().oneOf(PROTOCOLS).required(),
  format: yup.string().oneOf(FORMATS).required(),
  bitrateKbps: yup.number().min(1).required('Bitrate is required'),
  metadataUrl: yup.string().url('Must be a valid URL').optional(),
  isDefault: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  stream: AudioStream | null;
  onClose: () => void;
}

const AudioStreamFormDialog: React.FC<Props> = ({ open, stream, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createStream, { isLoading: creating }] = useCreateAudioStreamMutation();
  const [updateStream, { isLoading: updating }] = useUpdateAudioStreamMutation();

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '', url: '', protocol: 'icecast', format: 'mp3', bitrateKbps: 128, metadataUrl: '', isDefault: false, isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: stream?.name ?? '',
        url: stream?.url ?? '',
        protocol: stream?.protocol ?? 'icecast',
        format: stream?.format ?? 'mp3',
        bitrateKbps: stream?.bitrate_kbps ?? 128,
        metadataUrl: stream?.metadata_url ?? '',
        isDefault: stream?.is_default ?? false,
        isActive: stream?.is_active ?? true,
      });
    }
  }, [open, stream, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = { ...values, protocol: values.protocol as AudioStream['protocol'] };
    try {
      if (stream) {
        await updateStream({ id: stream.id, data: payload }).unwrap();
        enqueueSnackbar('Stream updated', { variant: 'success' });
      } else {
        await createStream(payload).unwrap();
        enqueueSnackbar('Stream created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'Something went wrong');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{stream ? 'Edit Audio Stream' : 'Add Audio Stream'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Name" error={!!errors.name} helperText={errors.name?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="url" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Stream URL" error={!!errors.url} helperText={errors.url?.message} />
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="protocol" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Protocol">
                {PROTOCOLS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="format" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Format">
                {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={4}>
            <Controller name="bitrateKbps" control={control} render={({ field }) => (
              <TextField {...field} type="number" fullWidth label="Bitrate (kbps)" onChange={(e) => field.onChange(Number(e.target.value))} error={!!errors.bitrateKbps} helperText={errors.bitrateKbps?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="metadataUrl" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Metadata URL (optional)"
                placeholder="https://stream.example.com/status-json.xsl"
                helperText={errors.metadataUrl?.message || 'Icecast /status-json.xsl or SHOUTcast stats endpoint — powers the mobile app\'s Now Playing display'}
                error={!!errors.metadataUrl}
              />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="isDefault" control={control} render={({ field }) => (
              <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Set as default stream" />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="isActive" control={control} render={({ field }) => (
              <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {stream ? 'Save Changes' : 'Create Stream'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AudioStreamFormDialog;
