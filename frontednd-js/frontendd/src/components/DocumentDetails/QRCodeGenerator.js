import React, { useState, useEffect } from "react";
import { fetchQRCode } from "../../services/authService"; 


const QRCodeGenerator = ({ onQRGenerated }) => {
    const [qrCodeUrl, setQRCodeUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const baseURL = "http://localhost:8000/auth";

    useEffect(() => {
        console.log("QRCodeGenerator useEffect triggered");
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        console.log("Generating QR Code...");
        setLoading(true);
        setError("");

        try {
            const qrCodeUrl = await fetchQRCode();
            setQRCodeUrl(qrCodeUrl);
            if (onQRGenerated) {
                console.log("Passing QR Code URL to parent:", qrCodeUrl);
                onQRGenerated(qrCodeUrl);
            }
        } catch (error) {
            setError(error.message || "Error generating QR code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qr-code-generator">
            {loading && <p>Loading QR Code...</p>}
            {error && <p className="error">{error}</p>}
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
        </div>
    );
};

export default QRCodeGenerator;
