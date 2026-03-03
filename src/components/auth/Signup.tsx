import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/useNotification';
import { Turnstile } from "@marsidev/react-turnstile";
import { otpService } from '@/services/otpService';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup
    .boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState<number>(0);
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();
  // Enable sending OTP once the email service is ready
  const SENT_OTP = true;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      if (!captchaToken) {
        notify('Captcha validation failed', { type: 'error' });
        return;
      }
      await signup(data.email, data.password, data.name, captchaToken);
      notify('Account created successfully!', { type: 'success' });
      navigate('/login');
    } catch (err: any) {
      notify(err.message || 'Signup failed', { type: 'error' });
    }
  };

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpAndSignup = async () => {
    try {
      const name = watch('name');
      const email = watch('email');

      if (!SENT_OTP) {
        await handleSubmit(onSubmit)();
        return;
      }

      if (!otpSent) {
        await otpService.sendOTP({ email, name });
        setOtpSent(true);
        setTimer(180);
        notify(otpSent ? 'OTP resent successfully' : 'OTP sent successfully', { type: 'success' });
        return;
      }

      if (!otpVerified) {
        const valid = await otpService.verifyOTP({ email, otp: otp });

        if (!valid) {
          notify('Invalid OTP', { type: 'error' });
          return;
        }

        setOtpVerified(true);
        notify('OTP verified successfully', { type: 'success' });
        return;
      }

      // Only signup after OTP verified
      await handleSubmit(onSubmit)();

    } catch (err: any) {
      notify(err.message || 'Operation failed', { type: 'error' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? 0 : ''}${secs}`;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <PersonAddIcon sx={{ color: 'white' }} />
          </Box>
          <Typography component="h1" variant="h5">
            Create your AI Guard account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Start managing your AI APIs securely
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              autoComplete="name"
              autoFocus
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            </Box>
            {otpSent && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}
            {otpSent && !otpVerified && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Didn't receive the code?
                </Typography>

                {timer > 0 ? (
                  <Typography sx={{flex:"column"}} variant="body2" color="text.secondary">
                    Resend OTP in {formatTime(timer)}
                  </Typography>
                ) : (
                  <Button
                    size="small"
                    sx={{flex:"column"}}
                    onClick={async () => {
                      const name = watch('name');
                      const email = watch('email');

                      await otpService.sendOTP({ email, name });
                      setTimer(180);
                      notify('OTP resent successfully', { type: 'success' });
                    }}
                  >
                    Resend OTP
                  </Button>
                )}
              </Box>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  {...register('agreeToTerms')}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: 'inherit' }}>
                    <Typography component="span" color="primary">
                      Terms and Conditions
                    </Typography>
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
            {errors.agreeToTerms && (
              <Typography variant="caption" color="error">
                {errors.agreeToTerms.message}
              </Typography>
            )}
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || !captchaToken}
              onClick={handleOtpAndSignup}
            >
              {
                !SENT_OTP ? 'Sign Up' : !otpSent ? 'Send OTP' : !otpVerified ? 'Verify OTP' : 'Sign Up'
              }
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'inherit' }}>
                  <Typography component="span" color="primary">
                    Sign in
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};