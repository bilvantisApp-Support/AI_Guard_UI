import { apiClient } from "./api";

export const otpService = {

    async sendOTP(data: { email: string; name: string; }): Promise<void> {
        await apiClient.post("/_api/otp/send", data);
    },

    async verifyOTP(data: { email: string; otp: string | number; }): Promise<boolean> {
        const response = await apiClient.post<{ success: boolean; valid: boolean; message: string; }>(
            "/_api/otp/verify",
            data
        );
        return response.valid;

    }

};
