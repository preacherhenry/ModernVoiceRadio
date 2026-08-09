import React, { useState } from 'react';
import {
  AppBar, Toolbar, Box, IconButton, Avatar, Menu, MenuItem, Typography, Tooltip, Badge,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { toggleThemeMode } from '@features/ui/uiSlice';
import { signedOut } from '@features/auth/authSlice';
import { useLogoutMutation } from '@features/auth/authApi';
import { SIDEBAR_WIDTH } from './Sidebar';

const Topbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, refreshToken } = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const [logout] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    if (refreshToken) {
      try { await logout({ refreshToken }).unwrap(); } catch { /* proceed with local sign-out regardless */ }
    }
    dispatch(signedOut());
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: `${SIDEBAR_WIDTH}px`,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Toggle theme">
          <IconButton onClick={() => dispatch(toggleThemeMode())}>
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton>
            <Badge color="error" variant="dot" invisible>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box sx={{ ml: 1 }}>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
              {(user?.fullName ?? 'A').slice(0, 1).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>{user?.fullName ?? 'Admin'}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
            </Box>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Log out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
