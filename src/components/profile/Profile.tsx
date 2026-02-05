import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/useNotification';
import { formatDistanceToNow } from 'date-fns';

const schema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
});

interface FormData {
  name: string;
}

export const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { notify } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const handleEdit = () => {
    setValue('name', user?.name || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleSave = async (data: FormData) => {
    try {
      await updateUserProfile(data.name);
      notify('Profile updated successfully!', { type: 'success' });
      setIsEditing(false);
    } catch (error: any) {
      notify(error.message || 'Failed to update profile', { type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      notify('Logged out successfully', { type: 'success' });
    } catch (error) {
      notify('Error logging out', { type: 'error' });
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'primary';
      case 'pro':
        return 'secondary';
      case 'free':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'Enterprise';
      case 'pro':
        return 'Pro';
      case 'free':
        return 'Free';
      default:
        return tier;
    }
  };

  if (!user) {
    return (
      <Box>
        <Alert severity="error">
          User data not available. Please refresh the page or log in again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile & Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Profile Information</Typography>
              {!isEditing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </Button>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  bgcolor: 'primary.main'
                }}
              >
                {user.name?.[0] || user.email?.[0] || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {user.name || 'No name set'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip
                    label={getTierLabel(user.tier)}
                    size="small"
                    color={getTierColor(user.tier) as any}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Member since{' '}
                    {user.createdAt
                      ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })
                      : '—'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit(handleSave)}>
                <TextField
                  label="Display Name"
                  fullWidth
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 3 }}
                />
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <List>
                <ListItem>
                  <ListItemText
                    primary="Display Name"
                    secondary={user.name || 'Not set'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email Address"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Account Type"
                    secondary={getTierLabel(user.tier)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Updated"
                    secondary={formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                  />
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Account Settings */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <List>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </ListItem>
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={usageAlerts}
                      onChange={(e) => setUsageAlerts(e.target.checked)}
                    />
                  }
                  label="Usage Alerts"
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                fullWidth
                onClick={() => notify('Password reset functionality coming soon', { type: 'info' })}
              >
                Change Password
              </Button>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
              >
                Sign Out
              </Button>
              <Divider sx={{ my: 1 }} />
              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowDeleteDialog(true)}
                fullWidth
              >
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Usage Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Usage
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary">
                    8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API Keys
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access Tokens
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Warning:</strong> This action cannot be undone.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This will permanently remove:
          </Typography>
          <Box component="ul" sx={{ mt: 2 }}>
            <li>All your projects and associated data</li>
            <li>API keys and access tokens</li>
            <li>Usage history and analytics</li>
            <li>Team memberships</li>
          </Box>
          <Typography sx={{ mt: 2 }}>
            If you're sure, please type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            placeholder="Type DELETE to confirm"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={() => {
              notify('Account deletion is not available in demo mode', { type: 'info' });
              setShowDeleteDialog(false);
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};