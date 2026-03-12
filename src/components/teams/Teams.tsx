import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Group as TeamIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Team } from '@/types/api';
import { teamService } from '@/services/teamService';
import { useNotification } from '@/hooks/useNotification';
import { TeamCard } from './TeamCard';
import { CreateTeamDialog } from './CreateTeamDialog';
import { EditTeamDialog } from './EditTeamDialog';
import { APIUser } from '@/types/user';
import { userService } from '@/services/userService';

export const Teams = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; team?: Team }>({
    open: false,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const { notify } = useNotification();
  const queryClient = useQueryClient();

  const {
    data: teams = [],
    isLoading,
    error,
  } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: teamService.getTeams,
    staleTime: 5 * 60 * 1000,
  });

  const { data: User } = useQuery<APIUser>({
       queryKey: ['profile'],
       queryFn: userService.getProfile,
       staleTime: 5 * 60 * 1000
     });
   
     const userRole = User?.role;
     const canCreateTeam = userRole === 'owner' || userRole === 'admin';

  const createMutation = useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      notify('Team created successfully!', { type: 'success' });
    },
    onError: (error: any) => {
      notify( error?.response?.data?.error?.message || 'Failed to create team', { type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; settings?: any } }) =>
      teamService.updateTeam(id, data),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', vars.id] });
      notify('Team updated successfully', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error?.response?.data?.error?.message || 'Failed to update team', { type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: teamService.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      notify('Team deleted successfully!', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to delete team', { type: 'error' });
    },
  });

  const displayTeams = teams || [];
  const safeDisplayTeams = Array.isArray(displayTeams) ? displayTeams : [];

  const filteredTeams = safeDisplayTeams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateTeam = async (data: { name: string; description?: string }) => {
    if (error) {
      notify('Demo mode: Team would be created in real implementation', { type: 'info' });
      setCreateDialogOpen(false);
      return;
    }
    await createMutation.mutateAsync(data);
    setCreateDialogOpen(false);
  };

  const handleDeleteTeam = async () => {
    if (!deleteDialog.team) return;
    if (error) {
      notify('Demo mode: Team would be deleted in real implementation', { type: 'info' });
      setDeleteDialog({ open: false });
      return;
    }
    await deleteMutation.mutateAsync(deleteDialog.team.id);
    setDeleteDialog({ open: false });
  };

  const handleEditMenuOpen = (team: Team) => {
    setEditingTeam(team);
    // Disable access to the edit project dialog box. Enable If needed
    setEditDialogOpen(true);
  };

  const handleEditTeam = async (data: { name?: string; description?: string }) => {
    if (!editingTeam) return;
    await updateMutation.mutateAsync({ id: editingTeam.id, data });
    setEditDialogOpen(false);
    setEditingTeam(null);
  };

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={140} height={36} />
        </Box>
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          Teams
        </Typography>
        {canCreateTeam && <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>setCreateDialogOpen(true)}
        >
          Create Team
        </Button>}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Failed to load teams data. Please try again.
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Search teams..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredTeams.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          color="text.secondary"
        >
          <TeamIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          {searchTerm ? (
            <Typography variant="h6">No teams match your search</Typography>
          ) : (
            <>
              <Typography variant="h6">No teams yet</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Create your first team to manage members and usage
              </Typography>
              {canCreateTeam && <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Your First Team
              </Button>}
            </>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTeams.map((team) => (
            <Grid item xs={12} sm={6} lg={4} key={team.id}>
              <TeamCard
                team={team}
                onEdit={handleEditMenuOpen}
                onDelete={(teamId) =>
                  setDeleteDialog({
                    open: true,
                    team: safeDisplayTeams.find((t) => t.id === teamId),
                  })
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateTeamDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateTeam}
        loading={createMutation.isPending}
      />

      {editingTeam && (
        <EditTeamDialog
          open={editDialogOpen}
          team={editingTeam}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingTeam(null);
          }}
          onSubmit={handleEditTeam}
          loading={updateMutation.isPending}
        />
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.team?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button
            onClick={handleDeleteTeam}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
