import React from "react";
import "./About.css"; 
import Header from "../components/Header";
import Footer from "../components/Footer";

const About = () => {
    const sections = [
        {
          title: "What is Digital Stamping?",
          description:
            "The Digital Stamping System is a modern solution that replaces traditional stamps for document authentication. It ensures security, efficiency, and traceability in document processing.",
          imageClass: "about-image-1",
        },
        {
          title: "Core Functionalities",
          description:
            "Our system allows document uploading, customizable stamp creation, interactive placement, and secure downloading, ensuring seamless authentication.",
          imageClass: "about-image-2",
        },
        {
          title: "Advanced Features",
          description:
            "Featuring real-time timestamping, QR code verification, and dynamic stamping with serial numbers, our system guarantees accuracy and authenticity.",
          imageClass: "about-image-3",
        },
        {
          title: "Security & Reliability",
          description:
            "With email OTP verification, metadata storage, and robust database encryption, document security is at the core of our system.",
          imageClass: "about-image-4",
        },
        {
          title: "User-Friendly Experience",
          description:
            "A beautifully designed interface with intuitive interactions ensures an effortless experience for individuals and businesses alike.",
          imageClass: "about-image-5",
        },
      ];
    
      return (
        <div className="about">
            <Header />
            <div className="about-container">
            {sections.map((section, index) => (
                <div key={index} className="about-card">
                <div className={`about-image ${section.imageClass}`}></div>
                <div className="about-content">
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                </div>
                </div>
            ))}
            </div>
            <Footer />
        </div>
      );
    };

export default About;
