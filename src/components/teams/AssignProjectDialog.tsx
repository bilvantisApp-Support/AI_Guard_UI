import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { Project, TeamProject } from '@/types/api';

interface AssignProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { projectId: string }) => void;
  loading?: boolean;
  projects: Project[];
  assignedProjects: TeamProject[];
}

export const AssignProjectDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
  projects,
  assignedProjects,
}: AssignProjectDialogProps) => {
  const assignedIds = useMemo(() => new Set(assignedProjects.map((p) => p.id)), [assignedProjects]);
  const availableProjects = projects.filter((p) => !assignedIds.has(p.id));

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const handleSubmit = () => {
    if (!selectedProjectId) return;
    onSubmit({ projectId: selectedProjectId });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Project</DialogTitle>
      <DialogContent>
        {availableProjects.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            All your projects are already assigned to this team.
          </Typography>
        ) : (
          <FormControl fullWidth margin="normal">
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProjectId}
              label="Project"
              onChange={(e) => setSelectedProjectId(e.target.value as string)}
            >
              {availableProjects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedProjectId || availableProjects.length === 0}
        >
          {loading ? 'Assigning...' : 'Assign Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
