import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:9999/api/v1/user/login", {
        email,
        password,
      });

      const { token, isAdmin } = res.data; // backend returns 1 (admin) or 0 (normal)

      // Save auth info for later API calls / route guards
      localStorage.setItem("token", token);
      localStorage.setItem("isAdmin", isAdmin);

      // 👉 Route based on role
      if (isAdmin === 1 || isAdmin === true) {
        navigate("/dashboard");
      } else if (isAdmin === 0 || isAdmin === false) {
        navigate("/reservation");
      } else {
        // Edge case: backend didn’t send a clear flag
        setError("Login succeeded but user role is unknown.");
      }
    } catch (err) {
      const message =
        err.response?.data?.Message ||        // Your backend "Message"
        err.response?.data?.message ||        // lowercase fallback
        err.response?.data?.error  ||         // another common field
        "Server error. Please try again.";

      setError("Login failed: " + message);
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <h1 className="brand">Eventurely</h1>
        <h2 className="headline">
          EXPLORE<br />HORIZONS
        </h2>
        <p className="sub">
          Where Every Event Becomes a Memory Worth Keeping.
        </p>
        <p className="desc">
          From weddings to concerts to conferences — bring your moments to life, your way.
        </p>
      </div>

      <div className="right-panel">
        <div className="login-box">
          <h2>Sign In</h2>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="form-error">{error}</div>}

            <button type="submit">SIGN IN</button>
          </form>

          <p className="signup">
            Are you new? <Link to="/signup">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
