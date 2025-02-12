import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { login, verifyLoginOTP } from "../services/authService";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(email, password); // Call the login API
      if (data.requires_otp) {
        setRequiresOtp(true); // If OTP is required, show OTP input
        alert("OTP has been sent to your email.");
      } else {
        // Save tokens to localStorage
        localStorage.setItem("authToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        // Debug: Ensure tokens are stored
        console.log("Auth Token Saved:", localStorage.getItem("authToken"));
        console.log("Refresh Token Saved:", localStorage.getItem("refreshToken"));

        // Redirect to QR code generation
        navigate("/stamps");
      }
    } catch (err) {
      setError(err.error || "Login failed. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const data = await verifyLoginOTP(email, otp); // Verify OTP
      localStorage.setItem("authToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // Debug: Ensure tokens are stored
      console.log("Auth Token Saved (OTP):", localStorage.getItem("authToken"));
      console.log("Refresh Token Saved (OTP):", localStorage.getItem("refreshToken"));

      // Redirect to QR code generation
      navigate("/stamps");
    } catch (err) {
      setError(err.error || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="start">
      <Header />
      <section className="login-page">
        <div className="card">
          <div className="login-card">
            <div className="card-content">
              <div className="logo">🔶 CHAKAN</div>
              <h2>{requiresOtp ? "Verify OTP" : "Sign into your account"}</h2>
              <form onSubmit={requiresOtp ? handleVerifyOtp : handleLogin}>
                {!requiresOtp && (
                  <>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </>
                )}
                {requiresOtp && (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="input-field"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                )}
                <button type="submit" className="login-button">
                  {requiresOtp ? "VERIFY OTP" : "LOGIN"}
                </button>
              </form>
              {error && <p className="error-message">{error}</p>}
              <div className="links">
                <p>
                  Don't have an account?{" "}
                  <a href="/register" className="register-link">
                    Register here
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Login;
