import React, { useState } from "react";
import "./DocumentUpload.css";

const DocumentUpload = ({ onUpload, stamps }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [stamped, setStamped] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    // Check if all files are PDFs
    const isAllPDF = files.every((file) => file.type === "application/pdf");

    if (!isAllPDF) {
      alert("Only PDF files are allowed.");
      event.target.value = ""; // Clear the file input
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length > 0) {
        await onUpload(selectedFiles[0], name, description, stamped, selectedStamp); // Send only the first file
        setSelectedFiles([]);
        setDescription("");
        setName(""); 
        setStamped(false);
        setSelectedStamp(null);

        alert("The file has been uploaded proceed to the Unstamped Doc");

      } else {
        alert("Please select a file to upload.");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  return (
    <div className="document-upload">
      <input
        type="text"
        placeholder="Enter document name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Enter a description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <label>
          <input
            type="checkbox"
            checked={stamped}
            onChange={(e) => setStamped(e.target.checked)}
          />
          Is Stamped?
        </label>
      </div>

      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      {selectedFiles.length > 0 && (
        <div className="file-preview">
          <h3>Selected File:</h3>
          <p>{selectedFiles[0].name}</p>
        </div>
      )}
      <button onClick={handleUpload} disabled={selectedFiles.length === 0 || !name}>
        Upload
      </button>
    </div>
  );
};

export default DocumentUpload;
