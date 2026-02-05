import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';

type Role = 'admin' | 'member';

interface UpdateMemberForm {
  role: Role;
}

interface UpdateMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (role: Role) => Promise<void>;
  projectName: string;
  memberName: string;
  currentRole: Role;
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

export const UpdateMemberDialog = ({
  open,
  onClose,
  onSubmit,
  projectName,
  memberName,
  currentRole,
  loading,
}: UpdateMemberDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateMemberForm>({
    resolver: yupResolver(schema(currentRole)),
  });

  useEffect(() => {
    if (open) {
      reset({ role: currentRole });
    }
  }, [open, currentRole, reset]);

  const handleFormSubmit = async (data: UpdateMemberForm) => {
    await onSubmit(data.role);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Member</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Project"
            value={projectName}
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
