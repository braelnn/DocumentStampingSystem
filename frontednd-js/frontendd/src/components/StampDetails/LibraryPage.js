import React from "react";
import StampList from "./StampList";
import "./LibraryPage.css";

const LibraryPage = ({ stamps, onEdit, onDelete, onRename, onDownload }) => (
  <div className="library-page">
    <h1>Library</h1>
    <StampList
      stamps={stamps}
      onEdit={onEdit}
      onDelete={onDelete}
      onRename={onRename}
      onDownload={onDownload}
    />
  </div>
);

export default LibraryPage;
