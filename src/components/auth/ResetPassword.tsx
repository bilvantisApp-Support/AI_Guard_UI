import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset
} from "firebase/auth";
import { auth } from "@/config/firebase";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or expired link");
    }
  }, [oobCode]);

  const handleSubmit = async () => {
    try {
      setError("");
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      await verifyPasswordResetCode(auth, oobCode!);
      await confirmPasswordReset(auth, oobCode!, password);

      setSuccess("Password reset successful");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError("Invalid or expired reset link");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" align="center">
            Reset Password
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            fullWidth
            label="New Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSubmit}
          >
            Reset Password
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};
