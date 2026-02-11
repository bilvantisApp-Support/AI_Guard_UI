import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { APIUser } from '@/types/user';

interface FormData {
  email: string;
  role: 'admin' | 'member';
}

interface InviteTeamMemberDialogProps {
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
    .oneOf(['admin', 'member'])
    .required('Role is required'),
});

export const InviteTeamMemberDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
}: InviteTeamMemberDialogProps) => {
  const [search, setSearch] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'member',
    },
  });

  const { data: users = [], isLoading } = useQuery<APIUser[]>({
    queryKey: ['users'],
    queryFn: userService.getActiveUsers,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Team Member</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Autocomplete
                freeSolo
                loading={isLoading}
                options={filteredUsers}
                getOptionLabel={(option) =>
                  typeof option === 'string'
                    ? option
                    : `${option.name} (${option.email})`
                }
                onInputChange={(_, value) => setSearch(value)}
                onChange={(_, value) => {
                  if (typeof value === 'string') {
                    field.onChange(value);
                  } else if (value) {
                    field.onChange(value.email);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            )}
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
