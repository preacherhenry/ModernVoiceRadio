export interface NavItem {
  label: string;
  path: string;
  icon: string; // MUI icon component name, resolved in Sidebar.tsx
}

export interface NavSection {
  heading: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: 'SpaceDashboard' },
      { label: 'Analytics', path: '/analytics', icon: 'Insights' },
    ],
  },
  {
    heading: 'Content',
    items: [
      { label: 'Programs', path: '/programs', icon: 'MicExternalOn' },
      { label: 'Presenters', path: '/presenters', icon: 'Groups' },
      { label: 'Schedule', path: '/schedule', icon: 'CalendarMonth' },
      { label: 'Podcasts', path: '/podcasts', icon: 'Podcasts' },
      { label: 'News', path: '/news', icon: 'Newspaper' },
      { label: 'Gallery', path: '/gallery', icon: 'PhotoLibrary' },
    ],
  },
  {
    heading: 'Engagement',
    items: [
      { label: 'Advertisements', path: '/advertisements', icon: 'Campaign' },
      { label: 'Song Requests', path: '/song-requests', icon: 'QueueMusic' },
      { label: 'Live Chat', path: '/live-chat', icon: 'Forum' },
      { label: 'Notifications', path: '/notifications', icon: 'NotificationsActive' },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Audio Streams', path: '/audio-streams', icon: 'GraphicEq' },
      { label: 'Users & Roles', path: '/users', icon: 'AdminPanelSettings' },
      { label: 'Settings', path: '/settings', icon: 'Settings' },
    ],
  },
];
