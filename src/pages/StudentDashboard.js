import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";

const levels = [
  "Certificate",
  "Diploma",
  "Advanced Diploma",
  "Higher Diploma",
  "Post-Graduate Diploma",
];

export default function StudentDashboard() {
  const { 
    currentUser, 
    profiles, 
    submitProfile, 
    jobPosts, 
    offeredStudents, 
    addStudentFeedback, 
    addSuccessStory, 
    applyToJob 
  } = useDB();
  const navigate = useNavigate();
  const student = currentUser?.details;
  const studentProfile = profiles.find(p => p.studentId === student?.studentId);
  const offeredPosition = offeredStudents.find(o => o.student.studentId === student.studentId);
  const isOffered = !!offeredPosition;

  const [formData, setFormData] = useState({
    description: studentProfile?.description || "",
    skills: studentProfile?.skills || "",
    target: studentProfile?.target || "",
    field: studentProfile?.field || "",
    level: studentProfile?.level || "",
  });

  const [feedback, setFeedback] = useState("");
  const [storyData, setStoryData] = useState({ title: "", text: "", photo: null, file: null });

  const schools = JSON.parse(localStorage.getItem('schools')) || {};
  const schoolFields = schools[student?.school] || [];
  
  const isProfilePending = studentProfile?.status === "pending";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    addStudentFeedback({
      id: Date.now(),
      studentId: student.studentId,
      schoolName: student.school,
      feedback,
      offerDetails: offeredPosition,
      timestamp: new Date().toISOString()
    });
    setFeedback("");
    alert("Feedback sent to your school!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitProfile({
      ...student,
      ...formData,
    });
  };

  const handleStoryChange = (e) => {
    const { name, value, files } = e.target;
    setStoryData({ ...storyData, [name]: files ? files[0] : value });
  };

  const handleStorySubmit = (e) => {
    e.preventDefault();
    if (storyData.photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addSuccessStory({ ...storyData, imageUrl: reader.result });
        setStoryData({ title: "", text: "", photo: null, file: null });
        alert("Success story shared!");
      };
      reader.readAsDataURL(storyData.photo);
    } else {
      addSuccessStory(storyData);
      setStoryData({ title: "", text: "", photo: null, file: null });
      alert("Success story shared!");
    }
  };

  const handleApply = (jobPostId) => {
    if (!studentProfile || studentProfile.status !== 'approved') {
        alert("You must have an approved profile to apply.");
        return;
    }
    const result = applyToJob({ studentId: student.studentId, jobPostId });
    alert(result.message);
  };

  if (!currentUser || currentUser.role !== "student") {
    return <div className="page">Please log in as a student to view this page.</div>;
  }

  return (
    <div className="page">
      <h1>Student Dashboard</h1>

      {/* Student Profile Section */}
      <h2>My Profile</h2>
      {isOffered ? (
        <div className="profile-card">
          <p><strong>Congratulations!</strong> You have an offer from {offeredPosition.company.companyName} for a {offeredPosition.offerType}.</p>
          <p>Your profile is no longer editable.</p>
        </div>
      ) : studentProfile && studentProfile.status === "approved" ? (
        <div className="profile-card">
          <p>Status: <strong>{studentProfile.status.toUpperCase()}</strong></p>
          <p>Name: {studentProfile.bothNames}</p>
          <p>Student ID: {studentProfile.studentId}</p>
          <p>School: {studentProfile.school}</p>
          <p>Description: {studentProfile.description}</p>
          <p>Skills: {studentProfile.skills}</p>
          <p>Target: {studentProfile.target}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3>{studentProfile ? "Edit Your Pending Profile" : "Create Your Profile"}</h3>
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
            {schoolFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select name="level" value={formData.level} onChange={handleChange} required>
            <option value="">Select Level of Study</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button type="submit">
            {isProfilePending ? "Update Profile" : "Submit Profile for Approval"}
          </button>
        </form>
      )}

      {/* Student Feedback Section */}
      {isOffered && (
        <div className="section">
          <h2>Send Feedback to Your School</h2>
          <p>You received an offer from {offeredPosition.company.companyName} for a {offeredPosition.offerType}.</p>
          <form onSubmit={handleFeedbackSubmit}>
            <textarea
              placeholder="Enter your feedback about the offer for your school..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
            />
            <button type="submit">Send Feedback</button>
          </form>
        </div>
      )}

      {/* Share Success Story Section */}
      {isOffered && (
        <div className="section">
          <h2>Share Your Success Story</h2>
          <form onSubmit={handleStorySubmit}>
            <input type="text" name="title" placeholder="Story Title" value={storyData.title} onChange={handleStoryChange} required />
            <textarea name="text" placeholder="Your story..." value={storyData.text} onChange={handleStoryChange} required />
            <input type="file" name="photo" onChange={handleStoryChange} accept="image/*" />
            <input type="file" name="file" onChange={handleStoryChange} />
            <button type="submit">Share Story</button>
          </form>
        </div>
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
            <button onClick={() => handleApply(post.id)}>Apply Now</button>
          </div>
        ))
      ) : (
        <p>No opportunities have been posted yet.</p>
      )}
    </div>
  );
}