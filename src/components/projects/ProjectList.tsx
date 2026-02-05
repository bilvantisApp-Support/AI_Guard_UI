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
import { Project } from '@/types/api';

export const ProjectList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; project?: Project }>({
    open: false,
  });

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

  // Mock data fallback when API is not available
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'ChatBot Application',
      description: 'Customer service chatbot using GPT-4 for automated support',
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
      createdAt: '2024-07-01T00:00:00Z',
      updatedAt: '2024-07-20T10:30:00Z',
    },
    {
      id: '2',
      name: 'Content Generator',
      description: 'AI-powered content generation for marketing materials',
      ownerId: 'user1',
      memberCount: 2,
      apiKeyCount: 1,
      role: 'owner',
      members: [
        { userId: 'user1', role: 'owner', name: "John Doe", email: "john.doe@example.com", addedAt: '2024-07-05T00:00:00Z' },
        { userId: 'user4', role: 'member', name: "John Doe", email: "john.doe@example.com", addedAt: '2024-07-06T00:00:00Z' },
      ],
      settings: {
        rateLimiting: { enabled: true, maxRequests: 500, windowMs: 60000 },
        quotas: { daily: 5000, monthly: 150000 },
        allowedProviders: ['openai', 'gemini'],
      },
      createdAt: '2024-07-05T00:00:00Z',
      updatedAt: '2024-07-21T14:20:00Z',
    },
    {
      id: '3',
      name: 'Research Assistant',
      description: 'Document analysis and research automation using Claude',
      ownerId: 'user1',
      memberCount: 1,
      apiKeyCount: 1,
      role: 'owner',
      members: [
        { userId: 'user1', role: 'owner', name: "John Doe", email: "john.doe@example.com", addedAt: '2024-07-10T00:00:00Z' },
      ],
      settings: {
        rateLimiting: { enabled: true, maxRequests: 200, windowMs: 60000 },
        quotas: { daily: 2000, monthly: 60000 },
        allowedProviders: ['anthropic'],
      },
      createdAt: '2024-07-10T00:00:00Z',
      updatedAt: '2024-07-22T09:15:00Z',
    },
  ];

  const displayProjects = error ? mockProjects : (projects || []);

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

  const handleEditProject = (project: Project) => {
    // Edit dialog functionality would go here
    console.log('Edit project:', project);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Project
        </Button>
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Your First Project
              </Button>
            </>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} lg={4} key={project.id}>
              <ProjectCard
                project={project}
                onEdit={handleEditProject}
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

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateProject}
        loading={createMutation.isPending}
      />

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