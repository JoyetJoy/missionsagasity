"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPtoPhone = sendOTPtoPhone;
exports.verifyOTPinPhone = verifyOTPinPhone;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const DEFAULT_TEMP_ID = process.env.MSG91_TEMP_ID;
const BASE_URL = process.env.MSG91_URL || "https://control.msg91.com/api/v5/otp";
/**
 * Sends an OTP to a phone number using MSG91.
 * @param phoneNumber The phone number (with country code, e.g., 91xxxxxxxxxx)
 * @param otp The OTP code to send
 * @param templateId Optional MSG91 template ID
 */
async function sendOTPtoPhone(phoneNumber, otp, templateId) {
    try {
        const response = await axios_1.default.get(BASE_URL, {
            params: {
                template_id: templateId || DEFAULT_TEMP_ID,
                mobile: phoneNumber,
                authkey: AUTH_KEY,
                otp: otp
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('MSG91 Send OTP Error:', error.response?.data || error.message);
        throw new Error('Failed to send OTP');
    }
}
/**
 * Verifies an OTP using MSG91.
 * Note: If using manual tracking (TemporaryRegistration), we verify the OTP
 * from the database or via MSG91's own verify endpoint.
 * This implementation assumes we use MSG91's verify endpoint.
 */
async function verifyOTPinPhone(phoneNumber, otp) {
    try {
        const response = await axios_1.default.get(`${BASE_URL}/verify`, {
            params: {
                authkey: AUTH_KEY,
                mobile: phoneNumber,
                otp: otp
            }
        });
        // MSG91 returns type: "success" and message: "OTP verified success"
        return {
            valid: response.data.type === 'success',
            message: response.data.message
        };
    }
    catch (error) {
        console.error('MSG91 Verify OTP Error:', error.response?.data || error.message);
        return {
            valid: false,
            message: error.response?.data?.message || 'OTP verification failed'
        };
    }
}
//# sourceMappingURL=otp.js.map