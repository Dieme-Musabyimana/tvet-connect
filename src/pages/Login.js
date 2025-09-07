import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";

const idLabels = {
  student: "Student ID / Email",
  school: "School ID / Email",
  company: "Company ID / Email",
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { loginUser } = useDB();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = loginUser({ role, identifier, password });
    if (result.success) {
      navigate(`/dashboard/${role}`);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="page">
      <h1>Log in as {role}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={idLabels[role]}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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