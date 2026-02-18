import { useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Tooltip,
    IconButton,
    Avatar,
    Chip,
    Switch,
    Select,
    MenuItem,
    FormControl,
    alpha,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, GridColDef, GridRenderCellParams, } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient, } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { APIUser, UpdateUserRequest, UsersResponse } from '@/types/user';
import { useNotification } from '@/hooks/useNotification';


type UserRole = 'owner' | 'admin' | 'member';
interface Row {
    id: string;
    user: APIUser;
}

export const Users = () => {
    const queryClient = useQueryClient();
    const { notify } = useNotification();

    const { data, isLoading, isError } =
        useQuery<UsersResponse>({
            queryKey: ['users'],
            queryFn: () => adminService.listUsers(1, 1000),
        });

    const mutation = useMutation({
        mutationFn: ({ userId, payload }:
            { userId: string; payload: UpdateUserRequest; }) => adminService.updateUser(userId, payload),
        onSuccess: updated => {
            queryClient.setQueryData(['users'], (old?: UsersResponse) => old && {
                ...old,
                users: old.users.map(u =>
                    u.id === updated.id ? { ...u, role: updated.role as APIUser['role'], status: updated.status as APIUser['status'] }:u
                )
            });
        },
        onError: (error: any) => {
            notify(
                error?.response?.data?.error?.message || 'Failed to update user',
                { type: 'error' }
            );
        }
    });

    const handleRole = (user: APIUser, role: UserRole) => {
        mutation.mutate({
            userId: user.id,
            payload: { role, status: user.status },
        });
        notify('User role updated successfully', { type: "success" })
    };

    const handleStatus = (user: APIUser, active: boolean) => {
        mutation.mutate({
            userId: user.id,
            payload: {
                role: user.role,
                status: active ? 'active' : 'suspended',
            },
        });
        notify('User status updated successfully', { type: "success" })
    };

    const rows: Row[] = useMemo(() => data?.users.map(u => ({
        id: u.id,
        user: u,
    })) || [],
        [data]
    );

    const avatarColor = (name: string) => {
        const colors = [
            '#1976d2',
            '#1e88e5',
            '#1565c0',
            '#42a5f5',
        ];
        return colors[
            (name.charCodeAt(0) +
                name.charCodeAt(name.length - 1)) %
            colors.length
        ];
    };

    const initials = (name: string) =>
        name
            .split(' ')
            .map(x => x[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

    const columns: GridColDef<Row>[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1.4,
            valueGetter: (_, row) => row.user.name,
            renderCell: (params: GridRenderCellParams<Row>) => {
                const u = params.row.user;
                return (
                    <Box display="flex" alignItems="center" gap={1.5} width="100%">
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                fontSize: 14,
                                bgcolor: avatarColor(u.name),
                            }}
                        >
                            {initials(u.name)}
                        </Avatar>
                        <Typography fontSize={14} fontWeight={600}>
                            {u.name}
                        </Typography>
                    </Box>
                );
            },
        },

        {
            field: 'email',
            headerName: 'Email',
            flex: 1.8,
            valueGetter: (_, row) => row.user.email,
            renderCell: (params) => (
                <Typography
                    fontSize={14}
                    sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: 1.4,
                    }}
                >
                    {params.row.user.email}
                </Typography>
            ),
        },

        {
            field: 'role',
            headerName: 'Role',
            flex: 1,
            valueGetter: (_, row) => row.user.role,
            renderCell: (params) => {
                const u = params.row.user;
                return (
                    <FormControl size="small" fullWidth>
                        <Select
                            value={u.role}
                            onChange={e =>
                                handleRole(
                                    u,
                                    e.target.value as UserRole
                                )
                            }
                        >
                            <MenuItem value="owner">Owner</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="member">Member</MenuItem>
                        </Select>
                    </FormControl>
                );
            },
        },

        {
            field: 'status',
            headerName: 'Status',
            flex: 0.8,
            valueGetter: (_, row) => row.user.status,
            renderCell: (params) => (
                <Chip
                    label={params.row.user.status}
                    color={
                        params.row.user.status === 'active'
                            ? 'success'
                            : 'warning'
                    }
                    size="small"
                />
            ),
        },

        {
            field: 'active',
            headerName: 'Active',
            flex: 0.8,
            sortable: false,

            renderCell: (params) => {

                const u = params.row.user;
                return (
                    <Switch
                        checked={u.status === 'active'}
                        onChange={e =>
                            handleStatus(
                                u,
                                e.target.checked
                            )
                        }
                    />
                );
            },
        },
    ];

    if (isLoading)
        return (
            <Box height="60vh" display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
            </Box>
        );

    if (isError || rows.length === 0)
        return (
            <Box height="60vh" display="flex" justifyContent="center" alignItems="center">
                <PeopleOutlineIcon sx={{ fontSize: 80, opacity: 0.3 }} />
            </Box>
        );

    return (

        <Box p={3}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        User Management
                    </Typography>
                    <Typography color="text.secondary">
                        Manage users
                    </Typography>
                </Box>

                <Tooltip title="Refresh">
                    <IconButton onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    height: 560,
                    borderRadius: 2,
                    border: theme =>
                        `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10, 20]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    disableRowSelectionOnClick
                    rowHeight={70}
                    columnHeaderHeight={56}
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme =>
                                alpha(theme.palette.primary.main, 0.04),
                            fontSize: 14,
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};
