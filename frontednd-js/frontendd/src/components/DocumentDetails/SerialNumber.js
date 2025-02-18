import React, { useState, useEffect } from "react";
import { fetchSerialNumber } from "../../services/documentsService";

const SerialNumber = ({ onSerialGenerated, documentId }) => {
    const [serialNumber, setSerialNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (documentId) {
            handleFetchSerialNumber();
        }
    }, [documentId]);

    // Fetch Serial Number
    const handleFetchSerialNumber = async () => {
        setLoading(true);
        setError("");

        try {
            const serial = await fetchSerialNumber(documentId);
            setSerialNumber(serial);

            // Pass serial number to the parent component
            if (onSerialGenerated) {
                onSerialGenerated(serial);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch serial number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="serial-number-container">
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            {serialNumber && <p>Serial Number: {serialNumber}</p>}
        </div>
    );
};

export default SerialNumber;