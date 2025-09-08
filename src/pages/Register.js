import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";

const roleFields = {
  student: [
    { name: "bothNames", label: "Both Names", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "studentId", label: "Student ID (e.g., 22RP03385)", type: "text", required: true },
    { name: "phone", label: "Phone Number", type: "tel", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "photo", label: "Profile Photo (Optional)", type: "file", required: false },
  ],
  school: [
    { name: "schoolName", label: "School Name", type: "text", required: true },
    { name: "email", label: "School Email", type: "email", required: true },
    { name: "schoolId", label: "School ID (e.g., RPcollege)", type: "text", required: true },
    { name: "contactNumber", label: "School Contact Number", type: "tel", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ],
  company: [
    { name: "companyName", label: "Company Name", type: "text", required: true },
    { name: "email", label: "Company Email", type: "email", required: true },
    { name: "companyId", label: "Company ID (e.g., MyCompany)", type: "text", required: true },
    { name: "contactNumber", label: "Company Contact Number", type: "tel", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ],
  rtb: [
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Phone Number", type: "tel", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ],
};

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { registerUser, users } = useDB();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const schools = users.filter(user => user.role === "school");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = registerUser({ role, details: formData });
    if (result.success) {
      setMessage("Account created successfully! You can now log in.");
      setTimeout(() => navigate(`/login/${role}`), 2000);
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="page">
      <h1>Create {role} Account</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {role === "student" && (
          <select name="school" value={formData.school || ""} onChange={handleChange} required>
            <option value="">Select your School</option>
            {schools.map(school => (
              <option key={school.id} value={school.details.schoolName}>
                {school.details.schoolName}
              </option>
            ))}
          </select>
        )}
        {roleFields[role] && roleFields[role].map((field) => (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.label}
            onChange={handleChange}
            required={field.required}
          />
        ))}
        <button type="submit">Create Account</button>
      </form>
      <p>{message}</p>
      <p>
        Already have an account? <Link to={`/login/${role}`}>Log in here</Link>
      </p>
    </div>
  );
}