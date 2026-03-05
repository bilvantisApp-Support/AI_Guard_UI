import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import {
    Box,
    Typography,
    Button,
    Paper,
    Stack,
    Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight="80vh"
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 5,
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: 3,
                    }}
                >
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mb={2}
                    >
                        <LockOutlinedIcon
                            sx={{
                                fontSize: 64,
                                color: 'error.main',
                                backgroundColor: 'error.light',
                                borderRadius: '50%',
                                padding: 2,
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        color="error.main"
                        gutterBottom
                    >
                        403
                    </Typography>

                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Access Denied
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        You don’t have permission to access this page.
                        Please contact your administrator if you believe this is a mistake.
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<LoginOutlinedIcon />}
                            onClick={() => navigate('/login')}
                        >
                            Login
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
};
