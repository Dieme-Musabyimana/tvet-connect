import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";

const roleIdentifiers = {
  student: "Email or Student ID",
  school: "Email or School ID",
  company: "Email or Company ID",
  rtb: "Email",
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useDB();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const displayRole = role === "rtb" ? "RTB" : role?.charAt(0).toUpperCase() + role?.slice(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = loginUser({ role, identifier: formData.identifier, password: formData.password });
    if (result.success) {
      navigate(`/dashboard/${role}`);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div
      className="page auth-page"
      style={{
        // Professional Rwanda TVET themed background (local image from public folder)
        backgroundImage: "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/rwanda-tvet-board-rtb-466854.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="auth-card" style={{ backdropFilter: "saturate(110%) blur(2px)", background: "rgba(255,255,255,0.95)" }}>
        <div className="auth-header">
          <h1>{displayRole} Login</h1>
          <p className="auth-subtitle">Welcome back to TVET Connect. Please sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{roleIdentifiers[role]}</label>
            <input
              type="text"
              name="identifier"
              placeholder={roleIdentifiers[role]}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            {/* Smaller, modern button */}
            <button type="submit" className="btn-small">Log In</button>
          </div>
        </form>

        <p className="auth-message">{message}</p>
        <p className="auth-footer">
          Don't have an account? <Link to={`/register/${role}`}>Register here</Link>
        </p>
      </div>
    </div>
  );
}