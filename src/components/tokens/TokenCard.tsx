import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Folder as ProjectIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { userService } from '@/services/userService';
import { useNotification } from '@/hooks/useNotification';
import type { APIUser, PersonalAccessToken } from '@/types/user';
import type { Project } from '@/types/api';

interface TokenCardProps {
  token: PersonalAccessToken;
  onDelete: (tokenId: string) => void;
  onCopy: (token: string) => void;
}

export const TokenCard = ({ token, onDelete, onCopy }: TokenCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showToken, setShowToken] = useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false);
  const [rotatedToken, setRotatedToken] = useState<PersonalAccessToken | null>(null);

  const { notify } = useNotification();
  const queryClient = useQueryClient();

  // Fetch project details if token is scoped to a project
  const { data: projects = [] } = useQuery<Project[]>({
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
  const canManageToken = userRole === 'owner' || userRole === 'admin';

  const projectName = token.projectId 
    ? projects.find(p => p.id === token.projectId)?.name || `Project ${token.projectId}`
    : null;

  const rotateMutation = useMutation({
    mutationFn: userService.rotateToken,
    onSuccess: (newToken) => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      setRotatedToken(newToken);
      notify('Token rotated successfully! New token value is shown below.', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to rotate token', { type: 'error' });
    },
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(token.id);
  };

  const handleCopy = () => {
    if (token.token) {
      onCopy(token.token);
    }
  };

  const handleRotateToken = async () => {
    try {
      await rotateMutation.mutateAsync(token.id);
      setRotateDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleCopyRotatedToken = () => {
    if (rotatedToken?.token) {
      onCopy(rotatedToken.token);
      notify('New token copied to clipboard!', { type: 'success' });
    }
  };

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  const isExpired = token.expiresAt ? isAfter(new Date(), new Date(token.expiresAt)) : false;
  const isExpiringSoon = token.expiresAt 
    ? isAfter(new Date(token.expiresAt), new Date()) && 
      isAfter(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), new Date(token.expiresAt))
    : false;
  
  const isRevoked = token.isRevoked;

  const getStatusColor = () => {
    if (isRevoked) return 'error';
    if (isExpired) return 'error';
    if (isExpiringSoon) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (isRevoked) return 'Revoked';
    if (isExpired) return 'Expired';
    if (isExpiringSoon) return 'Expires Soon';
    return 'Active';
  };

  const formatToken = (token?: string) => {
    if (!token) return 'Token hidden for security';
    if (showToken) return token;
    return token.substring(0, 8) + '...' + token.substring(token.length - 4);
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: isExpired ? '1px solid' : 'none',
        borderColor: isExpired ? 'error.light' : 'divider',
        opacity: isExpired ? 0.7 : 1,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" noWrap sx={{ flex: 1, mr: 1 }}>
            {token.name}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={getStatusText()}
              size="small"
              color={getStatusColor()}
              variant="outlined"
            />
            {canManageToken && <IconButton size="small" onClick={handleMenuClick}>
              <MoreIcon />
            </IconButton>}
          </Box>
        </Box>

        {token.token && (
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1} 
            p={1} 
            bgcolor="grey.50" 
            borderRadius={1}
            mb={2}
          >
            <Typography 
              variant="body2" 
              fontFamily="monospace" 
              sx={{ 
                flex: 1, 
                wordBreak: 'break-all',
                fontSize: '0.8rem',
              }}
            >
              {formatToken(token.token)}
            </Typography>
            <Tooltip title={showToken ? "Hide token" : "Show full token"}>
              <IconButton size="small" onClick={toggleShowToken}>
                {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy to clipboard">
              <IconButton size="small" onClick={handleCopy}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {!token.token && (
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1} 
            p={1} 
            bgcolor="grey.100" 
            borderRadius={1}
            mb={2}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                flex: 1,
                fontStyle: 'italic',
              }}
            >
              Token value hidden for security
            </Typography>
            <Tooltip title="Rotate token to get new value">
              <IconButton
                size="small"
                onClick={() => {
                  if (canManageToken) setRotateDialogOpen(true)
                }}
                disabled={isRevoked}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Created {formatDistanceToNow(new Date(token.createdAt), { addSuffix: true })}
          </Typography>
          
          {token.expiresAt && (
            <Typography 
              variant="body2" 
              color={isExpired ? 'error.main' : isExpiringSoon ? 'warning.main' : 'text.secondary'}
            >
              {isExpired 
                ? `Expired ${formatDistanceToNow(new Date(token.expiresAt), { addSuffix: true })}`
                : `Expires ${formatDistanceToNow(new Date(token.expiresAt), { addSuffix: true })}`
              }
            </Typography>
          )}
          
          {!token.expiresAt && (
            <Typography variant="body2" color="text.secondary">
              Never expires
            </Typography>
          )}
          
          {token.lastUsedAt ? (
            <Typography variant="body2" color="text.secondary">
              Last used {formatDistanceToNow(new Date(token.lastUsedAt), { addSuffix: true })}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Never used
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Scopes */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LockIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Permissions
              </Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {token.scopes.map((scope) => (
                <Chip
                  key={scope}
                  label={scope}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>

          {/* Project Scope */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ProjectIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Project Scope
              </Typography>
            </Box>
            {projectName ? (
              <Chip 
                label={projectName} 
                size="small" 
                variant="outlined" 
                color="primary"
                sx={{ fontSize: '0.7rem' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                All projects
              </Typography>
            )}
          </Box>
        </Box>

        {isExpiringSoon && !isRevoked && canManageToken && (
          <Box mt={2}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              fullWidth
              onClick={() => {/* TODO: Implement token renewal */}}
            >
              Renew Token
            </Button>
          </Box>
        )}
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {token.token && (
          <MenuItem onClick={() => { handleMenuClose(); onCopy(token.token!); }}>
            <CopyIcon sx={{ mr: 1 }} fontSize="small" />
            Copy Token
          </MenuItem>
        )}
        {!token.token && !isRevoked && (
          <MenuItem onClick={() => { handleMenuClose(); setRotateDialogOpen(true); }}>
            <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
            Rotate Token
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete Token
        </MenuItem>
      </Menu>

      {/* Token Rotation Dialog */}
      <Dialog
        open={rotateDialogOpen}
        onClose={() => setRotateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rotate Token</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Important:</strong> Rotating this token will generate a new token value and invalidate the current one. 
            Any applications using the current token will need to be updated with the new value.
          </Alert>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to rotate the token "{token.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The old token will be immediately revoked and a new token will be generated with the same permissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRotateDialogOpen(false)} disabled={rotateMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleRotateToken}
            variant="contained"
            color="warning"
            disabled={rotateMutation.isPending}
          >
            {rotateMutation.isPending ? 'Rotating...' : 'Rotate Token'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Token Display Dialog */}
      <Dialog
        open={!!rotatedToken}
        onClose={() => setRotatedToken(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Token Rotated Successfully</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 3 }}>
            <strong>Token rotated!</strong> Copy the new token value below. You won't be able to see it again!
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {rotatedToken?.name}
          </Typography>
          
          <Box 
            display="flex" 
            alignItems="center" 
            gap={1} 
            p={2} 
            bgcolor="grey.100" 
            borderRadius={1}
            mb={2}
          >
            <Typography 
              variant="body1" 
              fontFamily="monospace" 
              sx={{ 
                flex: 1, 
                wordBreak: 'break-all',
                fontSize: '0.9rem',
              }}
            >
              {rotatedToken?.token}
            </Typography>
            <IconButton onClick={handleCopyRotatedToken} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Use this token to authenticate your API requests. The old token has been revoked and is no longer valid.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyRotatedToken} startIcon={<CopyIcon />}>
            Copy New Token
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setRotatedToken(null)}
          >
            I've Saved This Token
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};