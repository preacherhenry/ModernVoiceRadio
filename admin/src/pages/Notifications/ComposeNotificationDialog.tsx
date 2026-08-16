import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Box, MenuItem,
  Chip, Stack, Typography, Alert,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { useCreateNotificationMutation } from '@features/notifications/notificationsApi';
import { apiErrorMessage } from '@utils/apiError';

const TYPE_OPTIONS = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'breaking_news', label: 'Breaking News' },
  { value: 'live_show', label: 'Live Show' },
  { value: 'new_podcast', label: 'New Podcast' },
];

const TOPIC_OPTIONS = ['all', 'breaking_news', 'live_show', 'new_podcast'];

/** Mirrors the backend's placeholder set — see backend/src/utils/personalize.js. */
const PLACEHOLDERS = [
  { token: '{firstName}', help: "Recipient's first name" },
  { token: '{name}', help: "Recipient's full name" },
];
const PLACEHOLDER_REGEX = /\{\{?\s*(first[_\s-]?name|name)\s*\}?\}/gi;
/** Matches the backend's FALLBACK_NAME, used when a recipient has no name on file. */
const FALLBACK_NAME = 'there';

/** Renders admin copy the way a recipient would actually receive it. */
const previewFor = (text: string, firstName: string) => text.replace(PLACEHOLDER_REGEX, firstName);

const hasPlaceholder = (text: string) => new RegExp(PLACEHOLDER_REGEX.source, 'i').test(text);

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
    control, handleSubmit, reset, setValue, getValues, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', body: '', type: 'announcement', imageUrl: '', targetTopic: 'all',
    },
  });

  const watchedTitle = useWatch({ control, name: 'title' }) ?? '';
  const watchedBody = useWatch({ control, name: 'body' }) ?? '';
  const isPersonalized = hasPlaceholder(watchedTitle) || hasPlaceholder(watchedBody);

  /** Appends a placeholder to the message field so admins don't have to type it exactly. */
  const insertPlaceholder = (token: string) => {
    const current = getValues('body') ?? '';
    const needsSpace = current.length > 0 && !/\s$/.test(current);
    setValue('body', `${current}${needsSpace ? ' ' : ''}${token}`, { shouldValidate: true });
  };

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
      const message = apiErrorMessage(err, 'Failed to send notification');
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
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="caption" color="text.secondary">Personalize:</Typography>
              {PLACEHOLDERS.map((p) => (
                <Chip
                  key={p.token}
                  label={p.token}
                  title={p.help}
                  size="small"
                  variant="outlined"
                  onClick={() => insertPlaceholder(p.token)}
                />
              ))}
            </Stack>
          </Grid>

          {isPersonalized && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Each listener receives their own name. Preview:
                </Typography>
                {[['Preacher', 'a listener named Preacher'], ['John', 'a listener named John'], [FALLBACK_NAME, 'someone with no name on file']].map(([who, label]) => (
                  <Typography key={who} variant="body2" sx={{ mb: 0.5 }}>
                    <Box component="span" sx={{ color: 'text.secondary' }}>{label}: </Box>
                    {previewFor(watchedTitle, who) && (
                      <Box component="span" sx={{ fontWeight: 600 }}>{previewFor(watchedTitle, who)} — </Box>
                    )}
                    {previewFor(watchedBody, who)}
                  </Typography>
                ))}
              </Alert>
            </Grid>
          )}

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
              <TextField
                {...field}
                select
                fullWidth
                label="Target audience"
                disabled={isPersonalized}
                helperText={isPersonalized
                  ? 'Personalized messages go to every signed-in listener individually'
                  : undefined}
              >
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
