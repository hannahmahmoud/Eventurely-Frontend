import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Always force isAdmin to false
      const dataToSend = { ...formData, isAdmin: false };

      await axios.post("http://localhost:9999/api/v1/user/signup", dataToSend);
      alert("✅ Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("❌ Signup failed: " + (err.response?.data?.message || "Server error"));
    }
  };

  return (
    <div className="signup-page">
      {/* LEFT SIDE - Form */}
      <div className="signup-form-section">
        <h2>Create your account</h2>
        <p className="subtitle">Start your journey with us — it's quick and free!</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="checkbox">
            <input type="checkbox" checked readOnly />
            <label>I agree to all Terms, Privacy Policy and Fees</label>
          </div>
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>

      {/* RIGHT SIDE - Image with overlay */}
      <div className="signup-image-section">
        <div className="image-overlay">
          <h3>Discover the Best Events of Your Life</h3>
          <p>You'll create memories that you will never forget!</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
