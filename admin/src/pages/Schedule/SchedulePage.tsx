import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Button, Card, Grid, Stack, IconButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useSnackbar } from 'notistack';
import type { ScheduleSlot } from '@apptypes/models';
import { useGetWeeklyScheduleQuery, useDeleteScheduleSlotMutation } from '@features/schedule/scheduleApi';
import ScheduleFormDialog from './ScheduleFormDialog';
import ConfirmDialog from '@components/common/ConfirmDialog';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
};

const SchedulePage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading } = useGetWeeklyScheduleQuery();
  const [deleteSlot] = useDeleteScheduleSlotMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduleSlot | null>(null);
  const [defaultDay, setDefaultDay] = useState<number>(0);
  const [toDelete, setToDelete] = useState<ScheduleSlot | null>(null);

  const byDay = useMemo(() => {
    const grouped: ScheduleSlot[][] = Array.from({ length: 7 }, () => []);
    (data?.data ?? []).forEach((slot) => {
      grouped[slot.day_of_week]?.push(slot);
    });
    grouped.forEach((day) => day.sort((a, b) => a.start_time.localeCompare(b.start_time)));
    return grouped;
  }, [data]);

  const openCreate = (day: number) => { setEditing(null); setDefaultDay(day); setFormOpen(true); };
  const openEdit = (slot: ScheduleSlot) => { setEditing(slot); setFormOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteSlot(toDelete.id).unwrap();
      enqueueSnackbar('Schedule slot deleted', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to delete slot', { variant: 'error' });
    } finally {
      setToDelete(null);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Schedule</Typography>
          <Typography variant="body2" color="text.secondary">Weekly on-air programming timetable</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate(0)}>Add Slot</Button>
      </Stack>

      {isLoading ? <CircularProgress size={28} /> : (
        <Grid container spacing={2}>
          {DAY_LABELS.map((label, day) => (
            <Grid item xs={12} sm={6} md={12 / 7 as unknown as number} key={label}>
              <Card variant="outlined" sx={{ p: 1.5, height: '100%', minHeight: 420 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
                  <IconButton size="small" onClick={() => openCreate(day)}><AddIcon fontSize="small" /></IconButton>
                </Stack>
                <Stack spacing={1}>
                  {byDay[day].map((slot) => (
                    <Card key={slot.id} variant="outlined" sx={{ p: 1, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>{slot.program_title ?? 'Untitled'}</Typography>
                      <Stack direction="row" justifyContent="flex-end">
                        <IconButton size="small" onClick={() => openEdit(slot)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                        <IconButton size="small" onClick={() => setToDelete(slot)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Stack>
                    </Card>
                  ))}
                  {!byDay[day].length && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No slots</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ScheduleFormDialog open={formOpen} slot={editing} defaultDay={defaultDay} onClose={() => setFormOpen(false)} />
      <ConfirmDialog
        open={!!toDelete}
        title="Delete schedule slot"
        description={`Remove "${toDelete?.program_title ?? 'this slot'}" from the schedule?`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};

export default SchedulePage;
