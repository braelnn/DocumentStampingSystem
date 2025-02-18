import React from "react";
import "./Footer.css";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section about">
          <h2>About Us</h2>
          <p>
            The Digital Stamping System provides a secure, efficient way to authenticate documents electronically.
            Designed for individuals and organizations, it replaces physical stamps with a scalable, customizable solution.
          </p>
        </div>

        {/* Services Section */}
        <div className="footer-section services">
          <h2>Our Services</h2>
          <ul>
            <li>Electronic Document Stamping</li>
            <li>QR Code Authentication</li>
            <li>Real-Time Timestamping</li>
            <li>Secure Digital Signature Integration</li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links">
          <h2>Quick Links</h2>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="/stamps">Stamps</a></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-section contact">
          <h2>Contact Us</h2>
          <p><FaMapMarkerAlt />Stamping Plaza, Nairobi City, KE</p>
          <p><FaPhone /> +254 (799) 714-4455</p>
          <p><FaEnvelope /> blessingbraelly@gmail.com</p>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Digital Stamping System. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
