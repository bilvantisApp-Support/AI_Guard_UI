import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { APIUser, CreateTokenRequest, PersonalAccessToken, TOKEN_SCOPES } from '@/types/user';
import { Project } from '@/types/api';
import { userService } from '@/services/userService';

interface CreateTokenDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTokenRequest) => Promise<PersonalAccessToken>;
  loading?: boolean;
}

const schema = yup.object({
  name: yup
    .string()
    .required('Token name is required')
    .min(1, 'Token name must be at least 1 character')
    .max(100, 'Token name must be less than 100 characters'),
  scopes: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one scope is required')
    .required('Scopes are required'),
  llmProvider: yup.string().oneOf(['openai', 'anthropic', 'gemini']).optional(),
  projectId: yup.string().optional(),
  userId: yup.string().required('User is required'),
  expiresInDays: yup.number().optional().min(1).max(365),
});


export const CreateTokenDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CreateTokenDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      scopes: ['api:read', 'api:write'],
      llmProvider: 'openai',
      projectId: undefined,
      userId: undefined,
      expiresInDays: 30,
    },
  });

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
    staleTime: 5 * 60 * 1000,
  });

  const selectedProjectId = watch('projectId');

  const { data: selectedProject } = useQuery<Project>({
    queryKey: ['project', selectedProjectId],
    queryFn: () => {
      return projectService.getProject(selectedProjectId!);
    },
  });
  
  const { data: users = [] } = useQuery<APIUser[]>({
    queryKey: ['users', selectedProjectId],
    queryFn: async (): Promise<APIUser[]> => {
      if (selectedProjectId && selectedProject?.members) {
        return selectedProject.members.map((member) => ({
          id: member.userId,
          name: member.name,
          email: member.email,
        }));
      }
      return userService.getActiveUsers();
    },
  });

  const allowedProviders =
    selectedProject?.settings?.allowedProviders ?? [
      'openai',
      'anthropic',
      'gemini',
    ];

  const expiresInDays = watch('expiresInDays');
  const selectedScopes = watch('scopes');

  const getExpirationDate = (days?: number) => {
    if (!days) return 'Never expires';
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit({
        name: data.name,
        scopes: data.scopes,
        llmProvider: data.llmProvider || undefined,
        projectId: data.projectId || undefined,
        userId: data.userId || undefined,
        expiresInDays: data.expiresInDays || undefined,
      });
      reset();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
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
      <DialogTitle>Create Personal Access Token</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <Alert severity="info">
            Personal access tokens function like API keys. Store them securely and never share them.
          </Alert>

          <TextField
            label="Token Name"
            fullWidth
            required
            autoFocus
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message || 'A descriptive name for this token'}
            placeholder="e.g., Production API Access, Mobile App Token"
          />

          <Controller
            name="scopes"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.scopes}>
                <InputLabel>Permissions</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Permissions" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {TOKEN_SCOPES.map((scope) => (
                    <MenuItem key={scope} value={scope}>
                      <Checkbox checked={(field.value || []).includes(scope)} />
                      <ListItemText primary={scope} />
                    </MenuItem>
                  ))}
                </Select>
                {errors.scopes && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.scopes.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Project Scope (Optional)</InputLabel>
                <Select
                  {...field}
                  label="Project Scope (Optional)"
                  value={field.value || ''}
                >
                  <MenuItem value="">
                    <em>All Projects</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  Leave empty to grant access to all projects you have access to
                </Typography>
              </FormControl>
            )}
          />

          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.userId}>
                <InputLabel>User</InputLabel>
                <Select
                  {...field}
                  label="User"
                  value={field.value || ''}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  {selectedProjectId
                    ? 'Only members of the selected project are shown'
                    : 'All users are shown'}
                </Typography>
              </FormControl>
            )}
          />


          <Controller
            name="llmProvider"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.llmProvider}>
                <InputLabel>LLM Provider</InputLabel>
                <Select
                  {...field}
                  label="LLM Provider"
                >
                  <MenuItem value="openai" disabled={!allowedProviders.includes('openai')}>OpenAI</MenuItem>
                  <MenuItem value="anthropic" disabled={!allowedProviders.includes('anthropic')}>Anthropic</MenuItem>
                  <MenuItem value="gemini" disabled={!allowedProviders.includes('gemini')}>Gemini</MenuItem>
                </Select>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                  This token will only be able to access the selected LLM provider
                </Typography>

                {errors.llmProvider && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.llmProvider.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="expiresInDays"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Expiration</InputLabel>
                <Select
                  {...field}
                  label="Expiration"
                  value={field.value || ''}
                >
                  <MenuItem value="">
                    <em>Never expires</em>
                  </MenuItem>
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={30}>30 days</MenuItem>
                  <MenuItem value={60}>60 days</MenuItem>
                  <MenuItem value={90}>90 days</MenuItem>
                  <MenuItem value={365}>1 year</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Typography variant="body2" color="text.secondary">
            This token will {getExpirationDate(expiresInDays || undefined)}
          </Typography>

          {(!expiresInDays) && (
            <Alert severity="warning">
              Tokens that never expire pose a security risk. Consider using a shorter expiration period.
            </Alert>
          )}

          {selectedScopes && selectedScopes.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected permissions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedScopes.map((scope) => (
                  <Chip key={scope} label={scope} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Token'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
