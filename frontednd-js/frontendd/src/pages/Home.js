import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { FaClock, FaLock, FaCog, FaFileAlt, FaLayerGroup,
        FaQrcode, FaShieldAlt, FaUserCheck, FaFileSignature,
        FaExclamationTriangle, FaFingerprint, FaBullhorn } from 'react-icons/fa';
import Header from '../components/Header';
import './Home.css'
import Footer from '../components/Footer';

function Home() {
  
  return (
    <div className="home">
       <Header />
       <section className="hero section dark-background">
        <img 
          src="assets/img/hero-bg.jpg" 
          alt="hero background" 
          className="hero-bg"
        />

        <div className="container">
          <h2 className="hero-title">
          Revolutionize Document Authentication
          </h2>
          <p className="hero-text">
          Easily create, manage, and apply digital stamps to secure your documents with our user-friendly platform
          </p>
          <div className="hero-cta">
            <Link to="/courses" className="btn-get-started">
              Get Started
            </Link>
          </div>
        </div>
      </section>
      {/* <section id="about" className="about section">
      <div className="container">
        <div className="row">
          <div className="image-column">
            <img 
              src="assets/img/about.jpg" 
              className="about-image" 
              alt="About Us"
            />
          </div>

          <div className="content-column">
            <h3>Voluptatem dignissimos provident quasi corporis</h3>
            <p className="italic-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
              magna aliqua.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>Ullamco laboris nisi ut aliquip ex ea commodo consequat.</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Duis aute irure dolor in reprehenderit in voluptate velit.</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate trideta storacalaperda mastiro dolore eu fugiat nulla pariatur.</span>
              </li>
            </ul>
            <Link to="/about" className="read-more">
              <span>Read More</span>
              <span className="arrow-icon">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section> */}
    <section className="counts section light-background">
      <div className="container">
        <div className="stats-row">
          <div className="stats-item">
            <div className="stats-content">
              <h1>Upload Documents</h1>
              <p>Easily upload your documents in various formats</p>
            </div>
          </div>

          <div className="stats-item">
            <div className="stats-content">
              <h1>Manage Documents</h1>
              <p>Organize, view, and track your documents effortlessly</p>
            </div>
          </div>

          <div className="stats-item">
            <div className="stats-content">
              <h1>Create Stamps</h1>
              <p>Design and customize your own stamps with personalized shapes, colors, text, and logos</p>
            </div>
          </div>

          <div className="stats-item">
            <div className="stats-content">
              <h1>Manage Stamps</h1>
              <p>Organize and access your custom stamps with ease. Edit, delete, or reuse existing stamps </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div className="container">
      <div className="row">
        {/* Left Box */}
        <div className="why-box-container">
          <div className="why-box1">
            <h3>Why Choose Our Services?</h3>

            <div className="features-grid">
              <div className="feature-item">
                <FaClock className="feature-icon" />
                <h4>Real-Time Processing</h4>
                <p>Upload, manage, and stamp your documents instantly with seamless automation.</p>
              </div>

              <div className="feature-item">
                <FaLock className="feature-icon" />
                <h4>Secure & Tamper-Proof</h4>
                <p>Advanced security measures ensure document authenticity and prevent unauthorized access.</p>
              </div>

              <div className="feature-item">
                <FaCog className="feature-icon" />
                <h4>Customizable Stamps</h4>
                <p>Tailor document stamps to your business needs with easy-to-configure options.</p>
              </div>

              <div className="feature-item">
                <FaFileAlt className="feature-icon" />
                <h4>Document Management</h4>
                <p>Organize and track your documents with version control and intuitive categorization.</p>
              </div>

              <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <h4>Traceability</h4>
                <p>Track document history with robust traceability features for complete transparency.</p>
              </div>

              <div className="feature-item">
                <FaLayerGroup className="feature-icon" />
                <h4>Efficiency & Workflow</h4>
                <p>Boost productivity with tools designed to simplify and optimize your document processes.</p>
              </div>
            </div>

            <div className="text-center">
              <Link to="/services" className="more-btn">
                <span>Learn More</span>
                <span className="chevron-right">›</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
     {/* New Containers */}
    <div className="container">
      <div className="row">
        {/* Left Box */}
        <div className="why-box-container">
          <div className="why-box1">
            <h3>QR Code Stamping</h3>
            <div className="features-grid">
              <div className="feature-item">
                <FaQrcode className="feature-icon" />
                <h4>Secure QR Codes</h4>
                <p>Generate and embed QR codes with every stamp for enhanced document security.</p>
              </div>

              <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <h4>Forgery Prevention</h4>
                <p>Ensure tamper-proof validation, reducing the risk of document fraud.</p>
              </div>

              <div className="feature-item">
                <FaUserCheck className="feature-icon" />
                <h4>Instant Verification</h4>
                <p>Scan QR codes to confirm authenticity and track document history in real-time.</p>
              </div>

              <div className="feature-item">
                <FaClock className="feature-icon" />
                <h4>Timestamp Metadata</h4>
                <p>Each QR code encodes document ID, user info, and precise timestamps.</p>
              </div>

              <div className="feature-item">
                <FaFileSignature className="feature-icon" />
                <h4>Seamless Integration</h4>
                <p>Works effortlessly with our document verification system for smooth validation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        {/* Left Box */}
        <div className="why-box-container">
          <div className="why-box1">
            <h3>Document Verification</h3>

            <div className="verification-features">
              <div className="feature-grid">
                <div className="feature-item">
                  <FaShieldAlt className="icon" />
                  <div className="feature-text">
                    <h4>Authenticity Assurance</h4>
                    <p>Advanced scanners and metadata checks verify document integrity and authenticity.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <FaQrcode className="icon" />
                  <div className="feature-text">
                    <h4>QR & Digital Stamps</h4>
                    <p>Cross-checks QR codes, digital stamps, and document content to detect tampering.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <FaFileSignature className="icon" />
                  <div className="feature-text">
                    <h4>Metadata Validation</h4>
                    <p>Timestamps, serial numbers, and credentials ensure each document’s originality.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <FaClock className="icon" />
                  <div className="feature-text">
                    <h4>Real-Time Feedback</h4>
                    <p>Instant alerts notify users of discrepancies or unauthorized modifications.</p>
                  </div>
                </div>

                <div className="feature-item">
                  <FaExclamationTriangle className="icon" />
                  <div className="feature-text">
                    <h4>Fraud Prevention</h4>
                    <p>Reduces forgery risks and ensures compliance with legal and business standards.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div className="container">
      <div className="row">
        {/* Left Box */}
        <div className="why-box-container">
          <div className="why-box1">
            <h3>Secure & Traceable Authentication</h3>
            
            {/* Icon-based Design */}
            <div className="feature-grid">
              <div className="feature-item ">
                <FaShieldAlt className="icon" />
                <h4>Enhanced Security</h4>
                <p>Every document is linked to a unique serial number for enhanced security.</p>
              </div>
              <div className="feature-item ">
                <FaFingerprint className="icon" />
                <h4>Identity Verification</h4>
                <p>Logs user identity, timestamp, and document metadata for authenticity.</p>
              </div>
              <div className="feature-item ">
                <FaClock className="icon" />
                <h4>Real-Time Traceability</h4>
                <p>Ensures immediate access to transaction history, reducing fraud.</p>
              </div>
              <div className="feature-item ">
                <FaFileSignature className="icon" />
                <h4>Audit Trail</h4>
                <p>Generates an auditable record, preventing unauthorized modifications.</p>
              </div>
              <div className="feature-item ">
                <FaLock className="icon" />
                <h4>Tamper-Proof Logging</h4>
                <p>Protects document history and ensures compliance with regulatory standards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <div className="row">
        {/* Left Box */}
        <div className="why-box-container">
          <div className="why-box1">
            <h3>About Us</h3>
            <p>
            We are a team dedicated to revolutionizing digital document authentication. 
            Our platform offers secure, tamper-proof document management with features like QR code stamping, 
            real-time verification, and traceable serial numbers. We help businesses and individuals protect sensitive 
            records, ensuring reliability, transparency, and compliance for legal, business, and personal use.
            </p>

            {/* Iconography and Features Section */}
            <div className="features-section">
              <div className="feature-item">
                <FaShieldAlt className="feature-icon" />
                <h4>Secure & Reliable</h4>
                <p>We prioritize the security and integrity of your documents with advanced encryption and authentication.</p>
              </div>
              <div className="feature-item">
                <FaFingerprint className="feature-icon" />
                <h4>Identity Verification</h4>
                <p>Every transaction is verified, ensuring the authenticity and accountability of every digital stamp.</p>
              </div>
              <div className="feature-item">
                <FaBullhorn className="feature-icon" />
                <h4>Innovative Solutions</h4>
                <p>Utilizing cutting-edge technology like QR code stamping, real-time verification, and traceability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <Footer />    

    </div>
  );
  
  
}

export default Home;