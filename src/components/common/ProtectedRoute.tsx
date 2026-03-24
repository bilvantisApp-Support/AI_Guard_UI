import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ('owner' | 'admin' | 'member')[];
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: userService.getProfile,
    enabled: !!user
  });

  const userRole = profile?.role;

  if (loading || profileLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && userRole && !roles.includes(userRole!)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};