import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface Props {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  accent?: string;
  trend?: string;
}

const StatCard: React.FC<Props> = ({
  label, value, icon: Icon, accent = '#336293', trend,
}) => (
  <Card variant="outlined" sx={{ p: 2.5, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: `${accent}1F`,
      }}
      >
        <Icon sx={{ color: accent }} />
      </Box>
      {trend && <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>{trend}</Typography>}
    </Box>
    <Typography variant="h4" fontWeight={700}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
  </Card>
);

export default StatCard;
