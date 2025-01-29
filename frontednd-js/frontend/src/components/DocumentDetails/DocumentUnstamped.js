import React from "react";
import "./DocumentUnstamped.css";


const DocumentUnstamped = ({ unstampedDocuments, onSelectDocument }) => {
  const getFileUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    return `http://localhost:8000/media/${filePath.replace(/^\/?media\//, "")}`;
  };

  return (
    <div className="document-unstamped">
      <table>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {unstampedDocuments.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.name}</td>
              <td>
                <a
                  href={getFileUrl(doc.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {doc.file.split("/").pop()}
                </a>
              </td>
              <td>
                <button onClick={() => onSelectDocument(doc)}>Stamp</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentUnstamped;
