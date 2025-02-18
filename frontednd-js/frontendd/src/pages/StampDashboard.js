import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StampCustomizer from "../components/StampDetails/StampCustomizer";
import StampList from "../components/StampDetails/StampList";
import StampPreview from "../components/StampDetails/StampPreview";
import DocumentCanvas from "../components/DocumentDetails/DocumentCanvas";
import DocumentUpload from "../components/DocumentDetails/DocumentUpload";
import DocumentUnstamped from "../components/DocumentDetails/DocumentUnstamped";
import DocumentStamped from "../components/DocumentDetails/DocumentStamped";

import "./StampDashboard.css";

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
  downloadStampedDocument, 
  fetchStampedDocumentById,
  shareDocument,
} from "../services/documentsService";

import { sendOTPForDocumentVerification, verifyOTPForDocument } from "../services/authService";

const StampDashboard = () => {
  const [selectedPage, setSelectedPage] = useState("welcome"); // Default content
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stamps, setStamps] = useState([]);
  const [unstampedDocuments, setUnstampedDocuments] = useState([]);
  const [stampedDocuments, setStampedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentStamp, setCurrentStamp] = useState(null);
  const [showStampList, setShowStampList] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
  
    const handleSendOTP = async () => {
      console.log("Attempting to send OTP...");
  
      try {
          const response = await sendOTPForDocumentVerification(); // No need to pass a token
  
          console.log("OTP Response:", response);
  
          if (response.success) {
              alert("To continue to Verification, enter the OTP sent to your email.");
              setIsVerifying(true);
          } else {
              alert(response.message || "Failed to send OTP. Try again.");
          }
      } catch (error) {
          console.error("Error sending OTP:", error.response?.data || error.message);
          alert(`Error sending OTP: ${error.response?.data?.detail || "Please try again."}`);
      }
  };
  
  
  
    const handleVerifyOTP = async () => {
      console.log("Verifying OTP...");
      
      if (!otp) {
          alert("Please enter an OTP.");
          return;
      }
  
      try {
          const response = await verifyOTPForDocument(otp);
          
          console.log("OTP Verification Response:", response);
  
          if (response.success) {
              alert("OTP Verified! Redirecting...");
              navigate("/verify-document");
          } else {
              alert(response.message || "Invalid OTP. Try again.");
          }
      } catch (error) {
          console.error("Error verifying OTP:", error.response?.data || error.message);
          alert("Error verifying OTP. Please try again.");
      }
    };
  
    const handleShareClick = async (docId) => {
      console.log("Share button clicked for Document ID:", docId);
    
      // Get email from user input
      const email = prompt("Enter recipient's email address:");
    
      if (!email) {
        alert("Email is required to share the document.");
        return;
      }
    
      try {
        const response = await shareDocument(docId, email);
        
        if (response.error) {
          throw new Error(response.error);
        }
    
        console.log("Server Response:", response);
        alert(`🎉 Document sent successfully to ${email}!`);
      } catch (error) {
        console.error("Error sharing document:", error.message);
        alert(`Failed to send document: ${error.message}`);
      }
    }; 

  return (
    <div className="stamper">
      <Header />

      <div className="stamping-container">
        {/* Sidebar (Fixed on the Left, No Space from Main Content) */}
        <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? "←" : "→"}
          </button>

          {/* Sidebar Links */}
          <nav className="sidebar-links">
            <ul>
              <li onClick={() => setSelectedPage("welcome")}>🏠 Home</li>
              <li onClick={() => setSelectedPage("stamp-customizer")}>✏️ Stamp Customizer</li>
              <li onClick={() => setSelectedPage("stamp-list")}>📜 Stamp List</li>
              <li onClick={() => setSelectedPage("document-upload")}>📂 Upload Documents</li>
              <li onClick={() => setSelectedPage("document-unstamped")}>📄 Unstamped Docs</li>
              <li onClick={() => setSelectedPage("document-canvas")}>🎨 Document Canvas</li>
              <li onClick={() => setSelectedPage("document-stamped")}>✅ Stamped Docs</li>
            </ul>
          </nav>
        </aside>

        {/* Main Content (Expands Fully Without Gap) */}
        <main className={`main-content ${isSidebarOpen ? "with-sidebar" : "without-sidebar"}`}>
        {selectedPage === "welcome" && (
            <div>
              <div className="welcome-card">
                <h2>Welcome to the Stamping Dashboard</h2>
                <p>Select an option from the sidebar to get started.</p>
              </div>
              
              {/* Additional Cards Below Welcome Card */}
              <div className="card-grid1">
                <div className="card1" onClick={() => setSelectedPage("stamp-customizer")}>
                  <h3>✏️ Stamp Customizer</h3>
                  <p>Create and customize your own stamps.</p>
                </div>

                <div className="card1" onClick={() => setSelectedPage("stamp-list")}>
                  <h3>📜 Stamp List</h3>
                  <p>View and manage your saved stamps.</p>
                </div>

               
                <div className="card1" onClick={() => setSelectedPage("document-upload")}>
                  <h3>📂 Upload Documents</h3>
                  <p>Upload files for stamping.</p>
                </div>

                <div className="card1" onClick={() => setSelectedPage("document-canvas")}>
                  <h3>🎨 Document Canvas</h3>
                  <p>Edit and position stamps on documents.</p>
                </div>

                <div className="card1" onClick={() => setSelectedPage("document-unstamped")}>
                  <h3>📄 Unstamped Documents</h3>
                  <p>View documents that need stamps.</p>
                </div>

                <div className="card1" onClick={() => setSelectedPage("document-stamped")}>
                  <h3>✅ Stamped Documents</h3>
                  <p>Access documents that have been stamped.</p>
                </div>
                <div className="card1" onClick={() => setSelectedPage("verify-document")}>
                  <h3>🔍 Verify Document</h3>
                  <p>Verify the authenticity of a document.</p>
              </div>

               
              </div>
            </div>
          )}

          {selectedPage === "stamp-customizer" && (
            <StampCustomizer onSave={handleSaveStamp} />
          )}

          {selectedPage === "stamp-list" && (
            <StampList
              stamps={stamps}
              onDelete={handleDeleteStamp}
              onRename={handleRenameStamp}
              onDownload={handleDownloadStamp}
              onSelect={setCurrentStamp}
            />
          )}

          {selectedPage === "stamp-preview" && (
            currentStamp && <StampPreview stampData={currentStamp.preview} />
          )}

          {selectedPage === "document-upload" && (
            <DocumentUpload onUpload={handleUploadDocuments} />
          )}

          {selectedPage === "document-unstamped" && (
            <DocumentUnstamped
              unstampedDocuments={unstampedDocuments}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {selectedPage === "document-canvas" && selectedDocument && (
            <DocumentCanvas
              documentId={selectedDocument.id}
              documentUrl={selectedDocument.file}
              onSaveSuccess={handleStampedDocumentSuccess}
            />
          )}

          {selectedPage === "document-stamped" && (
            <DocumentStamped
              stampedDocuments={stampedDocuments}
              onDelete={handleDeleteStampedDocument}
              onDownload={handleDownloadStampedDocument}
              onShare={handleShareClick}
            />
          )}

          {/* OTP Verification */}
          <div className="VerifyDoc1">
            <button onClick={handleSendOTP}>Verify Document</button>
            {isVerifying && (
              <div className="otp-popup1">
                <p>Enter OTP:</p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={handleVerifyOTP}>Submit</button>
              </div>
            )}
          </div>
        </main>
      </div>

      

      <Footer />
    </div>
  );
};


export default StampDashboard;
