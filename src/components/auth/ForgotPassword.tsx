import { useForm } from "react-hook-form";
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import { Link } from "react-router-dom";
import { useState } from "react";

interface FormData {
    email: string;
}

export const ForgotPassword = () => {
    const { brevotresetPassword } = useAuth();
    const { notify } = useNotification();
    const [success, setSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            await brevotresetPassword(data.email);
            setSuccess(true);
            notify("Password reset email sent", { type: "success" });
        } catch (error: any) {
            notify(error.message, { type: "error" });
        }
    };

    return (
        <Container maxWidth="xs">
            <Box mt={8}>
                <Paper sx={{ p: 4 }}>
                    <Typography variant="h5" align="center">
                        Forgot Password
                    </Typography>

                    <Typography variant="body2" align="center" mb={2}>
                        Enter your email to receive reset link
                    </Typography>

                    {success && (
                        <Alert severity="success">
                            Reset email sent. Check your inbox.
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            {...register("email", {
                                required: "Email is required"
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{ mt: 2 }}
                        >
                            {isSubmitting ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <Box mt={2} textAlign="center">
                            <Link to="/login">
                                Back to Login
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
