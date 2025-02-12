import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
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
            <p>
              Our services are designed to offer unparalleled efficiency, security, and customization 
              for your document authentication needs. With a user-friendly interface and cutting-edge 
              technology, you can seamlessly upload, manage, and stamp documents in real-time. 
              We prioritize your convenience with features like customizable stamps, advanced document 
              organization, and robust version control. By leveraging secure systems and dynamic 
              traceability, we ensure your documents remain authentic and tamper-proof. 
              Choose our services for reliability, innovation, and an exceptional user experience tailored 
              to simplify your workflow.
            </p>

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
              <p>
              The system allows users to generate and place QR codes alongside digital stamps, adding an extra layer of security and authentication to documents. 
              Each QR code encodes essential metadata, such as document ID, user information, and timestamps, ensuring every stamped document is uniquely identifiable. 
              By scanning the QR code, recipients can instantly verify the document's authenticity and track its history. This feature is particularly useful for businesses, 
              legal documents, and official certifications where tamper-proof validation is required. The QR code technology also integrates seamlessly with our document verification system, 
              enabling real-time checks against stored records. With this approach, we enhance trust, prevent forgery, and streamline digital document authentication across multiple industries.
              </p>
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
              <p>
              The system enables real-time document verification using built-in scanners and advanced metadata checks to ensure authenticity. By cross-referencing document content, digital stamps,
              and QR codes, the system detects any alterations or unauthorized modifications. Users can upload a document or scan a printed version, and the system will compare it against stored metadata,
              including timestamps, serial numbers, and user credentials. This ensures that every document maintains its original integrity. The verification process is essential for legal documents, business contracts, 
              and official records where authenticity is crucial. Additionally, the system provides instant feedback, alerting users if discrepancies are found. This streamlined approach enhances trust, reduces fraud, and 
              simplifies compliance with regulatory standards across various industries.
              </p>
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
              <p>
              The system enhances document security by linking every digital stamp to a unique serial number and a verified email address, ensuring traceability and authenticity. Each time a stamp is applied, the system logs critical details 
              such as the user’s identity, timestamp, and document metadata, creating an auditable record of every transaction. This prevents unauthorized modifications and helps organizations maintain compliance with regulatory standards. 
              The serial number allows quick verification, ensuring that documents remain genuine and unaltered over time. Additionally, the system’s tamper-proof logging mechanism provides a secure way to track document history, making it ideal 
              for contracts, certifications, and legal documents. This robust approach strengthens security, reduces fraud, and instills trust in digital document authentication.
              </p>
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
                We are a dedicated team committed to revolutionizing digital document authentication. 
                Our platform provides an innovative and secure way to create, manage, and verify 
                digital stamps, ensuring documents remain authentic and tamper-proof. With advanced 
                technologies like QR code stamping, real-time verification, and traceable serial 
                numbers, we help businesses, organizations, and individuals protect their sensitive 
                records. Our mission is to simplify document management while maintaining the highest 
                security standards. Whether for legal, business, or personal use, our system ensures 
                reliability, transparency, and compliance. Join us in redefining the future of secure 
                digital documentation.
              </p>
            </div>
          </div>
        </div>
      </div> 
      <Footer />    

    </div>
  );
  
  
}

export default Home;