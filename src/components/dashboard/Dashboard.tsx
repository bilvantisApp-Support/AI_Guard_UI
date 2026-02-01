import { useState, useEffect } from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useQuery } from '@tanstack/react-query';
import {
  Api as ApiIcon,
  Token as TokenIcon,
  AttachMoney as CostIcon,
  Folder as ProjectIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { StatCard } from './StatCard';
import { ActivityFeed } from './ActivityFeed';
import { UsageChart } from './UsageChart';
import { ProviderBreakdown } from './ProviderBreakdown';
import { dashboardService } from '@/services/dashboardService';
import { useNotification } from '@/hooks/useNotification';
import { DashboardStats, ActivityItem, UsageTrend, ProviderStats } from '@/types/dashboard';

export const Dashboard = () => {
  const { notify } = useNotification();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', refreshKey],
    queryFn: dashboardService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const {
    data: activities = [],
    isLoading: activitiesLoading,
  } = useQuery<ActivityItem[]>({
    queryKey: ['dashboard-activity', refreshKey],
    queryFn: () => dashboardService.getRecentActivity(10),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: usageTrend = [],
    isLoading: trendLoading,
  } = useQuery<UsageTrend[]>({
    queryKey: ['dashboard-usage-trend', refreshKey],
    queryFn: () => dashboardService.getUsageTrend(7),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const {
    data: providerStats = [],
    isLoading: providerLoading,
  } = useQuery<ProviderStats[]>({
    queryKey: ['dashboard-provider-stats', refreshKey],
    queryFn: dashboardService.getProviderStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Simulate data if API is not available
  useEffect(() => {
    if (statsError) {
      console.warn('Dashboard API not available, using mock data');
    }
  }, [statsError]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    notify('Dashboard refreshed', { type: 'success' });
  };

  // Mock data fallback when API is not available
  const mockStats: DashboardStats = {
    totalRequests: 1250,
    totalTokens: 125000,
    totalCost: 23.45,
    activeProjects: 3,
  };

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'api_call',
      title: 'OpenAI API Call',
      description: 'GPT-4 completion request processed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      projectName: 'ChatBot Project',
      severity: 'success',
    },
    {
      id: '2',
      type: 'project_created',
      title: 'New Project Created',
      description: 'Content Generation project has been created',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      severity: 'info',
    },
    {
      id: '3',
      type: 'key_added',
      title: 'API Key Added',
      description: 'Anthropic API key added to Marketing project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      projectName: 'Marketing',
      severity: 'success',
    },
    {
      id: '4',
      type: 'error',
      title: 'Rate Limit Exceeded',
      description: 'OpenAI rate limit reached for ChatBot Project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      projectName: 'ChatBot Project',
      severity: 'warning',
    },
    {
      id: '5',
      type: 'member_invited',
      title: 'Team Member Invited',
      description: 'john@example.com invited to Marketing project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      projectName: 'Marketing',
      severity: 'info',
    },
  ];

  const mockUsageTrend: UsageTrend[] = [
    { date: '2024-07-16', requests: 120, cost: 2.34, tokens: 12000 },
    { date: '2024-07-17', requests: 145, cost: 2.89, tokens: 14500 },
    { date: '2024-07-18', requests: 98, cost: 1.95, tokens: 9800 },
    { date: '2024-07-19', requests: 167, cost: 3.21, tokens: 16700 },
    { date: '2024-07-20', requests: 203, cost: 4.12, tokens: 20300 },
    { date: '2024-07-21', requests: 189, cost: 3.67, tokens: 18900 },
    { date: '2024-07-22', requests: 234, cost: 4.78, tokens: 23400 },
  ];

  const mockProviderStats: ProviderStats[] = [
    { provider: 'openai', requests: 820, cost: 15.67, percentage: 65.6 },
    { provider: 'anthropic', requests: 320, cost: 6.45, percentage: 25.6 },
    { provider: 'google', requests: 110, cost: 1.33, percentage: 8.8 },
  ];

  const displayStats = statsError ? mockStats : stats;
  const displayActivities = statsError ? mockActivities : activities;
  const displayUsageTrend = statsError ? mockUsageTrend : usageTrend;
  const displayProviderStats = statsError ? mockProviderStats : providerStats;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={statsLoading}
        >
          Refresh
        </Button>
      </Box>

      {statsError && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          Using demo data - backend API not available. Connect your AI Guard server to see live data.
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Requests"
            value={displayStats?.totalRequests || 0}
            subtitle="API calls made"
            icon={ApiIcon}
            color="primary"
            loading={statsLoading && !statsError}
            trend={{ value: 12.5, isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Tokens Used"
            value={displayStats?.totalTokens || 0}
            subtitle="Across all providers"
            icon={TokenIcon}
            color="secondary"
            loading={statsLoading && !statsError}
            trend={{ value: 8.3, isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Cost"
            value={`$${(displayStats?.totalCost || 0).toFixed(4)}`}
            subtitle="This month"
            icon={CostIcon}
            color="success"
            loading={statsLoading && !statsError}
            trend={{ value: -5.2, isPositive: false }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Projects"
            value={displayStats?.activeProjects || 0}
            subtitle="With API keys"
            icon={ProjectIcon}
            color="info"
            loading={statsLoading && !statsError}
          />
        </Grid>
      </Grid>

      {/* Charts and Activity */}
      <Grid container spacing={3}>
        {/* Usage Chart */}
        <Grid item xs={12} lg={8}>
          <UsageChart
            data={displayUsageTrend}
            loading={trendLoading && !statsError}
          />
        </Grid>

        {/* Provider Breakdown */}
        <Grid item xs={12} lg={4}>
          <ProviderBreakdown
            providers={displayProviderStats}
            loading={providerLoading && !statsError}
          />
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12}>
          <ActivityFeed
            activities={displayActivities}
            loading={activitiesLoading && !statsError}
          />
        </Grid>
      </Grid>
    </Box>
  );
};