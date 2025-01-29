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
export const registerUser = async (username, email, password) => {
  try {
    const response = await API.post("/auth/register/", { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
