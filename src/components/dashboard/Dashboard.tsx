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

  const displayStats = stats ?? {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    activeProjects: 0,
  };

  const displayActivities = activities ?? [];
  const displayUsageTrend = usageTrend ?? [];
  const displayProviderStats = providerStats ?? [];


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
          Failed to load dashboard data. Please try again.
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