import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

const levels = [
  "Certificate",
  "Diploma",
  "Advanced Diploma",
  "Higher Diploma",
  "Post-Graduate Diploma",
];
const fields = [
  "Construction",
  "Welding",
  "Automotive Mechanics",
  "Culinary Arts",
  "Hospitality",
  "IT & Networking",
];

export default function StudentDashboard() {
  const { currentUser, profiles, submitProfile, jobPosts } = useDB();
  const student = currentUser?.details;
  const studentProfile = profiles.find(p => p.studentId === student?.studentId);

  const [formData, setFormData] = useState({
    description: "",
    skills: "",
    target: "",
    field: "",
    level: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProfile({
      ...student,
      ...formData,
    });
    setFormData({ description: "", skills: "", target: "", field: "", level: "" });
  };

  if (!currentUser || currentUser.role !== "student") {
    return <div className="page">Please log in as a student to view this page.</div>;
  }

  return (
    <div className="page">
      <h1>Student Dashboard</h1>

      {/* Student Profile Section */}
      <h2>My Profile</h2>
      {studentProfile ? (
        <div className="profile-card">
          <p>Status: <strong>{studentProfile.status.toUpperCase()}</strong></p>
          {studentProfile.status === "declined" && (
            <p>Reason: {studentProfile.declineReason}</p>
          )}
          <p>Name: {studentProfile.bothNames}</p>
          <p>Student ID: {studentProfile.studentId}</p>
          <p>School: {studentProfile.school}</p>
          <p>Description: {studentProfile.description}</p>
          <p>Skills: {studentProfile.skills}</p>
          <p>Target: {studentProfile.target}</p>
          
          {studentProfile.status === "declined" && (
            <div>
              <h3>Resubmit Profile</h3>
              <form onSubmit={handleSubmit}>
                <p>Your previous profile was declined. You can create a new one.</p>
                <textarea
                  name="description"
                  placeholder="Tell us about yourself..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                <input
                  name="skills"
                  placeholder="Skills (comma-separated)"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                />
                <input
                  name="target"
                  placeholder="Your career target"
                  value={formData.target}
                  onChange={handleChange}
                  required
                />
                <select name="field" value={formData.field} onChange={handleChange} required>
                  <option value="">Select Field of Study</option>
                  {fields.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select name="level" value={formData.level} onChange={handleChange} required>
                  <option value="">Select Level of Study</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="submit">Resubmit Profile for Approval</button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3>Create Your Profile</h3>
          <p>Your profile will be sent to your school for verification.</p>
          <textarea
            name="description"
            placeholder="Tell us about yourself..."
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            name="skills"
            placeholder="Skills (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
            required
          />
          <input
            name="target"
            placeholder="Your career target"
            value={formData.target}
            onChange={handleChange}
            required
          />
          <select name="field" value={formData.field} onChange={handleChange} required>
            <option value="">Select Field of Study</option>
            {fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select name="level" value={formData.level} onChange={handleChange} required>
            <option value="">Select Level of Study</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit">Submit Profile for Approval</button>
        </form>
      )}

      {/* Job Postings Section */}
      <h2>Available Opportunities</h2>
      {jobPosts.length > 0 ? (
        jobPosts.map(post => (
          <div key={post.id} className="profile-card">
            <h3>{post.position} ({post.type})</h3>
            <p><strong>Company:</strong> {post.companyName}</p>
            <p><strong>Description:</strong> {post.description}</p>
            <p><strong>Skills Required:</strong> {post.requiredSkills}</p>
          </div>
        ))
      ) : (
        <p>No opportunities have been posted yet.</p>
      )}
    </div>
  );
}