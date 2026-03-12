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
  Alert,
  Skeleton,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { Project, ApiKey, ProjectUsageResponse } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '@/hooks/useNotification';
import { AddApiKeyDialog } from './AddApiKeyDialog';
import { InviteMemberDialog } from './InviteMemberDialog';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateMemberDialog } from './UpdateMemberDialog';

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

type UpdateMemberPayload = {
  memberId: string,
  role: 'admin' | 'member'
}

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openAddKey, setOpenAddKey] = useState(false);
  const { user } = useAuth();
  const { notify } = useNotification();
  const [keyMenuAnchor, setKeyMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [openInviteMember, setOpenInviteMember] = useState(false);
  const [openEditMember, setOpenEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: Project }>({
    open: false,
  });

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
  } = useQuery<ApiKey[]>({
    queryKey: ['project-keys', id],
    queryFn: () => projectService.getProjectKeys(id!),
    enabled: !!id,
  });

  const {
    data: projectUsage,
    isLoading: usageLoading,
  } = useQuery<ProjectUsageResponse>({
    queryKey: ['project-usage', id],
    queryFn: () => projectService.getProjectUsage(id!),
    enabled: !!id
  });

  const displayProject = project;
  const displayApiKeys = apiKeys;

  const currentMember = displayProject?.members?.find((m) => m.email == user?.email);
  const currentUserRole = currentMember?.role;

  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const isOwnerOrAdmin = isOwner || isAdmin;

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
        error?.response?.data?.error?.message || error?.response?.data?.error?.details?.error?.message || 'Failed to add API key',
        { type: 'error' }
      );
    },

  });

  const handleAddApiKey = async (data: {
    provider: 'openai' | 'anthropic' | 'gemini';
    apiKey: string;
  }) => {
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
      role: 'admin' | 'member';
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
    role: 'admin' | 'member';
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
  //Remove member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: UpdateMemberPayload) =>
      projectService.updateProjectMember(id!, memberId, { role }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      notify('Member Updated successfully', { type: 'success' });
      handleMemberMenuClose();
    },

    onError: () => {
      notify('Failed to Update member', { type: 'error' });
    },
  });

  const updateMember = async ({ memberId, role }: UpdateMemberPayload) => {
    await updateMemberMutation.mutateAsync({ memberId, role });
  }

  //Delete Project Mutation 
  const deleteProjectMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify('Project deleted successfully!', { type: 'success' });
      navigate('/projects');
    },
    onError: (error: any) => {
      notify(
        error?.response?.data?.error?.message || 'Failed to delete project',
        { type: 'error' }
      );
    },
  });

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;
    await deleteProjectMutation.mutateAsync(deleteDialog.project.id);
    setDeleteDialog({ open: false });
  };

  const showProjectSettings = false;

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
      default:
        return 'default';
    }
  };

  const getDailyQuotaRemaining = (project: Project) => {
    if (!project) return '—';

    const dailyLimit = project.settings?.quotaOverride?.dailyLimit;
    const dailyUsed = project.usage?.currentDay?.requests ?? 0;

    if (!dailyLimit) return 'Unlimited';

    const remaining = Math.max(0, dailyLimit - dailyUsed);

    return `${remaining} / ${dailyLimit}`;
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

  if (projectError || !displayProject) {
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
          Failed to load projects data. Please try again.
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
                    displayProject.settings?.rateLimitOverride?.maxRequests != null
                      ? `${displayProject.settings.rateLimitOverride.maxRequests} requests/minute`
                      : 'Disabled'
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Daily Quota"
                  secondary={getDailyQuotaRemaining(displayProject)}
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
            <Tab label="Member Usage Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">API Keys</Typography>
            {isOwnerOrAdmin && <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setOpenAddKey(true);
            }}>
              Add API Key
            </Button>}
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
                          label={key.isActive === true ? 'Active' : 'Inactive'}
                          size="small"
                          color={key.isActive === true ? 'success' : 'default'}
                          variant="outlined"
                        />
                        {isOwnerOrAdmin && <IconButton
                          size="small"
                          onClick={(e) => handleKeyMenuOpen(e, key.keyId)}
                        >
                          <MoreIcon />
                        </IconButton>}

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
                            {provider.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {key.maskedKey}
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
            {isOwnerOrAdmin && <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
              setOpenInviteMember(true);
            }}>
              Invite Member
            </Button>}
          </Box>

          <List>
            {displayProject.members?.map((member, index) => (
              <ListItem
                key={member.memberUserId}
                divider={index < (displayProject.members?.length || 0) - 1}
                secondaryAction={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={member.role}
                      size="small"
                      color={getRoleColor(member.role) as any}
                      variant="outlined"
                    />
                    {isOwnerOrAdmin && (
                      <IconButton size="small" onClick={(e) => handleMemberMenuOpen(e, member.memberUserId)}>
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
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Member Usage Analytics
          </Typography>

          {usageLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <Grid container spacing={3}>
              {displayProject.members?.map((member) => {
                const usage = projectUsage?.byUser?.[member.memberUserId] ?? {
                  requests: 0,
                  tokens: 0,
                  cost: 0,
                };

                return (
                  <Grid item xs={12} md={6} key={member.memberUserId}>
                    <Paper sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ mr: 2 }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Requests
                          </Typography>
                          <Typography fontWeight={600}>
                            {usage.requests}
                          </Typography>
                        </Grid>

                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Tokens
                          </Typography>
                          <Typography fontWeight={600}>
                            {usage.tokens}
                          </Typography>
                        </Grid>

                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary">
                            Cost
                          </Typography>
                          <Typography fontWeight={600}>
                            ${usage.cost.toFixed(4)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </TabPanel>

      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {showProjectSettings && <MenuItem onClick={handleMenuClose}>
          <SettingsIcon sx={{ mr: 1 }} />
          Project Settings
        </MenuItem>}
        {isOwner && (
          <MenuItem sx={{ color: 'error.main' }}
            onClick={() => {
              setDeleteDialog({ open: true, project: displayProject });
              handleMenuClose();
            }}
          >
            Delete Project
          </MenuItem>
        )}
      </Menu>

      {/* Remove API key menu */}
      {isOwnerOrAdmin && (
        <Menu
          anchorEl={keyMenuAnchor}
          open={Boolean(keyMenuAnchor)}
          onClose={handleKeyMenuClose}
        >
          <MenuItem
            onClick={async () => {
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
      )}


      {/* Update and Remove Member menu */}
      {isOwnerOrAdmin && (
        <Menu
          anchorEl={memberMenuAnchor}
          open={Boolean(memberMenuAnchor)}
          onClose={handleMemberMenuClose}
        >
          <MenuItem
            onClick={() => {
              const member = displayProject.members?.find(
                (m) => m.memberUserId === selectedMemberId
              );
              setEditingMember(member);
              setOpenEditMember(true);
              handleMemberMenuClose();
            }}
          >
            Update Member
          </MenuItem>

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
      )}


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

      {editingMember && (
        <UpdateMemberDialog
          open={openEditMember}
          onClose={() => setOpenEditMember(false)}
          projectName={displayProject.name}
          memberName={editingMember.name}
          currentRole={editingMember.role}
          loading={updateMemberMutation.isPending}
          onSubmit={async (role) => {
            await updateMember({
              memberId: editingMember.memberUserId,
              role,
            });
          }}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.project?.name}"?
            This action cannot be undone and will remove all associated API keys and data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button
            onClick={handleDeleteProject}
            color="error"
            variant="contained"
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
