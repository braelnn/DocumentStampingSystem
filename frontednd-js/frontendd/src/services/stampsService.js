import axios from "axios";

const API_URL = "http://localhost:8000/stamps/api/stamps/"; // Update base URL if needed

/**
 * Get all stamps.
 * @returns {Promise} A promise that resolves to the list of stamps.
 */
export const getStamps = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

/**
 * Create a new stamp.
 * @param {Object} stampData The stamp details.
 * @returns {Promise} A promise that resolves to the created stamp's data.
 */
export const createStamp = async (stampData) => {
  const response = await axios.post(API_URL, stampData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

/**
 * Delete a stamp.
 * @param {number} id The ID of the stamp to delete.
 * @returns {Promise} A promise that resolves when the stamp is deleted.
 */
export const deleteStamp = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting stamp with ID ${id}:`, error);
    throw error;
  }
};

export const updateStamp = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, updatedData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating stamp with ID ${id}:`, error);
    throw error;
  }
};

export const downloadStamp = async (id) => {
  try {
    const response = await axios.get(`${API_URL}${id}/download/`, {
      responseType: "blob", // Treats response as binary
    });
    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `stamp_${id}.png`); // Adjust file extension/type as needed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(`Error downloading stamp with ID ${id}:`, error);
    throw error;
  }
};
