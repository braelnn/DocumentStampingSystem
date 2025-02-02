import React, { useState, useEffect } from "react";

const SerialNumber = ({ onSerialGenerated, documentId }) => {
    const [serialNumber, setSerialNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSerialNumber();
    }, [documentId]);

    // Fetch Serial Number from Backend
    const fetchSerialNumber = async () => {
        if (!documentId) {
            setError("Document ID is required to fetch the serial number.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:8000/documents/api/documents/${documentId}/get-serial-number/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setSerialNumber(data.serial_number);

            // Pass the serial number to the parent component
            if (onSerialGenerated) {
                onSerialGenerated(data.serial_number);
            }
        } catch (err) {
            setError(err.message || "Failed to fetch serial number.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="serial-number-container">
            {loading ? null : error ? null : null}
        </div>
    );
};

export default SerialNumber;
