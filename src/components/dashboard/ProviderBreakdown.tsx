import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Avatar,
  Chip,
} from '@mui/material';
import { ProviderStats } from '@/types/dashboard';

interface ProviderBreakdownProps {
  providers: ProviderStats[];
  loading?: boolean;
}

const getProviderInfo = (provider: ProviderStats['provider']) => {
  switch (provider) {
    case 'openai':
      return {
        name: 'OpenAI',
        color: '#00A67E',
        avatar: 'O',
      };
    case 'anthropic':
      return {
        name: 'Anthropic',
        color: '#D97757',
        avatar: 'A',
      };
    case 'google':
      return {
        name: 'Google',
        color: '#4285F4',
        avatar: 'G',
      };
    default:
      return {
        name: String(provider),
        color: '#9E9E9E',
        avatar: String(provider).charAt(0).toUpperCase(),
      };
  }
};

export const ProviderBreakdown = ({ providers, loading = false }: ProviderBreakdownProps) => {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Provider Breakdown
        </Typography>
        <List>
          {Array.from({ length: 3 }).map((_, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'grey.300' }} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2">Loading...</Typography>
                      <Chip label="0%" size="small" />
                    </Box>
                    <LinearProgress variant="indeterminate" />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }

  const totalRequests = providers.reduce((sum, provider) => sum + provider.requests, 0);

  if (totalRequests === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Provider Breakdown
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={4}
          color="text.secondary"
        >
          <Typography variant="body1">No provider usage yet</Typography>
          <Typography variant="body2">
            Add API keys to start using different providers
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Provider Breakdown</Typography>
        <Chip
          label={`${totalRequests.toLocaleString()} total requests`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <List sx={{ py: 0 }}>
        {providers
          .sort((a, b) => b.requests - a.requests)
          .map((provider) => {
            const info = getProviderInfo(provider.provider);
            const percentage = totalRequests > 0 ? (provider.requests / totalRequests) * 100 : 0;

            return (
              <ListItem key={provider.provider} sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: info.color,
                      width: 40,
                      height: 40,
                      fontWeight: 'bold',
                    }}
                  >
                    {info.avatar}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {info.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            {provider.requests.toLocaleString()} requests
                          </Typography>
                          <Chip
                            label={`${percentage.toFixed(1)}%`}
                            size="small"
                            sx={{
                              bgcolor: info.color,
                              color: 'white',
                              minWidth: 45,
                            }}
                          />
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: info.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Typography variant="caption" color="text.secondary">
                          Cost: ${provider.cost.toFixed(4)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
      </List>
    </Paper>
  );
};