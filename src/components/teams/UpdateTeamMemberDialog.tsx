import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';

type Role = 'admin' | 'member';

interface UpdateTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  teamName: string;
  memberName: string;
  currentRole: Role;
  onSubmit: (role: Role) => Promise<void>;
  loading?: boolean;
}

const schema = (currentRole: Role) =>
  yup.object({
    role: yup
      .mixed<Role>()
      .oneOf(['admin', 'member'])
      .required()
      .test(
        'role-not-same',
        'Selected role is same as current role',
        (value) => value !== currentRole
      ),
  });

export const UpdateTeamMemberDialog = ({
  open,
  onClose,
  teamName,
  memberName,
  currentRole,
  onSubmit,
  loading,
}: UpdateTeamMemberDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ role: Role }>({
    resolver: yupResolver(schema(currentRole)),
  });

  useEffect(() => {
    if (open) {
      reset({ role: currentRole });
    }
  }, [open, currentRole, reset]);

  const handleFormSubmit = async (data: { role: Role }) => {
    await onSubmit(data.role);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Update Team Member</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Team"
            value={teamName}
            disabled
            fullWidth
          />

          <TextField
            label="Member"
            value={memberName}
            disabled
            fullWidth
          />

          <TextField
            select
            label="Role"
            fullWidth
            {...register('role')}
            error={!!errors.role}
            helperText={errors.role?.message}
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </TextField>

          {errors.role && (
            <Alert severity="error">{errors.role.message}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
