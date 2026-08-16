import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Avatar, Box,
  Switch, FormControlLabel, Stack, MenuItem, Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { Program } from '@apptypes/models';
import { useGetPresentersQuery } from '@features/presenters/presentersApi';
import {
  useCreateProgramMutation, useUpdateProgramMutation, useGetProgramQuery, type ProgramDetail,
} from '@features/programs/programsApi';
import { apiErrorMessage } from '@utils/apiError';

const CATEGORY_OPTIONS = ['Talk', 'Music', 'News', 'Sports', 'Entertainment'];

const schema = yup.object({
  title: yup.string().min(2, 'Too short').required('Title is required'),
  category: yup.string().optional(),
  description: yup.string().optional(),
  isActive: yup.boolean().default(true),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  program: Program | null;
  onClose: () => void;
}

const ProgramFormDialog: React.FC<Props> = ({ open, program, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [createProgram, { isLoading: creating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: updating }] = useUpdateProgramMutation();
  const { data: presentersData } = useGetPresentersQuery();
  const { data: programDetailData } = useGetProgramQuery(program?.id ?? '', { skip: !program || !open });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [presenterIds, setPresenterIds] = useState<string[]>([]);

  const presenters = presentersData?.data ?? [];
  const programDetail: ProgramDetail | undefined = programDetailData?.data;

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', category: '', description: '', isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: program?.title ?? '',
        category: program?.category ?? '',
        description: program?.description ?? '',
        isActive: program?.is_active ?? true,
      });
      setCoverFile(null);
      setCoverPreview(program?.cover_image_url ?? null);
      setPresenterIds([]);
    }
  }, [open, program, reset]);

  useEffect(() => {
    if (open && programDetail?.presenters) {
      setPresenterIds(programDetail.presenters.map((p) => p.id));
    }
  }, [open, programDetail]);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.category) formData.append('category', values.category);
    if (values.description) formData.append('description', values.description);
    if (program) formData.append('isActive', String(values.isActive));
    formData.append('presenterIds', JSON.stringify(presenterIds));
    if (coverFile) formData.append('cover', coverFile);

    try {
      if (program) {
        await updateProgram({ id: program.id, data: formData }).unwrap();
        enqueueSnackbar('Program updated', { variant: 'success' });
      } else {
        await createProgram(formData).unwrap();
        enqueueSnackbar('Program created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'Something went wrong');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{program ? 'Edit Program' : 'Add Program'}</DialogTitle>
      <DialogContent>
        <Stack alignItems="center" spacing={1} sx={{ mb: 2, mt: 1 }}>
          <Avatar src={coverPreview ?? undefined} variant="rounded" sx={{ width: 96, height: 96 }} />
          <Button component="label" size="small">
            Upload Cover
            <input type="file" hidden accept="image/*" onChange={onCoverChange} />
          </Button>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <Controller name="title" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Title" error={!!errors.title} helperText={errors.title?.message} />
            )}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <Controller name="category" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Category">
                <MenuItem value="">None</MenuItem>
                {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} fullWidth multiline minRows={3} label="Description" />
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={presenters}
              getOptionLabel={(p) => p.full_name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              value={presenters.filter((p) => presenterIds.includes(p.id))}
              onChange={(_e, value) => setPresenterIds(value.map((v) => v.id))}
              renderInput={(params) => <TextField {...params} label="Presenters" placeholder="Assign presenters" />}
            />
          </Grid>
          {program && (
            <Grid item xs={12}>
              <Controller name="isActive" control={control} render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="Active" />
              )}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {program ? 'Save Changes' : 'Create Program'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramFormDialog;
