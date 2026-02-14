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
  Tabs,
  Tab,
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
import type { PersonalAccessToken, CreateTokenRequest, APIUser } from '@/types/user';
import { PROVIDER_CONFIG } from '@/config/providerConfig';


export const Tokens = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTokenDialog, setNewTokenDialog] = useState<{
    open: boolean;
    token?: PersonalAccessToken;
  }>({ open: false });
  const [codeTab, setCodeTab] = useState<'curl' | 'node' | 'python' | 'Java'>('curl');

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

   const { data: User } = useQuery<APIUser>({
     queryKey: ['profile'],
     queryFn: userService.getProfile,
     staleTime: 5 * 60 * 1000
   });
 
   const userRole = User?.role;
   const canCreateToken = userRole === 'owner' || userRole === 'admin';

  const displayTokens = tokens || [];

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
    const Token1 = await createMutation.mutateAsync(data);
    return Token1;
  };

  const handleDeleteToken = async (tokenId: string) => {
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

  const getProvider = (): 'openai' | 'anthropic' | 'gemini' =>
    (newTokenDialog.token?.llmProvider as any) || 'openai';

  const generateCurlURL = (token: string) => {
    const provider = getProvider();
    const config = PROVIDER_CONFIG[provider];

    return `curl -X POST ${config.endpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -H "x-ai-guard-provider: ${provider}" \\
  -d '${config.curlBody}'`;
  };

  const generateNodeCode = (token: string) => {
    const provider = getProvider();
    const config = PROVIDER_CONFIG[provider];

    return `
      // Install required SDK
      //${config.nodeInstall}
      ${config.nodeImport}

      const client = ${config.nodeClient}({
        apiKey: "${token}",
        baseURL: "${config.basePoint}",
        defaultHeaders: {
          "x-ai-guard-provider": "${provider}"
        }
      });

      async function main() {
        const response = await ${config.nodeCall};

        console.log(response);
      }

      main().catch(console.error);`;
  };


  const generatePythonCode = (token: string) => {
    const provider = getProvider();
    const config = PROVIDER_CONFIG[provider];

    return `# Install required SDK
# ${config.pythonInstall}
${config.pythonImport}

client = ${config.pythonClient}(
    api_key="${token}",
    base_url="${config.basePoint}",
    default_headers={
        "x-ai-guard-provider": "${provider}"
    }
)

response = ${config.pythonCall}

print(response.output_text)`;
  };

  const generateJavaCode = (token: string) => {
    const provider = getProvider();
    const config = PROVIDER_CONFIG[provider];

    return `
    // Install dependency:
    // ${config.javaInstall}
      ${config.javaImport}

    public class Main {

        public static void main(String[] args) {

            String token = "${token}";
            String BASE_URL = "${config.basePoint}";

            ${config.javaClient}

            ${config.javaCall}
        }
    }`;
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          Personal Access Tokens
        </Typography>
        {canCreateToken && <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Token
        </Button>}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Failed to load tokens. Please try again.
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
          {canCreateToken && <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>setCreateDialogOpen(true)}
          >
            Create Your First Token
          </Button>}
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

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use this token to authenticate your API requests:
          </Typography>

          <Tabs
            value={codeTab}
            onChange={(_, v) => setCodeTab(v)}
            sx={{ mb: 2 }}
          >
            <Tab label="cURL" value="curl" />
            <Tab label="Node.js" value="node" />
            <Tab label="Python" value="python" />
            <Tab label="Java" value="Java" />
          </Tabs>

          <Box sx={{ position: 'relative' }}>
            {/* Copy Button */}
            <IconButton
              size="small"
              onClick={() => {
                const token = newTokenDialog.token?.token || '';
                let code = '';

                if (codeTab === 'curl') code = generateCurlURL(token);
                if (codeTab === 'node') code = generateNodeCode(token);
                if (codeTab === 'python') code = generatePythonCode(token);
                if (codeTab === 'Java') code = generateJavaCode(token);

                navigator.clipboard.writeText(code);
                notify('Copied to clipboard!', { type: 'success' });
              }}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.16)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                zIndex: 1,
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>

            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.900',
                color: 'white',
                p: 2,
                pt: 5,
                borderRadius: 1,
                fontSize: '0.8rem',
                overflow: 'auto',
              }}
            >
              {codeTab === 'curl' &&
                generateCurlURL(newTokenDialog.token?.token || '')}

              {codeTab === 'node' &&
                generateNodeCode(newTokenDialog.token?.token || '')}

              {codeTab === 'python' &&
                generatePythonCode(newTokenDialog.token?.token || '')}

              {codeTab === 'Java' &&
                generateJavaCode(newTokenDialog.token?.token || '')}
            </Box>
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
