import React, { useState } from 'react';
import './Register.css';
import Header from '../components/Header';
import { registerUser } from '../services/authService';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await registerUser(username, email, password);
      setError('');
      alert("Registration successful!"); // Show success message

      // Clear input fields after successful registration
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
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
            />
            <input
              type="email"
              placeholder="Email address..."
              className="register-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password..."
              className="register-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Repeat Password..."
              className="register-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="register-button">Sign Up</button>
          </form>
          <p className="register-footer">
            <a href="/login" className="register-link">Sign in →</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
