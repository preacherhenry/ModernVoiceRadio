import React from 'react';
import {
  Box, Typography, Card, Grid, Table, TableHead, TableRow, TableCell, TableBody, Chip,
} from '@mui/material';
import { format } from 'date-fns';
import {
  useGetTrendQuery, useGetCitiesQuery, useGetDevicesQuery,
} from '@features/analytics/analyticsApi';

const AnalyticsPage: React.FC = () => {
  const { data: trend } = useGetTrendQuery({ days: 30 });
  const { data: cities } = useGetCitiesQuery();
  const { data: devices } = useGetDevicesQuery();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Analytics</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Detailed listener breakdowns and daily rollups</Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Daily Rollup</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Sessions</TableCell>
                  <TableCell align="right">Unique Listeners</TableCell>
                  <TableCell align="right">Peak Concurrent</TableCell>
                  <TableCell>Top Country</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(trend?.data ?? []).map((row) => (
                  <TableRow key={row.date} hover>
                    <TableCell>{format(new Date(row.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell align="right">{row.total_sessions}</TableCell>
                    <TableCell align="right">{row.unique_listeners}</TableCell>
                    <TableCell align="right">{row.peak_concurrent}</TableCell>
                    <TableCell><Chip size="small" label={(row as unknown as { top_country?: string }).top_country ?? '—'} /></TableCell>
                  </TableRow>
                ))}
                {!trend?.data?.length && (
                  <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary">No rollup data yet — the nightly job populates this after the first full day.</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ p: 3, mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Top Cities</Typography>
            {(cities?.data ?? []).slice(0, 10).map((c) => (
              <Box key={c.city} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2">{c.city}</Typography>
                <Typography variant="body2" fontWeight={700}>{c.count}</Typography>
              </Box>
            ))}
            {!cities?.data?.length && <Typography variant="body2" color="text.secondary">No city data yet.</Typography>}
          </Card>

          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>By Device</Typography>
            {(devices?.data ?? []).map((d) => (
              <Box key={d.device_type} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{d.device_type || 'Unknown'}</Typography>
                <Typography variant="body2" fontWeight={700}>{d.count}</Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
