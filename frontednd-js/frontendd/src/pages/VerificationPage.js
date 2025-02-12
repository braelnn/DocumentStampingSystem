import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Link } from "react-router-dom";
import jsQR from "jsqr"; // QR code scanner
import "./VerificationPage.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const VerificationPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQR, setScannedQR] = useState(null);
  const canvasRef = useRef(null);

  // ✅ Handle file selection
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf,.docx,.png,.jpg,.jpeg",
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setVerificationResult(null); // Reset previous results
        setScannedQR(null); // Reset QR code data
      }
    },
  });

  // ✅ Handle Upload for Verification
  const handleVerify = async () => {
    if (!selectedFile) {
        alert("Please upload a document first.");
        return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await axios.post("http://127.0.0.1:8000/verifydoc/verify/", formData);
        setVerificationResult(response.data);
    } catch (error) {
        console.error("Verification error:", error);
        setVerificationResult({ status: "Error", message: "Failed to verify document. Please try again." });
    } finally {
        setIsLoading(false);
    }
  };


  // ✅ Handle QR Code Scanning
  const scanQRCode = async () => {
    if (!selectedFile) {
        alert("Please upload a document first.");
        return;
    }

    if (selectedFile.type.startsWith("image/")) {
        // ✅ Scan QR Code from an image
        const image = new Image();
        image.src = preview;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
                setScannedQR(`QR Code Present\nContent: ${qrCode.data}`);
                console.log("✅ Scanned QR Code:", qrCode.data);
            } else {
                alert("No QR Code found in the image.");
            }
        };
    } else if (selectedFile.type === "application/pdf") {
        // ✅ Scan QR Code from a PDF (check all pages)
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(selectedFile);
        fileReader.onload = async () => {
            const pdfjsLib = await import("pdfjs-dist/webpack");
            const pdf = await pdfjsLib.getDocument({ data: fileReader.result }).promise;

            let qrCodeFound = false;
            let detectedQRData = null;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 3 }); // ⬆️ Increased scale for better clarity

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderContext = { canvasContext: ctx, viewport: viewport };
                await page.render(renderContext).promise;

                await new Promise(resolve => setTimeout(resolve, 500)); // ⏳ Ensure rendering completes

                // Convert to grayscale for better QR detection
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let j = 0; j < imageData.data.length; j += 4) {
                    const avg = (imageData.data[j] + imageData.data[j + 1] + imageData.data[j + 2]) / 3;
                    imageData.data[j] = avg;
                    imageData.data[j + 1] = avg;
                    imageData.data[j + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);

                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                if (qrCode) {
                    qrCodeFound = true;
                    detectedQRData = qrCode.data; // ✅ Store QR Code Content
                    console.log(`✅ QR Code found on page ${i}: ${qrCode.data}`);
                    break; // Stop scanning after first detection
                }
            }

            // ✅ Update state if a QR code was found
            if (qrCodeFound) {
                setScannedQR(`QR Code Present\nContent: ${detectedQRData}`);
            } else {
                alert("No QR Code found in the document.");
            }
        };
    } else {
        alert("Unsupported file type for QR code scanning.");
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

        {/* File Preview */}
        {preview &&
          (selectedFile.type.startsWith("image/") ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : selectedFile.type === "application/pdf" ? (
            <embed
              src={preview}
              type="application/pdf"
              width="100%"
              height="500px"
            />
          ) : (
            <p>File preview is not available</p>
          ))}

        {/* QR Code Scanner */}
        <button className="scan-button" onClick={scanQRCode}>
          Scan QR Code in Document
        </button>

        {/* Hidden Canvas for QR Code Scanning */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

        {scannedQR && <p>Scanned QR Code Data: {scannedQR}</p>}

        {/* ✅ Verify Button */}
        <button className="verify-button" onClick={handleVerify} disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify Document"}
        </button>

        {/* Verification Result */}
          {verificationResult && (
              <div className="verification-result">
                  <h3>Verification Result</h3>
                  <p><strong>Status:</strong> {verificationResult.status}</p>
                  <p><strong>Message:</strong> {verificationResult.message}</p>

                  {verificationResult.status === "Valid" && verificationResult.details && (
                      <div className="verification-details">
                          <p><strong>Serial Number:</strong> {verificationResult.details.serial_number || "Not Found"}</p>

                      </div>
                  )}

                  {verificationResult.status === "Error" && (
                      <p className="error-message">Verification failed. Please upload a valid document.</p>
                  )}
              </div>
          )}


        {/* Back Button */}
        <button className="back-button">
          <Link to="/stamps" className="back-link">
            Back to Document
          </Link>
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default VerificationPage;
