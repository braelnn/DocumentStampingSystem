import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import './Home.css'

function Home() {
  const [counts, setCounts] = useState({
    students: 0,
    courses: 0,
    events: 0,
    trainers: 0
  });

  const finalCounts = {
    students: 1232,
    courses: 64,
    events: 42,
    trainers: 24
  };

  useEffect(() => {
    const duration = 1000; // 1 second duration
    const steps = 20; // Number of steps in the animation
    const interval = duration / steps;

    const counters = Object.entries(finalCounts).map(([key, value]) => {
      const stepValue = value / steps;
      let currentStep = 0;

      return setInterval(() => {
        if (currentStep < steps) {
          setCounts(prev => ({
            ...prev,
            [key]: Math.round(stepValue * (currentStep + 1))
          }));
          currentStep++;
        }
      }, interval);
    });

    // Cleanup intervals
    return () => counters.forEach(counter => clearInterval(counter));
  }, []);
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
    <section id="why-us" className="why-us section">
      <div className="container">
        <div className="row">
          {/* Left Box */}
          <div className="why-box-container">
            <div className="why-box">
              <h3>Why Choose Our Services?</h3>
              <p>Our services are designed to offer unparalleled efficiency, security, and customization 
                for your document authentication needs. With a user-friendly interface and cutting-edge 
                technology, you can seamlessly upload, manage, and stamp documents in real-time. 
                We prioritize your convenience with features like customizable stamps, advanced document 
                organization, and robust version control. By leveraging secure systems and dynamic 
                traceability, we ensure your documents remain authentic and tamper-proof. 
                Choose our services for reliability, 
                innovation, and an exceptional user experience tailored to simplify your workflow.</p>

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
    </section>
    </div>
  );
  
  
}

export default Home;