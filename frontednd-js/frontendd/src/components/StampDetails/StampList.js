import React from "react";
import "./StampList.css";

const StampList = ({ stamps, onDelete, onRename, onDownload }) => (
  <div className="stamp-list">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Preview</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {stamps.map((stamp) => (
          <tr key={stamp.id}>
            <td>{stamp.name}</td>
            <td>
              <img
                src={stamp.preview}
                alt="preview"
                style={{ width: "150px", height: "150px" }}
              />
            </td>
            <td>
              <button onClick={() => onDelete(stamp.id)}>Delete</button>
              <button onClick={() => onRename(stamp.id)}>Rename</button>
              <button onClick={() => onDownload(stamp.id)}>Download</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StampList;
