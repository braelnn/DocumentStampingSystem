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


//qr-code
export const fetchQRCode = async () => {
  try {
      const token = localStorage.getItem("authToken");
      if (!token) {
          throw new Error("Authentication token is missing. Please log in.");
      }

      const response = await fetch(`http://localhost:8000/auth/api/qr-code/`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
      });

      if (!response.ok) {
          if (response.status === 401) {
              throw new Error("Unauthorized: Please log in again.");
          }
          throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.qr_code_url;
  } catch (error) {
      console.error("Error fetching QR code:", error);
      throw error;
  }
};

export const fetchAllQRCodes = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication token is missing. Please log in.");
    }

    const response = await fetch(`http://localhost:8000/auth/qr-codescollect/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again.");
      }
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.qr_codes;
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    throw error;
  }
};


//admin
export const getallusers = async () => {
  try {
    const authToken = localStorage.getItem("authToken");

    const response = await axios.get("http://localhost:8000/auth/users/", {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};


export const deleteUser = async (userId) => {
  try {
    const authToken = localStorage.getItem("authToken");

    const response = await axios.delete(`http://localhost:8000/auth/users/${userId}/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
