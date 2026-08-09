import React, { useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Stack, Card, Select, MenuItem, Switch,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import type { AdminUser } from '@apptypes/models';
import { useGetUsersQuery, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '@features/users/usersApi';
import { useAppSelector } from '@app/hooks';

const ROLE_OPTIONS = ['listener', 'moderator', 'editor', 'admin', 'super_admin'];
const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'warning' | 'error'> = {
  listener: 'default', moderator: 'secondary', editor: 'primary', admin: 'warning', super_admin: 'error',
};

const UsersPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useAppSelector((state) => state.auth.user);
  const canManageRoles = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const [search, setSearch] = useState('');
  const { data, isLoading, isFetching } = useGetUsersQuery({ search: search || undefined });
  const [updateRole] = useUpdateUserRoleMutation();
  const [updateStatus] = useUpdateUserStatusMutation();

  const handleRoleChange = async (id: string, roleName: string) => {
    try {
      await updateRole({ id, roleName }).unwrap();
      enqueueSnackbar('Role updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to update role', { variant: 'error' });
    }
  };

  const handleStatusToggle = async (user: AdminUser) => {
    try {
      await updateStatus({ id: user.id, isActive: !user.is_active }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const columns: GridColDef<AdminUser>[] = [
    {
      field: 'full_name',
      headerName: 'User',
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={600}>{params.row.full_name}</Typography>
          {params.row.is_verified && <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
        </Stack>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
    { field: 'phone', headerName: 'Phone', width: 140, valueGetter: (_value, row) => row.phone || '—' },
    {
      field: 'role_name',
      headerName: 'Role',
      width: 180,
      renderCell: (params) => {
        const isSelf = params.row.id === currentUser?.id;
        if (!canManageRoles || isSelf) {
          return <Chip size="small" label={params.value} color={ROLE_COLORS[params.value] ?? 'default'} sx={{ textTransform: 'capitalize' }} />;
        }
        return (
          <Select
            size="small"
            value={params.row.role_name}
            onChange={(e) => handleRoleChange(params.row.id, e.target.value)}
            sx={{ width: '100%' }}
          >
            {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r.replace('_', ' ')}</MenuItem>)}
          </Select>
        );
      },
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <Switch
          size="small"
          checked={params.value}
          disabled={params.row.id === currentUser?.id}
          onChange={() => handleStatusToggle(params.row)}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Joined',
      width: 130,
      valueFormatter: (value) => format(new Date(value as string), 'MMM d, yyyy'),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Users & Roles</Typography>
          <Typography variant="body2" color="text.secondary">Manage listener accounts and staff permissions</Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: 320 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <DataGrid
          autoHeight
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading || isFetching}
          disableRowSelectionOnClick
          getRowHeight={() => 60}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Card>
    </Box>
  );
};

export default UsersPage;
