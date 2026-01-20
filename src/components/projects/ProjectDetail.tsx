import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Skeleton,
  Tab,
  Tabs,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  AttachMoney as CostIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { Project, ApiKey } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '@/hooks/useNotification';
import { AddApiKeyDialog } from './AddApiKeyDialog';
import { InviteMemberDialog } from './InviteMemberDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openAddKey, setOpenAddKey] = useState(false);
  const { notify } = useNotification();
  const [keyMenuAnchor, setKeyMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [openInviteMember, setOpenInviteMember] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });

  const {
    data: apiKeys = [],
    // isLoading: keysLoading,
  } = useQuery<ApiKey[]>({
    queryKey: ['project-keys', id],
    queryFn: () => projectService.getProjectKeys(id!),
    enabled: !!id,
  });

  // Mock data fallback
  const mockProject: Project = {
    id: id || '1',
    name: 'ChatBot Application',
    description: 'Customer service chatbot using GPT-4 for automated support. This project handles customer inquiries, provides instant responses, and escalates complex issues to human agents.',
    ownerId: 'user1',
    memberCount: 3,
    apiKeyCount: 2,
    role: 'owner',
    members: [
      { userId: 'user1', role: 'owner', name: "John Doe", email: "john.doe@example.com", addedAt: '2024-07-01T00:00:00Z' },
      { userId: 'user2', role: 'admin', name: "Jane Smith", email: "jane.smith@example.com", addedAt: '2024-07-02T00:00:00Z' },
      { userId: 'user3', role: 'member', name: "Bob Johnson", email: "bob.johnson@example.com", addedAt: '2024-07-03T00:00:00Z' },
    ],
    settings: {
      rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 },
      quotas: { daily: 10000, monthly: 300000 },
      allowedProviders: ['openai', 'anthropic'],
    },
    usage: {
      total: {
        cost: 15.2438,
        requests: 1247,
        tokens: 45832
      },
      currentMonth: {
        requests: 389,
        tokens: 12456,
        cost: 4.7821
      },
      currentDay: {
        requests: 23,
        tokens: 1289,
        cost: 0.3456
      },
      lastUpdated: '2024-07-23T05:21:59.737Z'
    },
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-20T10:30:00Z',
  };

  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      keyId:'key1',
      projectId: id || '1',
      name: 'OpenAI Production',
      provider: 'openai',
      keyPrefix: 'sk-...abc123',
      status: 'active',
      lastUsed: '2024-07-22T08:30:00Z',
      createdAt: '2024-07-01T00:00:00Z',
      updatedAt: '2024-07-01T00:00:00Z',
    },
    {
      id: '2',
      keyId:'key2',
      projectId: id || '1',
      name: 'Anthropic Backup',
      provider: 'anthropic',
      keyPrefix: 'sk-...def456',
      status: 'active',
      lastUsed: '2024-07-21T14:20:00Z',
      createdAt: '2024-07-02T00:00:00Z',
      updatedAt: '2024-07-02T00:00:00Z',
    },
    {
      id: '3',
      keyId:'key3',
      projectId: id || '1',
      name: 'Google Testing',
      provider: 'gemini',
      keyPrefix: 'AIz...ghi789',
      status: 'inactive',
      createdAt: '2024-07-03T00:00:00Z',
      updatedAt: '2024-07-03T00:00:00Z',
    },
  ];

  const displayProject = projectError ? mockProject : project;
  const displayApiKeys = Array.isArray(projectError ? mockApiKeys : apiKeys)
    ? (projectError ? mockApiKeys : apiKeys)
    : mockApiKeys;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleKeyMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    keyId: string
  ) => {
    setKeyMenuAnchor(event.currentTarget);
    console.log("Selected key ID:", keyId);
    setSelectedKeyId(keyId);
  };

  const handleKeyMenuClose = () => {
    setKeyMenuAnchor(null);
    setSelectedKeyId(null);
  };


  const handleMemberMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    memberId: string
  ) => {
    setMemberMenuAnchor(event.currentTarget);
    setSelectedMemberId(memberId);
  };

  const handleMemberMenuClose = () => {
    setMemberMenuAnchor(null);
    setSelectedMemberId(null);
  };

  //Add API key mutation
  const addKeyMutation = useMutation({
    mutationFn: (data: { provider: 'openai' | 'anthropic' | 'gemini'; apiKey: string }) =>
      projectService.addProjectKey(id!, { provider: data.provider, apiKey: data.apiKey }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-keys', id] });
      notify('API key added successfully', { type: 'success' });
      setOpenAddKey(false);
    },
    onError: (error: any) => {
      notify(
        error?.response?.data?.error?.message || 'Failed to add API key',
        { type: 'error' }
      );
    },

  });

  const handleAddApiKey = async (data: {
    provider: 'openai' | 'anthropic' | 'gemini';
    apiKey: string;
  }) => {
    console.log("Adding API key with data:", data);
    await addKeyMutation.mutateAsync(data);
  };

  //Delete API key mutation

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: string) =>
      projectService.deleteProjectKey(id!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-keys', id] });
      notify('API key deleted successfully', { type: 'success' });
    },
    onError: () => {
      notify('Failed to delete API key', { type: 'error' });
    },
  });

  const deleteApiKey = async (keyId: string) => {
    await deleteKeyMutation.mutateAsync(keyId);
  }


  //Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: (data: {
      email: string;
      role: 'admin' | 'member' | 'viewer';
    }) => projectService.addProjectMember(id!, data),

    onSuccess: (res) => {
      const data = res.member;
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      notify(`Invited ${data.name}`, { type: 'success' });
      setOpenInviteMember(false);
    },

    onError: (error: any) => {
      notify(
        error?.response?.data?.error?.message || 'Failed to invite member',
        { type: 'error' }
      );
    },
  });

  const inviteMember = async (data: {
    email: string;
    role: 'admin' | 'member' | 'viewer';
  }) => {
    await inviteMemberMutation.mutateAsync(data);
  };


  //Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      projectService.removeProjectMember(id!, memberId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      notify('Member removed successfully', { type: 'success' });
      handleMemberMenuClose();
    },

    onError: () => {
      notify('Failed to remove member', { type: 'error' });
    },
  });

  const removeMember = async (memberId: string) => {
    await removeMemberMutation.mutateAsync(memberId);
  }


  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'openai':
        return { name: 'OpenAI', color: '#00A67E' };
      case 'anthropic':
        return { name: 'Anthropic', color: '#D97757' };
      case 'gemini':
        return { name: 'Gemini', color: '#4285F4' };
      default:
        return { name: provider, color: '#9E9E9E' };
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'default';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  if (projectLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={300} height={40} />
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!displayProject) {
    return (
      <Box>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 3 }}
        >
          Back to Projects
        </Button>
        <Alert severity="error">
          Project not found. It may have been deleted or you don't have access to it.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <IconButton onClick={() => navigate('/projects')}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {displayProject.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {formatDistanceToNow(new Date(displayProject.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate(`/projects/${id}/analytics`)}
          >
            Analytics
          </Button>
          <IconButton onClick={handleMenuClick}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      {projectError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Using demo data - backend API not available. Connect your AI Guard server to see live project data.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {displayProject.description || 'No description provided.'}
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <Chip label={`${displayProject.memberCount || displayProject.members?.length || 0} members`} icon={<PersonIcon />} />
              <Chip label={`${displayApiKeys.length} API keys`} icon={<KeyIcon />} />
              <Chip
                label="Active"
                color="success"
                variant="outlined"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Rate Limiting"
                  secondary={
                    displayProject.settings?.rateLimiting?.enabled
                      ? `${displayProject.settings.rateLimiting.maxRequests} requests/minute`
                      : 'Disabled'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Daily Quota"
                  secondary={displayProject.settings?.quotas?.daily?.toLocaleString() || 'Unlimited'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Allowed Providers"
                  secondary={displayProject.settings?.allowedProviders?.join(', ') || 'All'}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="API Keys" />
            <Tab label="Team Members" />
            <Tab label="Usage Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">API Keys</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddKey(true)}>
              Add API Key
            </Button>
          </Box>

          {displayApiKeys.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              color="text.secondary"
            >
              <KeyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">No API keys configured</Typography>
              <Typography variant="body2">
                Add API keys to start using AI providers
              </Typography>
            </Box>
          ) : (
            <List>
              {displayApiKeys.map((key, index) => {
                const provider = getProviderInfo(key.provider);
                return (
                  <ListItem
                    key={key.id}
                    divider={index < displayApiKeys.length - 1}
                    secondaryAction={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={key.status}
                          size="small"
                          color={key.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleKeyMenuOpen(e, key.keyId)}
                        >
                          <MoreIcon />
                        </IconButton>

                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: provider.color }}>
                        {provider.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={key.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {provider.name} • {key.keyPrefix}
                          </Typography>
                          {key.lastUsed && (
                            <Typography variant="caption" color="text.secondary">
                              Last used {formatDistanceToNow(new Date(key.lastUsed), { addSuffix: true })}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Team Members</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenInviteMember(true)}>
              Invite Member
            </Button>
          </Box>

          <List>
            {displayProject.members?.map((member, index) => (
              <ListItem
                key={member.userId}
                divider={index < (displayProject.members?.length || 0) - 1}
                secondaryAction={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={member.role}
                      size="small"
                      color={getRoleColor(member.role) as any}
                      variant="outlined"
                    />
                    {member.role !== 'owner' && (
                      <IconButton size="small" onClick={(e) => handleMemberMenuOpen(e, member.userId)}>

                        <MoreIcon />
                      </IconButton>
                    )}
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar>
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Added {formatDistanceToNow(new Date(member.addedAt), { addSuffix: true })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Usage Analytics
          </Typography>

          {displayProject.usage ? (
            <Box>
              <Grid container spacing={3}>
                {/* Total Usage */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Total Usage
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayProject.usage.total?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayProject.usage.total?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayProject.usage.total?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>

                {/* Monthly Usage */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <TimeIcon color="secondary" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="secondary">
                        This Month
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayProject.usage.currentMonth?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayProject.usage.currentMonth?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayProject.usage.currentMonth?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>

                {/* Daily Usage */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <CostIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="success.main">
                        Today
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayProject.usage.currentDay?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayProject.usage.currentDay?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayProject.usage.currentDay?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Last Updated */}
              {displayProject.usage.lastUpdated && (
                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {formatDistanceToNow(new Date(displayProject.usage.lastUpdated), { addSuffix: true })}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              color="text.secondary"
            >
              <AnalyticsIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">No usage data available</Typography>
              <Typography variant="body2">
                Usage data will appear here once the project starts being used
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 1 }} />
          Project Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          Delete Project
        </MenuItem>
      </Menu>

      {/* Remove API key menu */}
      <Menu
        anchorEl={keyMenuAnchor}
        open={Boolean(keyMenuAnchor)}
        onClose={handleKeyMenuClose}
      >
        <MenuItem
          onClick={async () => {
            console.log('Deleting key', selectedKeyId);
            if (selectedKeyId) {
              await deleteApiKey(selectedKeyId);
            }
            handleKeyMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete Key
        </MenuItem>
      </Menu>

      {/* Remove Member menu */}
      <Menu
        anchorEl={memberMenuAnchor}
        open={Boolean(memberMenuAnchor)}
        onClose={handleMemberMenuClose}
      >
        <MenuItem
          onClick={async () => {
            if (selectedMemberId) {
              await removeMember(selectedMemberId);
            }
            handleMemberMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Remove Member
        </MenuItem>
      </Menu>



      <AddApiKeyDialog
        open={openAddKey}
        onClose={() => setOpenAddKey(false)}
        existingKeys={displayApiKeys}
        loading={addKeyMutation.isPending}
        onSubmit={handleAddApiKey}
      />

      <InviteMemberDialog
        open={openInviteMember}
        onClose={() => setOpenInviteMember(false)}
        loading={inviteMemberMutation.isPending}
        onSubmit={inviteMember}
      />

    </Box>
  );
};