import React from 'react';
import {
  Box, Paper, TextField, Typography, Button, Alert, InputAdornment, IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { useLoginMutation } from '@features/auth/authApi';
import { setSession } from '@features/auth/authSlice';
import { ADMIN_ROLES } from '@constants/config';
import logo from '@assets/logo.png';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});
type FormValues = yup.InferType<typeof schema>;

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [accessDenied, setAccessDenied] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setAccessDenied(false);
    const result = await login(values).unwrap();
    if (!(ADMIN_ROLES as readonly string[]).includes(result.data.user.role)) {
      setAccessDenied(true);
      return;
    }
    dispatch(setSession(result.data));
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #152342, #0A1220)',
      p: 2,
    }}
    >
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{
            bgcolor: '#FFFFFF', borderRadius: 3, px: 2.5, py: 1.5, mb: 1.5,
          }}
          >
            <Box
              component="img"
              src={logo}
              alt="Modern Voice FM"
              sx={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">Admin Dashboard</Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                margin="normal"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {!!error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {'data' in error ? (error.data as { message?: string })?.message : 'Unable to sign in'}
            </Alert>
          )}
          {accessDenied && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This account doesn&apos;t have dashboard access. Contact a super admin to request a role upgrade.
            </Alert>
          )}

          <Button type="submit" fullWidth variant="contained" size="large" disabled={isLoading} sx={{ mt: 3, py: 1.3 }}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
