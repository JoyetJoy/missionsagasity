/**
 * Sends an OTP to a phone number using MSG91.
 * @param phoneNumber The phone number (with country code, e.g., 91xxxxxxxxxx)
 * @param otp The OTP code to send
 * @param templateId Optional MSG91 template ID
 */
export declare function sendOTPtoPhone(phoneNumber: string, otp: string, templateId?: string): Promise<any>;
/**
 * Verifies an OTP using MSG91.
 * Note: If using manual tracking (TemporaryRegistration), we verify the OTP
 * from the database or via MSG91's own verify endpoint.
 * This implementation assumes we use MSG91's verify endpoint.
 */
export declare function verifyOTPinPhone(phoneNumber: string, otp: string): Promise<{
    valid: boolean;
    message: any;
}>;
//# sourceMappingURL=otp.d.ts.map