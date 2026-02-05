import { Paper, Typography, Box, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { UsageTrend } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';

interface UsageChartProps {
  data: UsageTrend[];
  loading?: boolean;
}

export const UsageChart = ({ data, loading = false }: UsageChartProps) => {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'cost') return [`$${value.toFixed(4)}`, 'Cost ($)'];
    if (name === 'tokens') return [value.toLocaleString(), 'Tokens'];
    if (name === 'requests') return [value.toLocaleString(), 'Requests'];
    return [value, name];
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Usage Trends
        </Typography>
        <Box
          height={300}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.50"
          borderRadius={1}
        >
          <Typography color="text.secondary">Loading chart...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Usage Trends
        </Typography>
        <Box
          height={300}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="text.secondary"
        >
          <Typography variant="body1">No usage data available</Typography>
          <Typography variant="body2">
            Data will appear here once you start making API calls
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Usage Trends (Last 7 Days)
      </Typography>
      <Box height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke={theme.palette.text.secondary}
            />
            <YAxis yAxisId="left" stroke={theme.palette.text.secondary} />
            <YAxis yAxisId="right" orientation="right" stroke={theme.palette.text.secondary} />
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
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2 }}
              name="Requests"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="tokens"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.secondary.main, strokeWidth: 2 }}
              name="Tokens"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.success.main, strokeWidth: 2 }}
              name="Cost ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};