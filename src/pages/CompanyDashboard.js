import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

export default function CompanyDashboard() {
  const { currentUser, profiles, createJobPost, offerStudent, jobPosts } = useDB();
  const company = currentUser?.details;
  const approvedProfiles = profiles.filter(p => p.status === "approved");

  const [jobPostData, setJobPostData] = useState({
    position: "",
    type: "",
    description: "",
    requiredSkills: "",
  });

  const [offerData, setOfferData] = useState({
    studentId: "",
    offerType: "",
  });

  const handleJobPostChange = (e) => {
    const { name, value } = e.target;
    setJobPostData({ ...jobPostData, [name]: value });
  };

  const handleJobPostSubmit = (e) => {
    e.preventDefault();
    createJobPost({ ...jobPostData, companyName: company.companyName });
    setJobPostData({ position: "", type: "", description: "", requiredSkills: "" });
  };
  
  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData({ ...offerData, [name]: value });
  };
  
  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const result = offerStudent({ studentId: offerData.studentId, companyId: company.companyId, offerType: offerData.offerType });
    alert(result.message);
    setOfferData({ studentId: "", offerType: "" });
  };

  if (!currentUser || currentUser.role !== "company") {
    return <div className="page">Please log in as a company to view this page.</div>;
  }

  return (
    <div className="page">
      <h1>Company Dashboard for {company.companyName}</h1>
      
      {/* Post Job Section */}
      <h2>Post a New Opportunity</h2>
      <form onSubmit={handleJobPostSubmit}>
        <input
          type="text"
          name="position"
          placeholder="Position Title"
          value={jobPostData.position}
          onChange={handleJobPostChange}
          required
        />
        <select name="type" value={jobPostData.type} onChange={handleJobPostChange} required>
          <option value="">Select Type</option>
          <option value="Job">Job</option>
          <option value="Internship">Internship</option>
          <option value="Apprenticeship">Apprenticeship</option>
        </select>
        <textarea
          name="description"
          placeholder="Description about the position"
          value={jobPostData.description}
          onChange={handleJobPostChange}
          required
        />
        <input
          type="text"
          name="requiredSkills"
          placeholder="Required Skills (comma-separated)"
          value={jobPostData.requiredSkills}
          onChange={handleJobPostChange}
          required
        />
        <button type="submit">Post Opportunity</button>
      </form>
      
      {/* Approved Student Profiles Section */}
      <h2>Approved Student Profiles</h2>
      {approvedProfiles.length > 0 ? (
        approvedProfiles.map(p => (
          <div key={p.id} className="profile-card">
            <h3>{p.bothNames}</h3>
            <p>Student ID: {p.studentId}</p>
            <p>School: {p.school}</p>
            <p>Field of Study: {p.field}</p>
            <p>Level: {p.level}</p>
            <p>Skills: {p.skills}</p>
            <p>Target: {p.target}</p>
            <form onSubmit={handleOfferSubmit} style={{ marginTop: '10px' }}>
              <input type="hidden" name="studentId" value={p.studentId} />
              <select name="offerType" value={offerData.offerType} onChange={handleOfferChange} required>
                <option value="">Select Offer Type</option>
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
                <option value="Apprenticeship">Apprenticeship</option>
              </select>
              <button type="submit">Send Offer</button>
            </form>
          </div>
        ))
      ) : (
        <p>No student profiles have been approved yet.</p>
      )}

      {/* Your Posted Opportunities Section */}
      <h2>Your Posted Opportunities</h2>
      {jobPosts.filter(post => post.companyId === company.companyId).length > 0 ? (
        jobPosts
          .filter(post => post.companyId === company.companyId)
          .map(post => (
            <div key={post.id} className="profile-card">
              <h3>{post.position} ({post.type})</h3>
              <p>{post.description}</p>
              <p>Skills: {post.requiredSkills}</p>
            </div>
          ))
      ) : (
        <p>You have not posted any opportunities yet.</p>
      )}
    </div>
  );
}