import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Ensures cookies and sessions are sent

});

export const login = async (email, password) => {
  try {
    const response = await API.post("/auth/login/", { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Verify Login OTP
export const verifyLoginOTP = async (email, otp) => {
  try {
    const response = await API.post("/auth/verify-login-otp/", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};



export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register/", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await API.post("/auth/verify-otp/", { email, otp });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const sendOTPForDocumentVerification = async () => {
  try {
    const response = await API.post("/auth/api/verify-otp-doc/", {}, { withCredentials: true });

    if (response.status === 200 && response.data.success) {
      console.log("OTP sent successfully:", response.data.message);
      return response.data;
    } else {
      throw new Error(response.data.error || "Failed to send OTP");
    }
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

/**
 * Verifies the OTP entered by the user.
 * @param {string} otp - The OTP entered by the user.
 */
export const verifyOTPForDocument = async (otp) => {
  try {
    const response = await API.post("/auth/api/verify-otp-doc/verify/", { otp }, { withCredentials: true });

    if (response.status === 200 && response.data.success) {
      console.log("OTP verification successful:", response.data.message);
      return response.data;
    } else {
      throw new Error(response.data.error || "Invalid OTP");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};