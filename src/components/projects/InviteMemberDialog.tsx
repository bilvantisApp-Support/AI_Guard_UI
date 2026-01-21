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
import { useEffect } from 'react';

interface FormData {
  email: string;
  role: 'admin' | 'member';
}

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

const schema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  role: yup
    .mixed<'admin' | 'member'>()
    .oneOf([ 'admin', 'member'])
    .required('Role is required'),
});

export const InviteMemberDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
}: InviteMemberDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'member',
    },
  });

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(()=>{
    if(open){
      reset();
    }
  },[open,reset])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Member</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Email"
            fullWidth
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
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
          {loading ? 'Inviting...' : 'Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
