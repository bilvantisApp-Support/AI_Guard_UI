import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Team, TeamSettings } from '@/types/api';

interface EditTeamDialogProps {
  open: boolean;
  team: Team;
  onClose: () => void;
  onSubmit: (data: { name?: string; description?: string; settings?: TeamSettings }) => Promise<void>;
  loading?: boolean;
}

const schema = yup.object({
  name: yup
    .string()
    .optional()
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters'),
  description: yup
    .string()
    .optional()
    .max(200, 'Description must be less than 200 characters'),
  settings: yup.object({
    plan: yup
      .mixed<'free' | 'pro' | 'enterprise' | 'custom'>()
      .oneOf(['free', 'pro', 'enterprise', 'custom'])
      .optional(),
    rateLimitOverride: yup.object({
      windowMs: yup
        .number()
        .transform((v) => (Number.isNaN(v) ? undefined : v))
        .positive('Must be a positive number')
        .optional(),
      maxRequests: yup
        .number()
        .transform((v) => (Number.isNaN(v) ? undefined : v))
        .positive('Must be a positive number')
        .optional(),
    }).optional(),
    quotaOverride: yup.object({
      dailyLimit: yup
        .number()
        .transform((v) => (Number.isNaN(v) ? undefined : v))
        .positive('Must be a positive number')
        .optional(),
      monthlyLimit: yup
        .number()
        .transform((v) => (Number.isNaN(v) ? undefined : v))
        .positive('Must be a positive number')
        .optional(),
    }).optional(),
  }).optional(),
});

export const EditTeamDialog = ({
  open,
  team,
  onClose,
  onSubmit,
  loading = false,
}: EditTeamDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<{ name?: string; description?: string; settings?: TeamSettings }>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: team.name,
      description: team.description || '',
      settings: {
        ...team.settings,
        plan: team.settings?.plan ?? 'free',
      },
    },
  });

  const selectedPlan = watch('settings.plan');

  const handleFormSubmit = async (data: { name?: string; description?: string; settings?: TeamSettings }) => {
    try {
      await onSubmit({
        name: data.name?.trim(),
        description: data.description?.trim() || undefined,
        settings: data.settings,
      });
      reset();
      onClose();
    } catch {
      // handled by parent
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit),
      }}
    >
      <DialogTitle>Edit Team</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Team Name"
            fullWidth
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            select
            label="Plan"
            fullWidth
            {...register('settings.plan')}
          >
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="pro">Pro</MenuItem>
            <MenuItem value="enterprise">Enterprise</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </TextField>

          {selectedPlan === 'custom' && (
            <>
              <TextField
                label="Daily Quota"
                type="number"
                {...register('settings.quotaOverride.dailyLimit', {
                  valueAsNumber: true,
                })}
                error={!!errors.settings?.quotaOverride?.dailyLimit}
                helperText={errors.settings?.quotaOverride?.dailyLimit?.message}
              />

              <TextField
                label="Monthly Quota"
                type="number"
                {...register('settings.quotaOverride.monthlyLimit', {
                  valueAsNumber: true,
                })}
                error={!!errors.settings?.quotaOverride?.monthlyLimit}
                helperText={errors.settings?.quotaOverride?.monthlyLimit?.message}
              />

              <TextField
                label="Rate Limit (requests)"
                type="number"
                {...register('settings.rateLimitOverride.maxRequests', {
                  valueAsNumber: true,
                })}
                error={!!errors.settings?.rateLimitOverride?.maxRequests}
                helperText={errors.settings?.rateLimitOverride?.maxRequests?.message}
              />

              <TextField
                label="Rate Limit Window (ms)"
                type="number"
                {...register('settings.rateLimitOverride.windowMs', {
                  valueAsNumber: true,
                })}
                error={!!errors.settings?.rateLimitOverride?.windowMs}
                helperText={errors.settings?.rateLimitOverride?.windowMs?.message}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
