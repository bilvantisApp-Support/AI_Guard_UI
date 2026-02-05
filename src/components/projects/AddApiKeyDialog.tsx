import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    MenuItem,
    Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ApiKey } from '@/types/api';
import { useEffect } from 'react';

const PROVIDER_REGEX: Record<string, RegExp> = {
    openai: /^sk-(proj-)?[A-Za-z0-9_-]{20,}$/,
    anthropic: /^sk-ant-[A-Za-z0-9-_]{20,}$/,
    gemini: /^AIza[0-9A-Za-z\-_]{30,}$/,
};

interface FormData {
    provider: 'openai' | 'anthropic' | 'gemini';
    apiKey: string;
}

interface AddApiKeyDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => Promise<void>;
    existingKeys: ApiKey[];
    loading?: boolean;
}

const schema = (existingKeys: ApiKey[]) =>
    yup.object({
        provider: yup
            .mixed<FormData['provider']>()
            .oneOf(['openai', 'anthropic', 'gemini'])
            .required('Provider is required')
            .test(
                'duplicate-provider',
                'API key for this provider already exists',
                function (provider) {
                    if (!provider) return true;
                    return !existingKeys.some(
                        (k) => k.provider === provider
                    );
                }
            ),

        apiKey: yup
            .string()
            .required('API key is required')
            .test(
                'valid-format',
                'API key does not match selected provider',
                function (value) {
                    const provider = this.parent.provider;
                    if (!provider || !value) return false;
                    return PROVIDER_REGEX[provider]?.test(value);
                }
            ),
    });


export const AddApiKeyDialog = ({
    open,
    onClose,
    onSubmit,
    existingKeys,
    loading,
}: AddApiKeyDialogProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        trigger,
    } = useForm<FormData>({
        resolver: yupResolver(schema(existingKeys)),
        mode: 'onChange',
        reValidateMode: 'onChange',
        
    });

    const selectedProvider = watch('provider');

    useEffect(() => {
        if (selectedProvider) {
            trigger('provider');
        }
    }, [selectedProvider, existingKeys, trigger]);

    useEffect(() => {
        if (open) {
            reset();
        }
    }, [open, reset]);


    const providerAlreadyExists = existingKeys.some(
        (k) => k.provider === selectedProvider
    );

    const handleFormSubmit = async (data: FormData) => {
        try {
            await onSubmit(data);
            reset();
            onClose();

        } catch (error) {
            console.error("Error adding API Key:", error)
        }
    }

    const handleClose = () => {
        reset();
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add API Key</DialogTitle>

            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3} pt={1}>
                    <TextField
                        select
                        label="Provider"
                        fullWidth
                        {...register('provider')}
                        error={!!errors.provider}
                        helperText={errors.provider?.message}
                    >
                        <MenuItem value="openai">OpenAI</MenuItem>
                        <MenuItem value="anthropic">Anthropic</MenuItem>
                        <MenuItem value="gemini">Gemini</MenuItem>
                    </TextField>

                    <TextField
                        label="API Key"
                        fullWidth
                        type="password"
                        disabled={providerAlreadyExists}
                        {...register('apiKey')}
                        error={!!errors.apiKey}
                        helperText={errors.apiKey?.message}
                        placeholder="Paste your API key here"
                    />

                    {errors.apiKey && (
                        <Alert severity="error">{errors.apiKey.message}</Alert>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add API Key'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
