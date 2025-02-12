import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Digital Stamping System</h3>
          <p>Ensuring document authenticity with secure digital stamping.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
          <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/stamps">Stamps</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: blessingbraelly@gmail.com</p>
          <p>Phone: +254 799 714 455</p>
          <p>Location: 123 Stamp Ave, Digital Stamper, KE</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Digital Stamping System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
