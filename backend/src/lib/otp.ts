import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const AUTH_KEY = process.env.MSG91_AUTH_KEY;
const DEFAULT_TEMP_ID = process.env.MSG91_TEMP_ID;
const BASE_URL =
  process.env.MSG91_URL || "https://control.msg91.com/api/v5/otp";

/**
 * Sends an OTP to a phone number using MSG91.
 * @param phoneNumber The phone number (with country code, e.g., 91xxxxxxxxxx)
 * @param otp The OTP code to send
 * @param templateId Optional MSG91 template ID
 */
export async function sendOTPtoPhone(phoneNumber: string, code: string) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        otp_expiry: 5,
        template_id: DEFAULT_TEMP_ID,
        mobile: `${code}${phoneNumber}`,
        realTimeResponse: "true",
      },
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log(response);

    return response.data;
  } catch (error: any) {
    console.error(
      "MSG91 Send OTP Error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to send OTP");
  }
}

/**
 * Verifies an OTP using MSG91.
 * Note: If using manual tracking (TemporaryRegistration), we verify the OTP
 * from the database or via MSG91's own verify endpoint.
 * This implementation assumes we use MSG91's verify endpoint.
 */
export async function verifyOTPinPhone(
  phoneNumber: string,
  code: string,
  otp: string,
) {
  try {
    const response = await axios.get(
      "https://control.msg91.com/api/v5/otp/verify",
      {
        params: {
          otp: otp,
          mobile: `${code}${phoneNumber}`,
        },
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
        },
      },
    );

    console.log(response,"responseresponse");
    

    // MSG91 returns type: "success" and message: "OTP verified success"
    return {
      valid: response.data.type === "success",
      message: response.data.message,
    };
  } catch (error: any) {
    console.error(
      "MSG91 Verify OTP Error:",
      error.response?.data || error.message,
    );
    return {
      valid: false,
      message: error.response?.data?.message || "OTP verification failed",
    };
  }
}
