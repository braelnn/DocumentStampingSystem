import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Link } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./VerificationPage.css"; // Import CSS
import Header from "../components/Header";

const VerificationPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf,.docx,.png,.jpg,.jpeg",
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
      setPreview(URL.createObjectURL(acceptedFiles[0]));
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please upload a document first.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/verify/", formData);
      setVerificationResult(response.data);
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({ status: "Error", message: "Failed to verify document" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeScan = (result) => {
    if (result) {
      setScannedQR(result);
      setIsScanning(false);
      console.log("Scanned QR Code:", result);
    }
  };

  return (
    <div className="Doc">
      <Header />
      <div className="verification-container">
        <h2>Document Verification</h2>

        {/* Upload Section */}
        <div {...getRootProps()} className="upload-section">
          <input {...getInputProps()} />
          <p>Drag & drop a document here, or click to select one</p>
        </div>

        {preview && <img src={preview} alt="Preview" className="preview-image" />}

        {/* QR Code Scanner */}
        <button className="scan-button" onClick={() => setIsScanning(!isScanning)}>
          {isScanning ? "Stop Scanning" : "Scan QR Code"}
        </button>

        {isScanning && (
          <Scanner
            onDecode={handleQRCodeScan}
            onError={(error) => console.error("QR Scanner Error:", error)}
          />
        )}

        {scannedQR && <p>Scanned QR Code Data: {scannedQR}</p>}

        {/* Verify Button */}
        <button className="verify-button" onClick={handleUpload} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Document"}
        </button>

        {/* Verification Result */}
        {verificationResult && (
          <div className="verification-result">
            <h3>Verification Result</h3>
            <p>Status: {verificationResult.status}</p>
            <p>Message: {verificationResult.message}</p>
            {verificationResult.details && (
              <div>
                <p><strong>Stamp Owner:</strong> {verificationResult.details.stamp_owner}</p>
                <p><strong>Verified Email:</strong> {verificationResult.details.email}</p>
                <p><strong>Serial Number:</strong> {verificationResult.details.serial_number}</p>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <button className="back-button">
          <Link to="/stamps" className="back-link">Back to Document</Link>
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;
