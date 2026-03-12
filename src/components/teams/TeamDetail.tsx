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
  People as PeopleIcon,
  Folder as ProjectIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  AttachMoney as CostIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/teamService';
import { projectService } from '@/services/projectService';
import { Team, Project, TeamUsageResponse, TeamProject } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/contexts/AuthContext';
import { InviteTeamMemberDialog } from './InviteTeamMemberDialog';
import { UpdateTeamMemberDialog } from './UpdateTeamMemberDialog';
import { AssignProjectDialog } from './AssignProjectDialog';

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
      id={`team-tabpanel-${index}`}
      aria-labelledby={`team-tab-${index}`}
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

export const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [tabValue, setTabValue] = useState(0);
  const [openInviteMember, setOpenInviteMember] = useState(false);
  const [openEditMember, setOpenEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberMenuAnchor, setMemberMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [openAssignProject, setOpenAssignProject] = useState(false);
  const [teamMenuAnchor, setTeamMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProjectMenuAnchor, setSelectedProjectMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; team?: Team }>({
    open: false,
  });
  const {
    data: team,
    isLoading: teamLoading,
    error: teamError,
  } = useQuery<Team>({
    queryKey: ['team', id],
    queryFn: () => teamService.getTeam(id!),
    enabled: !!id,
  });

  const {
    data: teamUsage,
    isLoading: usageLoading,
  } = useQuery<TeamUsageResponse>({
    queryKey: ['team-usage', id],
    queryFn: () => teamService.getTeamUsage(id!),
    enabled: !!id,
  });

  const {
    data: projects = [],
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const displayTeam = team;
  const assignedProjects: TeamProject[] = displayTeam?.projects || [];

  const currentMember = displayTeam?.members?.find((m) => m.email == user?.email);
  const currentUserRole = currentMember?.role;
  const isOwner = currentUserRole === 'owner';
  const isAdmin = currentUserRole === 'admin';
  const isOwnerOrAdmin = isOwner || isAdmin;
  const showTeamSettings = false;

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

  const handleProjectMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    projectId: string
  ) => {
    setSelectedProjectMenuAnchor(event.currentTarget);
    setSelectedProjectId(projectId);
  };

  const handleProjectMenuClose = () => {
    setSelectedProjectMenuAnchor(null);
    setSelectedProjectId(null);
  };

  const inviteMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: 'admin' | 'member' }) =>
      teamService.addTeamMember(id!, data),
    onSuccess: (res) => {
      const data = res.member;
      queryClient.invalidateQueries({ queryKey: ['team', id] });
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

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, role }: UpdateMemberPayload) =>
      teamService.updateTeamMember(id!, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      notify('Member updated successfully', { type: 'success' });
      handleMemberMenuClose();
    },
    onError: () => {
      notify('Failed to update member', { type: 'error' });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      teamService.removeTeamMember(id!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      notify('Member removed successfully', { type: 'success' });
      handleMemberMenuClose();
    },
    onError: () => {
      notify('Failed to remove member', { type: 'error' });
    },
  });

  const assignProjectMutation = useMutation({
    mutationFn: (data: { projectId: string }) =>
      teamService.assignTeamProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify('Project assigned to team', { type: 'success' });
      setOpenAssignProject(false);
    },
    onError: () => {
      notify('Failed to assign project', { type: 'error' });
    },
  });

  const removeProjectMutation = useMutation({
    mutationFn: (projectId: string) =>
      teamService.removeTeamProject(id!, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify('Project removed from team', { type: 'success' });
      handleProjectMenuClose();
    },
    onError: () => {
      notify('Failed to remove project', { type: 'error' });
    },
  });

  //Delete Team Mutation 
  const deleteTeamMutation = useMutation({
    mutationFn: teamService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      notify('Team deleted successfully!', { type: 'success' });
      navigate('/teams');
    },
    onError: (error: any) => {
      notify(
        error?.response?.data?.error?.message || 'Failed to delete team',
        { type: 'error' }
      );
    },
  });

  const handleDeleteTeam = async () => {
    if (!deleteDialog.team) return;
    await deleteTeamMutation.mutateAsync(deleteDialog.team.id);
    setDeleteDialog({ open: false });
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

  if (teamLoading) {
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

  if (teamError || !displayTeam) {
    return (
      <Box>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/teams')}
          sx={{ mb: 3 }}
        >
          Back to Teams
        </Button>
        <Alert severity="error">
          Team not found. It may have been deleted or you don't have access to it.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <IconButton onClick={() => navigate('/teams')}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              {displayTeam.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Created {formatDistanceToNow(new Date(displayTeam.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => setTabValue(2)}
          >
            Analytics
          </Button>
          <IconButton onClick={(e) => setTeamMenuAnchor(e.currentTarget)}>
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>

      {teamError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Failed to load teams data. Please try again.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {displayTeam.description || 'No description provided.'}
            </Typography>

            <Box display="flex" gap={2} mb={2}>
              <Chip label={`${displayTeam.memberCount || displayTeam.members?.length || 0} members`} icon={<PeopleIcon />} />
              <Chip label={`${assignedProjects.length} projects`} icon={<ProjectIcon />} />
              <Chip label="Active" color="success" variant="outlined" />
            </Box>
          </Grid>

        </Grid>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Team Members" />
            <Tab label="Projects" />
            <Tab label="Usage Analytics" />
            <Tab label="Member Usage Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Team Members</Typography>
            {isOwnerOrAdmin && <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenInviteMember(true);
              }}
            >
              Invite Member
            </Button>}
          </Box>

          <List>
            {displayTeam.members?.map((member, index) => (
              <ListItem
                key={member.memberUserId}
                divider={index < (displayTeam.members?.length || 0) - 1}
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

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Projects</Typography>
            {isOwnerOrAdmin && <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setOpenAssignProject(true);
              }}
            >
              Assign Project
            </Button>}
          </Box>

          {assignedProjects.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              color="text.secondary"
            >
              <ProjectIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant="body1">No projects assigned</Typography>
              <Typography variant="body2">
                Assign projects to this team to track usage
              </Typography>
            </Box>
          ) : (
            <List>
              {assignedProjects.map((project, index) => (
                <ListItem
                  key={project.id}
                  divider={index < assignedProjects.length - 1}
                  secondaryAction={
                    isOwnerOrAdmin ? (
                      <IconButton size="small" onClick={(e) => handleProjectMenuOpen(e, project.id)}>
                        <MoreIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      {project.name ? project.name.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={project.name}
                  />
                  <Button size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                    View Project
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Usage Analytics
          </Typography>

          {displayTeam.usage ? (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <TrendingUpIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Total Usage
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayTeam.usage.total?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayTeam.usage.total?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayTeam.usage.total?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <TimeIcon color="secondary" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="secondary">
                        This Month
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayTeam.usage.currentMonth?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayTeam.usage.currentMonth?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayTeam.usage.currentMonth?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                      <CostIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
                      <Typography variant="h6" color="success.main">
                        Today
                      </Typography>
                    </Box>
                    <Typography variant="h4" gutterBottom>
                      {displayTeam.usage.currentDay?.requests || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requests
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {(displayTeam.usage.currentDay?.tokens || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Tokens
                    </Typography>
                    <Typography variant="h6">
                      ${(displayTeam.usage.currentDay?.cost || 0).toFixed(4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {displayTeam.usage.lastUpdated && (
                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {formatDistanceToNow(new Date(displayTeam.usage.lastUpdated), { addSuffix: true })}
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
                Usage data will appear here once the team starts using assigned projects
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
              {displayTeam.members?.map((member) => {
                const usage = teamUsage?.byUser?.[member.memberUserId] ?? {
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
        anchorEl={teamMenuAnchor}
        open={Boolean(teamMenuAnchor)}
        onClose={() => setTeamMenuAnchor(null)}
      >
        {showTeamSettings && <MenuItem onClick={() => setTeamMenuAnchor(null)}>
          <SettingsIcon sx={{ mr: 1 }} />
          Team Settings
        </MenuItem>}
        {isOwner && (
          <MenuItem sx={{ color: 'error.main' }}
            onClick={() => {
              setDeleteDialog({ open: true, team: displayTeam });
              setTeamMenuAnchor(null);
            }}>
            Delete Team
          </MenuItem>
        )}
      </Menu>

      {isOwnerOrAdmin && (
        <Menu
          anchorEl={memberMenuAnchor}
          open={Boolean(memberMenuAnchor)}
          onClose={handleMemberMenuClose}
        >
          <MenuItem
            onClick={() => {
              const member = displayTeam.members?.find(
                (m) => m.memberUserId.toString() === selectedMemberId?.toString()
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
                await removeMemberMutation.mutateAsync(selectedMemberId);
              }
              handleMemberMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            Remove Member
          </MenuItem>
        </Menu>
      )}

      {isOwnerOrAdmin && (
        <Menu
          anchorEl={selectedProjectMenuAnchor}
          open={Boolean(selectedProjectMenuAnchor)}
          onClose={handleProjectMenuClose}
        >
          <MenuItem
            onClick={async () => {
              if (selectedProjectId) {
                await removeProjectMutation.mutateAsync(selectedProjectId);
              }
              handleProjectMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            Remove Project
          </MenuItem>
        </Menu>
      )}

      <InviteTeamMemberDialog
        open={openInviteMember}
        onClose={() => setOpenInviteMember(false)}
        loading={inviteMemberMutation.isPending}
        onSubmit={async (data) => {
          await inviteMemberMutation.mutateAsync(data);
        }}
      />

      {editingMember && (
        <UpdateTeamMemberDialog
          open={openEditMember}
          onClose={() => setOpenEditMember(false)}
          teamName={displayTeam.name}
          memberName={editingMember.name}
          currentRole={editingMember.role}
          loading={updateMemberMutation.isPending}
          onSubmit={async (role) => {
            await updateMemberMutation.mutateAsync({
              memberId: editingMember.memberUserId,
              role,
            });
            setOpenEditMember(false);
          }}
        />
      )}

      <AssignProjectDialog
        open={openAssignProject}
        onClose={() => setOpenAssignProject(false)}
        loading={assignProjectMutation.isPending}
        onSubmit={async (data) => {
          await assignProjectMutation.mutateAsync(data);
        }}
        projects={projects}
        assignedProjects={assignedProjects}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.team?.name}"?
            This action cannot be undone and will remove all associated API keys and data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button
            onClick={handleDeleteTeam}
            color="error"
            variant="contained"
            disabled={deleteTeamMutation.isPending}
          >
            {deleteTeamMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
