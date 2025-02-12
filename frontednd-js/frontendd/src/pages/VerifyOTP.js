import React, { useState } from "react";
import { verifyOTP } from "../services/authService";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./VerifyOTP.css";

const VerifyOTP = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOTP(email, otp);
      alert("Email verified successfully!");
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError(err.error || "Invalid OTP");
    }
  };

  return (
    <div className="OTP">
      <Header />
    <div className="verify-otp-container">
      <h2>Email Verification</h2>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Verify OTP</button>
      </form>
    </div>
    <Footer />
    </div>
  );
};

export default VerifyOTP;
