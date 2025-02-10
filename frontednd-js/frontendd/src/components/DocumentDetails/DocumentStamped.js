import React from "react";
import "./DocumentStamped.css";

const DocumentStamped = ({ stampedDocuments, onDelete, onDownload, onShare }) => (
  <div className="document-stamped">
    <table>
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {stampedDocuments.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.name}</td>
            <td>{doc.description}</td>

            <td>
              <button onClick={() => onDelete(doc.id)}>Delete</button>
              <button onClick={() => onDownload(doc.id)}>Download</button>
              <button onClick={() => onShare(doc.id)}>Share</button>


            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DocumentStamped;
