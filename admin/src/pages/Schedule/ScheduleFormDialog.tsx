import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import type { ScheduleSlot } from '@apptypes/models';
import { useGetProgramsQuery } from '@features/programs/programsApi';
import { useCreateScheduleSlotMutation, useUpdateScheduleSlotMutation } from '@features/schedule/scheduleApi';
import { apiErrorMessage } from '@utils/apiError';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const schema = yup.object({
  programId: yup.string().required('A program is required'),
  dayOfWeek: yup.number().min(0).max(6).required(),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required')
    .test('after-start', 'End time must be after start time', function endAfterStart(value) {
      return !value || !this.parent.startTime || value > this.parent.startTime;
    }),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  open: boolean;
  slot: ScheduleSlot | null;
  defaultDay?: number;
  onClose: () => void;
}

const ScheduleFormDialog: React.FC<Props> = ({
  open, slot, defaultDay, onClose,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data: programsData } = useGetProgramsQuery();
  const [createSlot, { isLoading: creating }] = useCreateScheduleSlotMutation();
  const [updateSlot, { isLoading: updating }] = useUpdateScheduleSlotMutation();

  const {
    control, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      programId: '', dayOfWeek: defaultDay ?? 0, startTime: '', endTime: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        programId: slot?.program_id ?? '',
        dayOfWeek: slot?.day_of_week ?? defaultDay ?? 0,
        startTime: slot?.start_time?.slice(0, 5) ?? '',
        endTime: slot?.end_time?.slice(0, 5) ?? '',
      });
    }
  }, [open, slot, defaultDay, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (slot) {
        await updateSlot({ id: slot.id, data: values }).unwrap();
        enqueueSnackbar('Schedule slot updated', { variant: 'success' });
      } else {
        await createSlot(values).unwrap();
        enqueueSnackbar('Schedule slot created', { variant: 'success' });
      }
      onClose();
    } catch (err) {
      const message = apiErrorMessage(err, 'Something went wrong');
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{slot ? 'Edit Schedule Slot' : 'Add Schedule Slot'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <Controller name="programId" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Program" error={!!errors.programId} helperText={errors.programId?.message}>
                {(programsData?.data ?? []).map((p) => <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller name="dayOfWeek" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Day of week" onChange={(e) => field.onChange(Number(e.target.value))}>
                {DAY_LABELS.map((label, i) => <MenuItem key={label} value={i}>{label}</MenuItem>)}
              </TextField>
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="startTime" control={control} render={({ field }) => (
              <TextField {...field} type="time" fullWidth label="Start time" InputLabelProps={{ shrink: true }} error={!!errors.startTime} helperText={errors.startTime?.message} />
            )}
            />
          </Grid>
          <Grid item xs={6}>
            <Controller name="endTime" control={control} render={({ field }) => (
              <TextField {...field} type="time" fullWidth label="End time" InputLabelProps={{ shrink: true }} error={!!errors.endTime} helperText={errors.endTime?.message} />
            )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={creating || updating}>
          {slot ? 'Save Changes' : 'Add Slot'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleFormDialog;
