import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { login } from "../services/authService";
import "./Login.css";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await login(email, password); // Call the login API
      console.log("Login successful:", data);
      
      // Store tokens in localStorage
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      
      // Clear the input fields
      setEmail("");
      setPassword("");
      
      // Redirect to the dashboard
      navigate("/dashboardd");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.error || "Login failed. Please try again.");
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
              <h2>Sign into your account</h2>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email address"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="login-button">
                  LOGIN
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
    </div>
  );
};

export default Dashboard;
