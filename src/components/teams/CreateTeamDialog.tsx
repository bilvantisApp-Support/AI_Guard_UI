import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  loading?: boolean;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Team name is required')
    .min(3, 'Team name must be at least 3 characters')
    .max(50, 'Team name must be less than 50 characters'),
  description: yup
    .string()
    .transform((value) => (value === '' ? undefined : value))
    .optional()
    .max(200, 'Description must be less than 200 characters'),
});

interface TeamFormData {
  name: string;
  description?: string;
}

export const CreateTeamDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CreateTeamDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormData>({
    resolver: yupResolver(schema) as any,
  });

  const handleFormSubmit = async (data: TeamFormData) => {
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
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(handleFormSubmit),
      }}
    >
      <DialogTitle>Create New Team</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Team Name"
            fullWidth
            required
            autoFocus
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            placeholder="e.g., AI Team"
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message || 'Optional: Describe what this team does'}
            placeholder="e.g., Core AI engineering group..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
