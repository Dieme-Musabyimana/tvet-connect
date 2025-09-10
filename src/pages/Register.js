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
    { name: "category", label: "School Category", type: "select", required: true, options: ["RP College", "TSS", "VTC"] },
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
  const { registerUser, users, getSchoolFields } = useDB();
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");

  const schools = users.filter(user => user.role === "school");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Store preview as base64 so it persists and can be displayed later
          setFormData({ ...formData, photo: file, photoData: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For school registration, persist category for later student filtering
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
          <>
            {/* Select school category first */}
            <select name="category" value={formData.category || ""} onChange={handleChange} required>
              <option value="">Select your School Category</option>
              <option value="RP College">RP College</option>
              <option value="TSS">TSS</option>
              <option value="VTC">VTC</option>
            </select>
            {/* Then select a school from registered schools that match category */}
            <select name="school" value={formData.school || ""} onChange={handleChange} required>
              <option value="">Select your School</option>
              {schools
                .filter(s => (formData.category ? (s.details.category === formData.category) : true))
                .map(school => (
                  <option key={school.id} value={school.details.schoolName}>
                    {school.details.schoolName}
                  </option>
                ))}
            </select>
          </>
        )}

        {roleFields[role] && roleFields[role].map((field) => (
          field.type === 'select' ? (
            <select
              key={field.name}
              name={field.name}
              onChange={handleChange}
              required={field.required}
              value={formData[field.name] || ''}
            >
              <option value="">{field.label}</option>
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              key={field.name}
              type={field.type}
              name={field.name}
              placeholder={field.label}
              onChange={handleChange}
              required={field.required}
            />
          )
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