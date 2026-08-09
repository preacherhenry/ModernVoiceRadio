import React from 'react';
import {
  Grid, Typography, Card, Box, CircularProgress, Stack,
} from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from 'recharts';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import PeopleIcon from '@mui/icons-material/People';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PublicIcon from '@mui/icons-material/Public';
import StatCard from '@components/common/StatCard';
import {
  useGetOverviewQuery, useGetTrendQuery, useGetCountriesQuery, useGetDevicesQuery,
} from '@features/analytics/analyticsApi';

function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

const DashboardPage: React.FC = () => {
  const { data: overview, isLoading: overviewLoading } = useGetOverviewQuery(undefined, { pollingInterval: 15000 });
  const { data: trend } = useGetTrendQuery({ days: 30 });
  const { data: countries } = useGetCountriesQuery();
  const { data: devices } = useGetDevicesQuery();

  const stats = overview?.data;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Live overview of station performance</Typography>

      {overviewLoading ? (
        <CircularProgress size={28} />
      ) : (
        <Grid container spacing={2.5} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Live Listeners" value={stats?.liveListeners ?? 0} icon={HeadphonesIcon} accent="#B80818" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Today's Sessions" value={stats?.todaySessions ?? 0} icon={ScheduleIcon} accent="#336293" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Unique Listeners Today" value={stats?.todayUniqueListeners ?? 0} icon={PeopleIcon} accent="#F6CB14" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Total Listening Time" value={formatDuration(stats?.todayTotalDurationSeconds ?? 0)} icon={PublicIcon} accent="#1F487C" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ p: 3, height: 380 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Listening Trend (30 days)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={trend?.data ?? []}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#336293" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#336293" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total_sessions" stroke="#336293" fill="url(#colorSessions)" strokeWidth={2} name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 3, height: 380, overflowY: 'auto' }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Top Countries</Typography>
            <Stack spacing={1.5}>
              {(countries?.data ?? []).slice(0, 8).map((c) => (
                <Box key={c.country} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{c.country}</Typography>
                  <Typography variant="body2" fontWeight={700}>{c.count}</Typography>
                </Box>
              ))}
              {!countries?.data?.length && <Typography variant="body2" color="text.secondary">No listener data yet.</Typography>}
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ p: 3, height: 320 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Listeners by Device</Typography>
            <ResponsiveContainer width="100%" height="82%">
              <BarChart data={devices?.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="device_type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#F6CB14" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
