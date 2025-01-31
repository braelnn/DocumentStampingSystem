import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // Backend base URL
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