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
import { Project, UpdateProject } from '@/types/api';

interface EditProjectDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onSubmit: (data: UpdateProject) => Promise<void>;
  loading?: boolean;
}

const schema = yup.object({
  name: yup
    .string()
    .optional()
    .min(3, 'Project name must be at least 3 characters')
    .max(50, 'Project name must be less than 50 characters'),

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

    webhookUrl: yup.string().url('Must be a valid URL').optional(),
  }).optional(),
});

export const EditProjectDialog = ({
  open,
  project,
  onClose,
  onSubmit,
  loading = false,
}: EditProjectDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateProject>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: project.name,
      settings: {
        ...project.settings,
        plan: project.settings?.plan ?? 'free',
      },
    },
  });

  const selectedPlan = watch('settings.plan');

  const handleFormSubmit = async (data: UpdateProject) => {
    try {
      await onSubmit(data);
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
      <DialogTitle>Edit Project</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          {/* Project Name */}
          <TextField
            label="Project Name"
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
