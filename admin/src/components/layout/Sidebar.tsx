import React from 'react';
import {
  Drawer, Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_SECTIONS } from '@routes/navConfig';
import { APP_NAME } from '@constants/config';
import logo from '@assets/logo.png';

export const SIDEBAR_WIDTH = 264;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none' },
      }}
    >
      <Box sx={{
        display: 'flex', flexDirection: 'column', gap: 0.5, px: 3, py: 3,
      }}
      >
        <Box
          component="img"
          src={logo}
          alt={APP_NAME}
          sx={{ height: 40, width: 'auto', objectFit: 'contain', alignSelf: 'flex-start' }}
        />
        <Typography variant="caption" color="text.secondary">Admin Dashboard</Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', px: 1.5, flex: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.heading} sx={{ mb: 1.5 }}>
            <Typography variant="overline" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 700, letterSpacing: 0.6 }}>
              {section.heading}
            </Typography>
            <List dense disablePadding>
              {section.items.map((item) => {
                const IconComponent = (Icons as unknown as Record<string, typeof Icons.SpaceDashboard>)[item.icon] ?? Icons.Circle;
                const selected = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    selected={selected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                        '&:hover': { bgcolor: 'primary.main' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <IconComponent fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}>{item.label}</ListItemText>
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">v1.0.0 · © {new Date().getFullYear()} Modern Voice Radio</Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
