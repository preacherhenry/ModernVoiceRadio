import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { useAppSelector } from '@app/hooks';
import { buildTheme } from '@theme/index';
import ProtectedRoute from '@routes/ProtectedRoute';
import DashboardLayout from '@components/layout/DashboardLayout';
import LoginPage from '@pages/Auth/LoginPage';
import DashboardPage from '@pages/Dashboard/DashboardPage';
import AnalyticsPage from '@pages/Dashboard/AnalyticsPage';
import ListenerAnalyticsPage from '@pages/Dashboard/ListenerAnalyticsPage';
import ProgramsPage from '@pages/Programs/ProgramsPage';
import PresentersPage from '@pages/Presenters/PresentersPage';
import SchedulePage from '@pages/Schedule/SchedulePage';
import PodcastsPage from '@pages/Podcasts/PodcastsPage';
import PodcastEpisodesPage from '@pages/Podcasts/PodcastEpisodesPage';
import NewsPage from '@pages/News/NewsPage';
import GalleryPage from '@pages/Gallery/GalleryPage';
import AdvertisementsPage from '@pages/Advertisements/AdvertisementsPage';
import SongRequestsPage from '@pages/SongRequests/SongRequestsPage';
import LiveChatPage from '@pages/LiveChat/LiveChatPage';
import NotificationsPage from '@pages/Notifications/NotificationsPage';
import UsersPage from '@pages/Users/UsersPage';
import AudioStreamsPage from '@pages/AudioStreams/AudioStreamsPage';
import SettingsPage from '@pages/Settings/SettingsPage';
import NotFoundPage from '@pages/NotFoundPage';

const App: React.FC = () => {
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const theme = React.useMemo(() => buildTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3500} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/listener-analytics" element={<ListenerAnalyticsPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/presenters" element={<PresentersPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/podcasts" element={<PodcastsPage />} />
                <Route path="/podcasts/:podcastId/episodes" element={<PodcastEpisodesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/advertisements" element={<AdvertisementsPage />} />
                <Route path="/song-requests" element={<SongRequestsPage />} />
                <Route path="/live-chat" element={<LiveChatPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/audio-streams" element={<AudioStreamsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
