import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
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

export const NotFound = () => {
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
                        <ErrorOutlineIcon
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
                        404
                    </Typography>

                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        The page you are looking for doesn’t exist or has been moved.
                        Please check the URL or navigate back to safety.
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
