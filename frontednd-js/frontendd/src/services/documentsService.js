import axios from "axios";

const API_URL = "http://localhost:8000/documents/api/documents/";

/**
 * Get all documents.
 * @returns {Promise} A promise that resolves to the list of documents.
 */
export const getDocuments = async () => {
  const response = await fetch("http://localhost:8000/documents/api/documents/");
  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }
  return await response.json();
};


/**
 * Upload a new document.
 * @param {File} file The document file to upload.
 * @returns {Promise} A promise that resolves to the uploaded document's data.
 */
export const uploadDocument = async (file, name, description, stamped) => {
  const formData = new FormData();
  formData.append("file", file); // Attach the file
  formData.append("name", name); // Attach the name
  formData.append("description", description); // Attach the description

  try {
    const response = await axios.post(
      "http://localhost:8000/documents/api/documents/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data; // Return the response data
  } catch (error) {
    console.error("Error in uploadDocument service:", error.response?.data || error.message);
    throw error; // Throw the error to handle it in the calling function
  }
};



/**
 * Delete a document.
 * @param {number} id The ID of the document to delete.
 * @returns {Promise} A promise that resolves when the document is deleted.
 */
export const deleteDocument = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`);
  return response.data;
};

/**
 * Stamp a document.
 * @param {number} id The ID of the document to stamp.
 * @param {Object} stampData The stamp to apply.
 * @returns {Promise} A promise that resolves to the updated document's data.
 */




export const saveStampedDocument = async (documentId, stampedFile) => {
  try {
    const formData = new FormData();
    formData.append("file", stampedFile);
    formData.append("stamped", "true"); // Ensure it's passed as a string

    const response = await axios.put(
      `http://localhost:8000/documents/api/documents/${documentId}/save-stamped/`, 
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error saving stamped document:", error);
    throw error;
  }
};

export const fetchStampedDocumentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}${id}/`);
    return response.data; // Ensure this contains `stamp_name` or `stamp_data`
  } catch (error) {
    console.error("Error fetching stamped document by ID:", error);
    return null;
  }
};



export const downloadStampedDocument = async (id) => {
  try {
    // Fetch the stamped document as a blob
    const response = await axios.get(`${API_URL}${id}/download/`, {
      responseType: "blob", // Receive the file as a binary blob
    });

    const contentType = response.headers["content-type"];
    const fileName = `stamped_document_${id}.pdf`;

    // Create a downloadable link
    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);

    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Open the file in a new tab for preview
    const newTab = window.open();
    if (newTab) {
      newTab.location = url;
    }
  } catch (error) {
    console.error(`Error downloading stamped document with ID ${id}:`, error);
    throw error;
  }
};



export const deleteStampedDocument = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}${id}/`);
    return response.data; // Return response data for confirmation if needed
  } catch (error) {
    console.error(`Error deleting stamped document with ID ${id}:`, error);
    throw error; // Allow the calling function to handle the error
  }
};

export const shareDocument = async (documentId, recipientEmail) => { 
  if (!documentId || !recipientEmail) {
    console.error("Error: Document ID and recipient email are required.");
    return { error: "Document ID and recipient email are required." };
  }

  try {
    console.log(`Sending document ID: ${documentId} to ${recipientEmail}`);

    const response = await axios.post(`${API_URL}${documentId}/share/`, {
      email: recipientEmail,
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    
    return { error: error.response?.data || "Failed to share document." };
  }
};

