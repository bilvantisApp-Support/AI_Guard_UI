import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Key as KeyIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TokenCard } from './TokenCard';
import { CreateTokenDialog } from './CreateTokenDialog';
import { userService } from '@/services/userService';
import { useNotification } from '@/hooks/useNotification';
import type { PersonalAccessToken, CreateTokenRequest } from '@/types/user';

export const Tokens = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTokenDialog, setNewTokenDialog] = useState<{
    open: boolean;
    token?: PersonalAccessToken;
  }>({ open: false });

  const { notify } = useNotification();
  const queryClient = useQueryClient();

  const {
    data: tokens = [],
    error,
  } = useQuery<PersonalAccessToken[]>({
    queryKey: ['user-tokens'],
    queryFn: userService.getTokens,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: userService.createToken,
    onSuccess: (newToken) => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      notify('Personal access token created successfully!', { type: 'success' });
      setNewTokenDialog({ open: true, token: newToken });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to create token', { type: 'error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      notify('Token deleted successfully!', { type: 'success' });
    },
    onError: (error: any) => {
      notify(error.message || 'Failed to delete token', { type: 'error' });
    },
  });

  // Mock data fallback when API is not available
  const mockTokens: PersonalAccessToken[] = [
    {
      id: '1',
      name: 'Production API Token',
      // token value hidden for security in list view
      scopes: ['api:read', 'api:write', 'projects:read'],
      projectId: undefined,
      lastUsedAt: '2024-07-22T08:30:00Z',
      expiresAt: '2024-08-01T00:00:00Z',
      isRevoked: false,
      createdAt: '2024-07-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      // token value hidden for security in list view
      scopes: ['api:read', 'projects:read'],
      projectId: 'project-123',
      lastUsedAt: null,
      expiresAt: '2024-10-15T00:00:00Z',
      isRevoked: false,
      createdAt: '2024-07-15T00:00:00Z',
    },
    {
      id: '3',
      name: 'Legacy Integration',
      // token value hidden for security in list view
      scopes: ['api:read', 'api:write', 'projects:read', 'projects:write'],
      projectId: undefined,
      lastUsedAt: '2024-06-15T12:00:00Z',
      expiresAt: '2024-07-25T00:00:00Z', // Expires soon
      isRevoked: false,
      createdAt: '2024-06-01T00:00:00Z',
    },
  ];

  const displayTokens = error ? mockTokens : (tokens || []);
  
  // Ensure displayTokens is always an array
  const safeDisplayTokens = Array.isArray(displayTokens) ? displayTokens : [];
  
  // Debug logging to help troubleshoot the issue
  if (!Array.isArray(displayTokens)) {
    console.error('displayTokens is not an array:', {
      displayTokens,
      tokens,
      error,
      type: typeof displayTokens
    });
  }

  const handleCreateToken = async (data: CreateTokenRequest) => {
    if (error) {
      // Simulate creation in demo mode
      const mockToken: PersonalAccessToken = {
        id: Date.now().toString(),
        name: data.name,
        token: `pat_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        scopes: data.scopes,
        projectId: data.projectId,
        lastUsedAt: null,
        expiresAt: data.expiresInDays ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString() : null,
        isRevoked: false,
        createdAt: new Date().toISOString(),
      };
      setCreateDialogOpen(false);
      setNewTokenDialog({ open: true, token: mockToken });
      notify('Demo mode: Token would be created in real implementation', { type: 'info' });
      return mockToken;
    }
    const Token1 =await createMutation.mutateAsync(data);

    return Token1;
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (error) {
      notify('Demo mode: Token would be deleted in real implementation', { type: 'info' });
      return;
    }
    await deleteMutation.mutateAsync(tokenId);
  };

  const handleCopyToken = (token: string) => {
    if (token) {
      navigator.clipboard.writeText(token);
      notify('Token copied to clipboard!', { type: 'success' });
    } else {
      notify('Token value not available for copying', { type: 'info' });
    }
  };

  const handleCopyNewToken = () => {
    if (newTokenDialog.token?.token) {
      handleCopyToken(newTokenDialog.token.token);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          Personal Access Tokens
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Token
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Using demo data - backend API not available. Connect your AI Guard server to manage real tokens.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Personal access tokens function like API keys and provide access to the AI Guard API. 
        Keep them secure and never share them in publicly accessible areas.
      </Alert>

      {safeDisplayTokens.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <KeyIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
          <Typography variant="h6" gutterBottom>
            No personal access tokens
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first personal access token to authenticate API requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Your First Token
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {safeDisplayTokens.map((token) => (
            <Grid item xs={12} md={6} lg={4} key={token.id}>
              <TokenCard
                token={token}
                onDelete={handleDeleteToken}
                onCopy={handleCopyToken}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateTokenDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateToken}
        loading={createMutation.isPending}
      />

      <Dialog
        open={newTokenDialog.open}
        onClose={() => setNewTokenDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Personal Access Token Created
          <IconButton onClick={() => setNewTokenDialog({ open: false })}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <strong>Important:</strong> Copy this token now. You won't be able to see it again!
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            {newTokenDialog.token?.name}
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
              {newTokenDialog.token?.token}
            </Typography>
            <IconButton onClick={handleCopyNewToken} color="primary">
              <CopyIcon />
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Use this token to authenticate your API requests by including it in the Authorization header:
          </Typography>
          
          <Box 
            component="pre"
            sx={{ 
              bgcolor: 'grey.900',
              color: 'white',
              p: 2,
              borderRadius: 1,
              mt: 2,
              fontSize: '0.8rem',
              overflow: 'auto',
            }}
          >
{`curl -H "Authorization: Bearer ${newTokenDialog.token?.token}" \\
     http://localhost:3000/_api/projects/${newTokenDialog.token?.projectId}/keys`}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCopyNewToken} startIcon={<CopyIcon />}>
            Copy Token
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setNewTokenDialog({ open: false })}
          >
            I've Saved This Token
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};