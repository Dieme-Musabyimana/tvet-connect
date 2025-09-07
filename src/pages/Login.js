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
    <div className="page">
      <h1>{role} Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="identifier"
          placeholder={roleIdentifiers[role]}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      <p>{message}</p>
      <p>
        Don't have an account? <Link to={`/register/${role}`}>Register here</Link>
      </p>
    </div>
  );
}