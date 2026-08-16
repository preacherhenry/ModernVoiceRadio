import React, { useState } from 'react';
import {
  Box, Card, Grid, Typography, ToggleButton, ToggleButtonGroup, TextField, Stack, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, TableContainer,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import TimerIcon from '@mui/icons-material/Timer';
import ReplayIcon from '@mui/icons-material/Replay';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import StatCard from '@components/common/StatCard';
import {
  useGetListenerSummaryQuery, useGetListenersQuery, useGetListenerHistoryQuery,
} from '@features/analytics/analyticsApi';
import type { ListenerPeriod, ListenerRow } from '@apptypes/models';

/** The station's timezone — every timestamp on this page is shown in Zambian local time. */
const STATION_TZ = 'Africa/Lusaka';

const PERIODS: Array<{ value: ListenerPeriod; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom' },
];

/** "2h 14m" / "8m 05s" — compact enough for a table cell, exact enough to be useful. */
const formatDuration = (seconds: number) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
};

const formatDateTime = (iso: string | null) => (iso
  ? new Date(iso).toLocaleString('en-GB', {
    timeZone: STATION_TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  : '—');

const formatTime = (iso: string | null) => (iso
  ? new Date(iso).toLocaleTimeString('en-GB', {
    timeZone: STATION_TZ, hour: '2-digit', minute: '2-digit',
  })
  : '—');

type SortKey = 'total_seconds' | 'session_count' | 'active_days' | 'last_listened_at';

const ListenerAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<ListenerPeriod>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('total_seconds');
  const [selected, setSelected] = useState<ListenerRow | null>(null);

  // A custom range is only sent once both ends are chosen, so the query isn't refetched
  // against a half-filled window while the admin is still picking dates.
  const customReady = period !== 'custom' || (!!from && !!to);
  const query = period === 'custom' ? { period, from, to } : { period };

  const { data: summaryData, isFetching: summaryLoading } = useGetListenerSummaryQuery(query, { skip: !customReady });
  const { data: listenersData, isFetching: listLoading } = useGetListenersQuery(
    { ...query, sortBy, limit: 100 },
    { skip: !customReady },
  );

  const summary = summaryData?.data;
  const listeners = listenersData?.data ?? [];

  const onSort = (key: SortKey) => setSortBy(key);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} sx={{ mb: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Listener Analytics</Typography>
          <Typography variant="body2" color="text.secondary">
            Registered listeners only — guests are never counted here. Times shown in Zambia local time.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={period}
            onChange={(_, v) => v && setPeriod(v)}
          >
            {PERIODS.map((p) => (
              <ToggleButton key={p.value} value={p.value} sx={{ px: 1.5 }}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>

          {period === 'custom' && (
            <>
              <TextField
                size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
                value={from} onChange={(e) => setFrom(e.target.value)}
              />
              <TextField
                size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
                value={to} onChange={(e) => setTo(e.target.value)}
              />
            </>
          )}
        </Stack>
      </Stack>

      {period === 'custom' && !customReady && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose both a start and end date to see results.
        </Typography>
      )}

      {/* ── Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            label="Unique Registered Listeners"
            value={summaryLoading ? '—' : summary?.uniqueListeners ?? 0}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            label="Total Listening Time"
            value={summaryLoading ? '—' : formatDuration(summary?.totalSeconds ?? 0)}
            icon={HeadphonesIcon}
            accent="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            label="Average Listening Duration"
            value={summaryLoading ? '—' : formatDuration(summary?.averageSessionSeconds ?? 0)}
            icon={TimerIcon}
            accent="#0288D1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            label="Returning Listeners"
            value={summaryLoading ? '—' : `${summary?.returningListeners ?? 0} (${summary?.returningPercentage ?? 0}%)`}
            icon={ReplayIcon}
            accent="#ED6C02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            label="Most Active Listener"
            value={summaryLoading ? '—' : (summary?.mostActiveListener?.fullName ?? 'No listeners yet')}
            icon={EmojiEventsIcon}
            accent="#9C27B0"
            trend={summary?.mostActiveListener ? formatDuration(summary.mostActiveListener.totalSeconds) : undefined}
          />
        </Grid>
      </Grid>

      {/* ── Listener table ── */}
      <Card variant="outlined">
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Listeners</Typography>
          <Typography variant="body2" color="text.secondary">
            Sorted by most active. Select a listener to see their full listening history.
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Listener</TableCell>
                <TableCell>Email</TableCell>
                <TableCell sortDirection={sortBy === 'last_listened_at' ? 'desc' : false}>
                  <TableSortLabel active={sortBy === 'last_listened_at'} direction="desc" onClick={() => onSort('last_listened_at')}>
                    Last listened
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortBy === 'total_seconds' ? 'desc' : false}>
                  <TableSortLabel active={sortBy === 'total_seconds'} direction="desc" onClick={() => onSort('total_seconds')}>
                    Total time
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortBy === 'session_count' ? 'desc' : false}>
                  <TableSortLabel active={sortBy === 'session_count'} direction="desc" onClick={() => onSort('session_count')}>
                    Sessions
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortBy === 'active_days' ? 'desc' : false}>
                  <TableSortLabel active={sortBy === 'active_days'} direction="desc" onClick={() => onSort('active_days')}>
                    Active days
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listLoading && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={22} /></TableCell></TableRow>
              )}

              {!listLoading && listeners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No registered listeners in this period yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!listLoading && listeners.map((row) => (
                <TableRow
                  key={row.userId}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelected(row)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={row.avatarUrl ?? undefined} sx={{ width: 30, height: 30 }}>
                        {row.fullName?.[0] ?? '?'}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>{row.fullName}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{row.email}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{formatDateTime(row.lastListenedAt)}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={600}>{formatDuration(row.totalSeconds)}</Typography></TableCell>
                  <TableCell align="right">{row.sessionCount}</TableCell>
                  <TableCell align="right">
                    <Chip size="small" label={row.activeDays} variant={row.activeDays > 1 ? 'filled' : 'outlined'} color={row.activeDays > 1 ? 'success' : 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <ListenerHistoryDialog
        listener={selected}
        query={query}
        onClose={() => setSelected(null)}
      />
    </Box>
  );
};

/** Full session-by-session history for one listener. */
const ListenerHistoryDialog: React.FC<{
  listener: ListenerRow | null;
  query: { period: ListenerPeriod; from?: string; to?: string };
  onClose: () => void;
}> = ({ listener, query, onClose }) => {
  const { data, isFetching } = useGetListenerHistoryQuery(
    { userId: listener?.userId ?? '', ...query },
    { skip: !listener },
  );
  const history = data?.data;

  return (
    <Dialog open={!!listener} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={listener?.avatarUrl ?? undefined}>{listener?.fullName?.[0] ?? '?'}</Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{listener?.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">{listener?.email}</Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isFetching && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>}

        {!isFetching && history && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Total listening time</Typography>
                <Typography variant="h6" fontWeight={700}>{formatDuration(history.totalSeconds)}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Sessions</Typography>
                <Typography variant="h6" fontWeight={700}>{history.sessionCount}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Active days</Typography>
                <Typography variant="h6" fontWeight={700}>{history.activeDays}</Typography>
              </Grid>
            </Grid>

            <TableContainer sx={{ maxHeight: 380 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell align="right">Duration</TableCell>
                    <TableCell>Device</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">No sessions in this period.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {history.sessions.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>
                        {new Date(s.startedAt).toLocaleDateString('en-GB', {
                          timeZone: STATION_TZ, day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>{formatTime(s.startedAt)}</TableCell>
                      <TableCell>{formatTime(s.endedAt)}</TableCell>
                      <TableCell align="right">{formatDuration(s.durationSeconds ?? 0)}</TableCell>
                      <TableCell>{s.deviceType ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ListenerAnalyticsPage;
