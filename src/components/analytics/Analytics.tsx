import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  Api as ApiIcon,
  Token as TokenIcon,
  AttachMoney as CostIcon,
  Speed as LatencyIcon,
} from '@mui/icons-material';
import { exportNodeToPDF } from '../../utils/exportNodeToPDF';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsDataResponse } from '@/types/analytics';
import { useParams } from 'react-router-dom';

export interface AnalyticsData {
  period: string;
  projectId?: string;
  requests: number;
  tokens: number;
  cost: number;
  latency: number;
  errors: number;
}

interface ProviderData {
  provider: string;
  requests: number;
  cost: number;
  color: string;
}

interface ModelData {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
}

export const Analytics = () => {
  const handleExportPDF = async () => {
    if (pdfRef.current) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      setTimeout(async () => {
        await exportNodeToPDF(pdfRef.current as HTMLElement, 'analytics.pdf');
      }, 300);
    }
  };
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const pdfRef = useRef<HTMLDivElement>(null);
  const { id: projectIdFromRoute } = useParams<{ id: string }>();

  const [selectedProject, setSelectedProject] = useState(
    projectIdFromRoute ?? 'all'
  );
  

  const {
    data: analyticsData,
    error: analyticsError,
  } = useQuery<AnalyticsDataResponse>({
    queryKey: ['analytics-data', timeRange, selectedProject],
    queryFn: () => analyticsService.getAnalyticsData({ timeRange, project: selectedProject }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  useEffect(() => {
    if (projectIdFromRoute) {
      setSelectedProject(projectIdFromRoute);
    }
  }, [projectIdFromRoute]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'cost') {
      return [`$${value.toFixed(2)}`, 'Cost'];
    }
    if (name === 'latency') {
      return [`${value.toFixed(2)}s`, 'Avg Latency'];
    }
    if (name === 'tokens') {
      return [value.toLocaleString(), 'Tokens'];
    }
    return [value.toLocaleString(), name];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const allAnalyticsData: AnalyticsData[] =
    analyticsData?.analytics?.map((item: any) => ({
      ...item,
      projectId: item.projectId ? String(item.projectId) : undefined,
      latency:
        typeof item.latency === 'number'
          ? +(item.latency / 1000).toFixed(2)
          : 0,
    })) ?? [];


  const displayAnalyticsData: AnalyticsData[] = selectedProject === 'all'
    ? allAnalyticsData
    : allAnalyticsData.filter((item: any) => String(item.projectId) === String(selectedProject));

  const displayProviderData: ProviderData[] = analyticsData?.providers ?? [];
      
  const displayModelData: ModelData[] =  analyticsData?.models ?? [];

  const totalRequests = displayAnalyticsData.reduce((sum, item) => sum + item.requests, 0);
  const totalTokens = displayAnalyticsData.reduce((sum, item) => sum + item.tokens, 0);
  const totalCost = displayAnalyticsData.reduce((sum, item) => sum + item.cost, 0);
  const avgLatency = displayAnalyticsData.length > 0 ? displayAnalyticsData.reduce((sum, item) => sum + item.latency, 0) / displayAnalyticsData.length : 0;

  return (
    <Box>
      <div ref={pdfRef}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1d">Last 24h</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedProject}
              label="Project"
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <MenuItem value="all">All Projects</MenuItem>
              {analyticsData?.projects?.map((proj: any) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.name || proj.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportPDF}
          >
            Export
          </Button>
        </Box>
      </Box>


        {analyticsError && (<Alert severity="info" sx={{ mb: 3 }}>
          Failed to load analytics data. Please try again.
        </Alert>)}

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StatCard
            title="Total Requests"
            value={totalRequests}
            subtitle="API calls made"
            icon={ApiIcon}
            color="primary"
            trend={{ value: 15.2, isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StatCard
            title="Tokens Processed"
            value={totalTokens.toLocaleString()}
            subtitle="Input + output tokens"
            icon={TokenIcon}
            color="secondary"
            trend={{ value: 8.7, isPositive: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StatCard
            title="Total Cost"
            value={`$${totalCost.toFixed(4)}`}
            subtitle={`~$${(totalCost / 7).toFixed(4)}/day avg`}
            icon={CostIcon}
            color="success"
            trend={{ value: -3.1, isPositive: false }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <StatCard
            title="Avg Latency"
            value={`${avgLatency.toFixed(2)}s`}
            subtitle="Response time"
            icon={LatencyIcon}
            color="warning"
            trend={{ value: 12.5, isPositive: false }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Usage Over Time */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Usage Over Time
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stackId="1"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                    fillOpacity={0.6}
                    name="Requests"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Provider Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Provider Distribution
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayProviderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="requests"
                    label={({ provider, percent }) => `${provider} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {displayProviderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Requests']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Cost Breakdown */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cost Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.success.main, strokeWidth: 2 }}
                    name="Daily Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Latency Trends */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Latency Trends
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <Tooltip
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke={theme.palette.warning.main}
                    strokeWidth={2}
                    dot={{ fill: theme.palette.warning.main, strokeWidth: 2 }}
                    name="Avg Latency (s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Model Performance */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Model Performance Comparison
        </Typography>
        <Box height={350}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayModelData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="model" stroke={theme.palette.text.secondary} />
              <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
              <Tooltip
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="requests"
                fill={theme.palette.primary.main}
                name="Requests"
              />
              <Bar
                yAxisId="right"
                dataKey="cost"
                fill={theme.palette.success.main}
                name="Cost ($)"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
      </div>
    </Box>
  );
};
