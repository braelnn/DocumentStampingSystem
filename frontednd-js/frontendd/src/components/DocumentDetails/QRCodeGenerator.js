import React, { useState, useEffect } from "react";

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
            const token = localStorage.getItem("authToken");
            console.log("Auth Token:", token);

            if (!token) {
                setError("Authentication token is missing. Please log in.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${baseURL}/api/qr-code/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Response:", response);

            if (!response.ok) {
                if (response.status === 401) {
                    setError("Unauthorized: Please log in again.");
                } else {
                    setError(`Error: ${response.statusText}`);
                }
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log("QR Code Data:", data);

            if (data.qr_code_url) {
                setQRCodeUrl(data.qr_code_url);
                if (onQRGenerated) {
                    console.log("Passing QR Code URL to parent:", data.qr_code_url);
                    onQRGenerated(data.qr_code_url);
                }
            } else {
                setError("Failed to generate QR code.");
            }
        } catch (error) {
            console.error("Error fetching QR code:", error);
            setError("Error generating QR code. Please try again.");
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
