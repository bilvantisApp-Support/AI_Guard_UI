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
  Fab,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Folder as ProjectIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectCard } from './ProjectCard';
import { CreateProjectDialog } from './CreateProjectDialog';
import { projectService } from '@/services/projectService';
import { useNotification } from '@/hooks/useNotification';
import { Project, UpdateProject } from '@/types/api';
import { EditProjectDialog } from './EditProjectDialog';
import { APIUser } from '@/types/user';
import { userService } from '@/services/userService';

export const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: Project }>({
    open: false,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { notify } = useNotification();
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
    staleTime: 5 * 60 * 1000,
  });
  const { data: User } = useQuery<APIUser>({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000
  });

  const userRole = User?.role;
  const canCreateProject = userRole === 'owner' || userRole === 'admin';

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify('Project created successfully!', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to create project', { type: 'error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProject }) =>
      projectService.updateProject(id, data),

    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', vars.id] });
      notify('Project updated successfully', { type: 'success' });
    },

    onError: (error: any) => {
      notify(
        error?.response?.data?.error?.message || 'Failed to update project',
        { type: 'error' }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      notify('Project deleted successfully!', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to delete project', { type: 'error' });
    },
  });

  const displayProjects = projects;

  // Ensure displayProjects is always an array
  const safeDisplayProjects = Array.isArray(displayProjects) ? displayProjects : [];

  // Debug logging to help troubleshoot the issue
  if (!Array.isArray(displayProjects)) {
    console.error('displayProjects is not an array:', {
      displayProjects,
      projects,
      error,
      type: typeof displayProjects
    });
  }

  const filteredProjects = safeDisplayProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProject = async (data: { name: string; description?: string }) => {
    if (error) {
      // Simulate creation in demo mode
      notify('Demo mode: Project would be created in real implementation', { type: 'info' });
      setCreateDialogOpen(false);
      return;
    }
    await createMutation.mutateAsync(data);


  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.project) return;

    if (error) {
      // Simulate deletion in demo mode
      notify('Demo mode: Project would be deleted in real implementation', { type: 'info' });
      setDeleteDialog({ open: false });
      return;
    }

    await deleteMutation.mutateAsync(deleteDialog.project.id);


    setDeleteDialog({ open: false });
  };

  const handleEditMenuOpen = (project: Project) => {
    setEditingProject(project);
    // Disable access to the edit project dialog box. Enable If needed
    setEditDialogOpen(false);
  }

  const handleEditProject = async (data: UpdateProject) => {
    if (!editingProject) return;

    await updateMutation.mutateAsync({
      id: editingProject.id,
      data,
    });

    setEditDialogOpen(false);
    setEditingProject(null);
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
          Projects
        </Typography>
        {canCreateProject && <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Project
        </Button>}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Using demo data - backend API not available. Connect your AI Guard server to manage real projects.
        </Alert>
      )}

      <TextField
        fullWidth
        placeholder="Search projects..."
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

      {filteredProjects.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          color="text.secondary"
        >
          <ProjectIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5 }} />
          {searchTerm ? (
            <Typography variant="h6">No projects match your search</Typography>
          ) : (
            <>
              <Typography variant="h6">No projects yet</Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Create your first project to start managing AI API access
              </Typography>
              {canCreateProject && <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Your First Project
              </Button>}
            </>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} lg={4} key={project.id}>
              <ProjectCard
                project={project}
                onEdit={handleEditMenuOpen}
                onDelete={(projectId) =>
                  setDeleteDialog({
                    open: true,
                    project: safeDisplayProjects.find((p) => p.id === projectId),
                  })
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      {canCreateProject && <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>}

      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
        loading={createMutation.isPending}
      />

      {editingProject && (
        <EditProjectDialog
          open={editDialogOpen}
          project={editingProject}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleEditProject}
          loading={updateMutation.isPending}
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
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};