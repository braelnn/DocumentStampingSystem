import React, { useState, useEffect } from "react";
import Header from '../components/Header';
import {
  getStamps,
  createStamp,
  deleteStamp,
  updateStamp,
  downloadStamp,
} from "../services/stampsService";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  stampDocument,
  deleteStampedDocument,
  downloadStampedDocument, fetchStampedDocumentById,
} from "../services/documentsService";
import StampCustomizer from "../components/StampDetails/StampCustomizer";
import StampList from "../components/StampDetails/StampList";
import StampPreview from "../components/StampDetails/StampPreview";
import DocumentCanvas from "../components/DocumentDetails/DocumentCanvas";
import DocumentUpload from "../components/DocumentDetails/DocumentUpload";
import DocumentUnstamped from "../components/DocumentDetails/DocumentUnstamped";
import DocumentStamped from "../components/DocumentDetails/DocumentStamped";
import "./StampingPage.css";

const StampingPage = () => {
  const [stamps, setStamps] = useState([]);
  const [unstampedDocuments, setUnstampedDocuments] = useState([]);
  const [stampedDocuments, setStampedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentStamp, setCurrentStamp] = useState(null);
  const [showStampList, setShowStampList] = useState(false);

  // Utility function to construct file URLs safely
  const getFileUrl = (filePath) => {
  if (!filePath) return "";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `http://localhost:8000/media/${filePath.replace(/^\/?media\//, "")}`;
};

  // Fetch stamps and documents on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedStamps, fetchedDocuments] = await Promise.all([
          getStamps(),
          getDocuments(),
        ]);

        // Filter documents based on 'stamped' status
        setStamps(fetchedStamps);
        setUnstampedDocuments(fetchedDocuments.filter((doc) => !doc.stamped));
        setStampedDocuments(fetchedDocuments.filter((doc) => doc.stamped));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Save a new stamp
  const handleSaveStamp = async (stampData) => {
    try {
      const stampName = prompt("Enter a name for the stamp:");
      if (!stampName) return;

      const newStamp = await createStamp({
        name: stampName,
        preview: stampData,
      });
      setStamps((prevStamps) => [...prevStamps, newStamp]);
    } catch (error) {
      console.error("Error saving stamp:", error);
    }
  };

  const handleDeleteStamp = async (id) => {
    if (window.confirm("Are you sure you want to delete this stamp?")) {
      try {
        await deleteStamp(id);
        setStamps((prevStamps) => prevStamps.filter((stamp) => stamp.id !== id));
        alert("Stamp deleted successfully.");
      } catch (error) {
        alert("Failed to delete the stamp. Please try again.");
      }
    }
  };

  const handleRenameStamp = async (id, currentName) => {
    const newName = prompt("Enter a new name for the stamp:", currentName);
    if (!newName || newName.trim() === "") {
      alert("Invalid name. Rename operation canceled.");
      return;
    }
  
    try {
      const updatedStamp = await updateStamp(id, { name: newName });
      setStamps((prevStamps) =>
        prevStamps.map((stamp) => (stamp.id === id ? updatedStamp : stamp))
      );
      alert("Stamp renamed successfully.");
    } catch (error) {
      alert("Failed to rename the stamp. Please try again.");
    }
  };

  const handleDownloadStamp = async (id) => {
    try {
      await downloadStamp(id);
      alert("Stamp downloaded successfully.");
    } catch (error) {
      alert("Failed to download the stamp. Please try again.");
    }
  };
  

  
  

  // Upload documents
  const handleUploadDocuments = async (file, name, description) => {
    try {
      const newDocument = await uploadDocument(file, name, description);
      setUnstampedDocuments((prevDocs) => [...prevDocs, newDocument]);
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  // Select a document for stamping
  const handleSelectDocument = (doc) => {
    const fileUrl = getFileUrl(doc.file); // Ensure correct URL for the document
    setSelectedDocument({ id: doc.id, file: fileUrl }); // Pass both `id` and `file` to the selected document
  };
  
  

  // Select a stamp
  // const handleStampSelect = (stamp) => {
  //   setCurrentStamp(stamp);
  //   setShowStampList(false);
  // };

  // Save the stamped document
  // const handleSaveStampedDocument = async () => {
  //   if (!selectedDocument || !currentStamp) {
  //     alert("Please select a document and stamp before saving.");
  //     return;
  //   }
  
  //   try {
  //     const stampedDocument = await stampDocument(selectedDocument.id, {
  //       id: currentStamp.id,
  //       preview: currentStamp.preview,
  //       name: currentStamp.name,
  //     });
  
  //     setStampedDocuments((prevDocs) => [...prevDocs, stampedDocument]); // Ensure `stampedDocument.file` is included
  //     setUnstampedDocuments((prevDocs) =>
  //       prevDocs.filter((doc) => doc.id !== selectedDocument.id)
  //     );
  
  //     setSelectedDocument(null);
  //     setCurrentStamp(null);
  
  //     alert("Stamped document saved successfully!");
  //   } catch (error) {
  //     console.error("Error saving stamped document:", error);
  //     alert("Failed to save stamped document.");
  //   }
  // };

  const handleDownloadStampedDocument = async (documentId) => {
    try {
      await downloadStampedDocument(documentId); // Call the service function to download the document
      alert("Stamped document downloaded successfully!");
    } catch (error) {
      console.error(`Error downloading stamped document with ID ${documentId}:`, error);
      alert("Failed to download the stamped document.");
    }
  };

  const handleDeleteStampedDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this stamped document?")) {
      try {
        await deleteStampedDocument(documentId);
        setStampedDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc.id !== documentId)
        );
        alert("Stamped document deleted successfully.");
      } catch (error) {
        console.error(`Error deleting stamped document with ID ${documentId}:`, error);
        alert("Failed to delete the stamped document.");
      }
    }
  };

  

  const handleStampedDocumentSuccess = async (documentId) => {
    const updatedDocument = await fetchStampedDocumentById(documentId);
  
    if (updatedDocument) {
      // Move the document from unstamped to stamped
      setUnstampedDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== documentId));
      setStampedDocuments((prevDocs) => [...prevDocs, updatedDocument]);
    }
  };
  
  
  
  
  

  return (
    <div className="this page">
      <Header />
      <div className="stamping-page">
        <h1>Stamping Dashboard</h1>
        <div className="stamping-page-content">
          <aside className="sidebar">
            <h2>Create and Preview Stamps</h2>
            <StampCustomizer onSave={handleSaveStamp} />
            {currentStamp && <StampPreview stampData={currentStamp.preview} />}
          </aside>
          <main className="main-content">
            <section>
              <h2>My Stamps</h2>
              <StampList
                stamps={stamps}
                onDelete={handleDeleteStamp}
                onRename={handleRenameStamp}
                onDownload={handleDownloadStamp}
                onSelect={setCurrentStamp}
              />
            </section>
            <section>
              <h2>Upload Documents</h2>
              <DocumentUpload onUpload={handleUploadDocuments} />
            </section>
            <section>
              <h2>Unstamped Documents</h2>
              <DocumentUnstamped
                unstampedDocuments={unstampedDocuments}
                onSelectDocument={handleSelectDocument}
              />
            </section>
            {selectedDocument && (
              <section>
              <h2>Document Canvas</h2>
              {/* Pass documentId and documentUrl dynamically */}
              <DocumentCanvas
                documentId={selectedDocument.id}
                documentUrl={selectedDocument.file}
                onSaveSuccess={handleStampedDocumentSuccess} // Pass success handler

              />
            </section>
            )}
            
            <section>
              <h2>Stamped Documents</h2>
              <DocumentStamped
                stampedDocuments={stampedDocuments}
                onDelete={handleDeleteStampedDocument}
                onDownload={handleDownloadStampedDocument}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default StampingPage;
