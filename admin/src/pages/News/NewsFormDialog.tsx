import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box,
  Switch, FormControlLabel, Stack, MenuItem, Typography, IconButton, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { NewsArticle } from '@apptypes/models';
import {
  useGetNewsCategoriesQuery,
  useGetNewsArticleQuery,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useRemoveNewsMediaMutation,
} from '@features/news/newsApi';
import { apiErrorMessage } from '@utils/apiError';

const schema = yup.object({
  title: yup.string().min(2, 'Too short').required('Title is required'),
  categoryId: yup.string().optional(),
  excerpt: yup.string().max(500).optional(),
  content: yup.string().required('Content is required'),
  isBreaking: yup.boolean().default(false),
  isTrending: yup.boolean().default(false),
  isPublished: yup.boolean().default(true),
  reporterName: yup.string().max(160).optional(),
  reportDate: yup.string().optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  article: NewsArticle | null;
  onClose: () => void;
}

interface PendingMedia {
  file: File;
  previewUrl: string;
  isVideo: boolean;
}

const NewsFormDialog: React.FC<Props> = ({ open, article, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: categoriesData } = useGetNewsCategoriesQuery();
  const { data: articleDetail } = useGetNewsArticleQuery(article?.id ?? '', { skip: !open || !article });
  const [createNews, { isLoading: creating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: updating }] = useUpdateNewsMutation();
  const [removeMedia, { isLoading: removingMedia }] = useRemoveNewsMediaMutation();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);

  const existingMedia = articleDetail?.data?.media ?? [];

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', categoryId: '', excerpt: '', content: '', isBreaking: false, isTrending: false, isPublished: true,
      reporterName: '', reportDate: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: article?.title ?? '',
        categoryId: article?.category_id ?? '',
        excerpt: article?.excerpt ?? '',
        content: article?.content ?? '',
        isBreaking: article?.is_breaking ?? false,
        isTrending: article?.is_trending ?? false,
        isPublished: article?.is_published ?? true,
        reporterName: article?.reporter_name ?? '',
        reportDate: article?.report_date?.slice(0, 10) ?? '',
      });
      setCoverFile(null);
      setCoverPreview(article?.cover_image_url ?? null);
      setPendingMedia([]);
    }
  }, [open, article, reset]);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingMedia((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo: file.type.startsWith('video/'),
      })),
    ]);
    e.target.value = '';
  };

  const removePendingMedia = (index: number) => {
    setPendingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const onRemoveExistingMedia = async (mediaId: string) => {
    if (!article) return;
    try {
      await removeMedia({ id: article.id, mediaId }).unwrap();
      enqueueSnackbar('Media removed', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to remove media', { variant: 'error' });
    }
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    if (values.excerpt) formData.append('excerpt', values.excerpt);
    formData.append('content', values.content);
    formData.append('isBreaking', String(values.isBreaking));
    formData.append('isTrending', String(values.isTrending));
    formData.append('isPublished', String(values.isPublished));
    // Sent even when blank: the backend treats an empty string as "clear this credit".
    formData.append('reporterName', values.reporterName ?? '');
    formData.append('reportDate', values.reportDate ?? '');
    if (coverFile) formData.append('cover', coverFile);
    pendingMedia.forEach(({ file }) => formData.append('media', file));

    try {
      if (article) {
        await updateNews({ id: article.id, data: formData }).unwrap();
        enqueueSnackbar('Article updated', { variant: 'success' });
      } else {
        await createNews(formData).unwrap();
        enqueueSnackbar('Article published', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'Something went wrong');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{article ? 'Edit Article' : 'Add Article'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
          <Avatar src={coverPreview ?? undefined} variant="rounded" sx={{ width: 140, height: 80 }} />
          <Button component="label" size="small">
            Upload Cover
            <input type="file" hidden accept="image/*" onChange={onCoverChange} />
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Category">
                <MenuItem value="">None</MenuItem>
                {(categoriesData?.data ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="excerpt" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={2} label="Excerpt" error={!!errors.excerpt} helperText={errors.excerpt?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="content" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={8} label="Content" error={!!errors.content} helperText={errors.content?.message} />
            )}
            />
          </Grid>

          {/* Credits — optional; shown on one line straight after the article body. */}
          <Grid item xs={12} sm={7}>
            <Controller name="reporterName" control={control} render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Reporter Name (optional)"
                placeholder="e.g. Patrick Kangwa"
                error={!!errors.reporterName}
                helperText={errors.reporterName?.message ?? 'Leave blank for an uncredited article'}
              />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Controller name="reportDate" control={control} render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label="Report Date (optional)"
                InputLabelProps={{ shrink: true }}
                error={!!errors.reportDate}
                helperText={errors.reportDate?.message}
              />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={3}>
              <Controller name="isBreaking" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Breaking" />
              )}
              />
              <Controller name="isTrending" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Trending" />
              )}
              />
              <Controller name="isPublished" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Published" />
              )}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Additional Photos & Videos (optional)
            </Typography>

            {(existingMedia.length > 0 || pendingMedia.length > 0) && (
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 1.5 }}>
                {existingMedia.map((m) => (
                  <Box key={m.id} sx={{ position: 'relative', width: 96, height: 96 }}>
                    {m.media_type === 'video' ? (
                      <Box sx={{
                        width: '100%', height: '100%', borderRadius: 1, bgcolor: 'action.hover',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      >
                        <PlayCircleIcon fontSize="large" color="action" />
                      </Box>
                    ) : (
                      <Avatar src={m.media_url} variant="rounded" sx={{ width: '100%', height: '100%' }} />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => onRemoveExistingMedia(m.id)}
                      disabled={removingMedia}
                      sx={{
                        position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper',
                        boxShadow: 1, '&:hover': { bgcolor: 'error.light' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {pendingMedia.map((m, i) => (
                  <Box key={m.previewUrl} sx={{ position: 'relative', width: 96, height: 96 }}>
                    {m.isVideo ? (
                      <Box sx={{
                        width: '100%', height: '100%', borderRadius: 1, bgcolor: 'action.hover',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      >
                        <PlayCircleIcon fontSize="large" color="action" />
                      </Box>
                    ) : (
                      <Avatar src={m.previewUrl} variant="rounded" sx={{ width: '100%', height: '100%' }} />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => removePendingMedia(i)}
                      sx={{
                        position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper',
                        boxShadow: 1, '&:hover': { bgcolor: 'error.light' },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {removingMedia && <CircularProgress size={20} />}
              </Stack>
            )}

            <Button component="label" size="small" variant="outlined">
              Add Photos / Videos
              <input type="file" hidden multiple accept="image/*,video/*" onChange={onMediaChange} />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {article ? 'Save Changes' : 'Publish Article'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewsFormDialog;
