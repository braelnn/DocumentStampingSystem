import React, { useState } from 'react';
import './Register.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { registerUser } from '../services/authService';
import { useNavigate } from "react-router-dom";


const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('Individual');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  
    const handleRegister = async (e) => {
      e.preventDefault();
  
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
  
      try {
        const userData = {
          username,
          email,
          password,
          accountType,
          ...(accountType === 'Company' && { companyName, companyAddress })
        };
  
        await registerUser(userData);
        setError('');
        alert("Registration successful! Please check your email for the OTP.");
        
        // Clear form fields
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAccountType('Individual');
        setCompanyName('');
        setCompanyAddress('');
  
        // Redirect to OTP verification page
        navigate("/verify-otp");
      } catch (err) {
        setError(err.error || "An error occurred during registration");
      }
    };

  

  return (
    <div className="register">
      <Header />
      <section className="register-container">
        <div className="register-image-section"></div>
        <div className="register-form-section">
          <h2 className="register-heading">Sign Up</h2>
          <form className="register-form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username..."
              className="register-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address..."
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password..."
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Repeat Password..."
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            {/* Account Type Selection */}
            <div className="account-type-container">
              <label>Account Type:</label>
              <select
                className="register-input"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              >
                <option value="Individual">Individual</option>
                <option value="Company">Company</option>
              </select>
            </div>

            {/* Conditional Company Fields */}
            {accountType === 'Company' && (
              <>
                <input
                  type="text"
                  placeholder="Company Name..."
                  className="register-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Company Address..."
                  className="register-input"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  required
                />
              </>
            )}

            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-button">Sign Up</button>
          </form>
          <p className="register-footer">
            <a href="/login" className="register-link">Sign in →</a>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Register;
