import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Timeline as ActivityIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Project } from '@/types/api';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectCard = ({ project, onEdit, onDelete }: ProjectCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCardClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit(project);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete(project.id);
  };

  const getMemberRole = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const userRole = project.role || 'member';
  const canEdit = userRole === 'owner' || userRole === 'admin';
  const canDelete = userRole === 'owner';

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" noWrap sx={{ flex: 1, mr: 1 }}>
            {project.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ ml: 1 }}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        {project.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <KeyIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.apiKeyCount} keys
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {project.memberCount} members
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <ActivityIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
            {project.members ? project.members.slice(0, 4).map((member, index) => (
              <Avatar key={member.userId} sx={{ bgcolor: 'primary.main' }}>
                {String.fromCharCode(65 + index)}
              </Avatar>
            )) : (
              // Show placeholder avatars based on memberCount when members array is not available
              Array.from({ length: Math.min(4, project.memberCount) }).map((_, index) => (
                <Avatar key={index} sx={{ bgcolor: 'primary.main' }}>
                  {String.fromCharCode(65 + index)}
                </Avatar>
              ))
            )}
          </AvatarGroup>
          <Chip
            label={getMemberRole(userRole)}
            size="small"
            color={userRole === 'owner' ? 'primary' : 'default'}
            variant="outlined"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </Typography>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}>
          View Details
        </Button>
        <Button 
          size="small" 
          onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}/analytics`); }}
        >
          Analytics
        </Button>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {canEdit && (
          <MenuItem onClick={handleEdit}>
            Edit Project
          </MenuItem>
        )}
        <MenuItem onClick={() => navigate(`/projects/${project.id}/settings`)}>
          Settings
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Delete Project
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};