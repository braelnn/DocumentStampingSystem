import React from "react";
import "./ServicesPage.css";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import { FaStamp, FaQrcode, FaCheckCircle, FaCloudUploadAlt, FaFileDownload, FaShieldAlt, FaUsersCog, FaClipboardList } from "react-icons/fa";
import Footer from "../components/Footer";

const serviceSections = [
  {
    title: "Stamping & Verification",
    services: [
      { id: 1, icon: <FaStamp />, title: "Digital Stamping", description: "Authenticate documents using customizable digital stamps." },
      { id: 2, icon: <FaQrcode />, title: "QR Code Stamping", description: "Embed QR codes in documents for easy validation." },
      { id: 3, icon: <FaCheckCircle />, title: "Authentication & Security", description: "Verify documents with serial numbers and OTP authentication." },
    ],
  },
  {
    title: "Document Handling",
    services: [
      { id: 4, icon: <FaCloudUploadAlt />, title: "Document Upload", description: "Upload and manage documents in multiple formats (PDF, PNG, JPEG)." },
      { id: 5, icon: <FaFileDownload />, title: "Download & Export", description: "Download documents with applied stamps in a secure format." },
      { id: 6, icon: <FaClipboardList />, title: "Version Control", description: "Maintain multiple versions of a stamped document for traceability." },
    ],
  },
  {
    title: "User & Security Management",
    services: [
      { id: 7, icon: <FaUsersCog />, title: "User Management", description: "Manage user roles and access permissions securely." },
      { id: 8, icon: <FaShieldAlt />, title: "Security Measures", description: "Implements encrypted authentication and robust security layers." },
    ],
  },
];

const ServicesPage = () => {
  return (
    <div className="service">
        <Header />
        <div className="service-container">
        <h2 className="service-title">Digital Stamping Services</h2>
        {serviceSections.map((section, index) => (
            <div key={index} className="service-section">
            <h3 className="section-title">{section.title}</h3>
            <div className="service-grid">
                {section.services.map((service) => (
                <div key={service.id} className="service-card">
                    <div className="service-icon">{service.icon}</div>
                    <h4 className="service-heading">{service.title}</h4>
                    <p className="service-description">{service.description}</p>
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>
        <Footer />
    </div>
  );
};

export default ServicesPage;
