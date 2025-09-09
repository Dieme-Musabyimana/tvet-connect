import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

export default function CompanyDashboard() {
  const { currentUser, profiles, createJobPost, offerStudent, jobPosts, addCompanyComment, offeredStudents, sendCompanyToSchoolMessage, getCompanySchoolMessages } = useDB();
  const company = currentUser?.details;
  const approvedProfiles = profiles.filter(p => p.status === "approved");
  const myOfferedStudents = offeredStudents.filter(o => o.company.companyId === company.companyId);

  const [jobPostData, setJobPostData] = useState({
    position: "",
    type: "",
    description: "",
    requiredSkills: "",
  });

  const [offerData, setOfferData] = useState({
    offerType: "",
  });

  const [companyComment, setCompanyComment] = useState("");
  const [schoolMsg, setSchoolMsg] = useState("");

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
  
  const handleOfferSubmit = (e, studentId) => {
    e.preventDefault();
    const result = offerStudent({ studentId, offerType: offerData.offerType, companyId: company.companyId });
    alert(result.message);
    setOfferData({ offerType: "" });
  };

  const handleCompanyComment = (e) => {
    e.preventDefault();
    addCompanyComment({
      id: Date.now(),
      sender: company.companyName,
      text: companyComment,
      timestamp: new Date().toISOString()
    });
    setCompanyComment("");
    alert("Comment sent to RTB!");
  };

  if (!currentUser || currentUser.role !== "company") {
    return <div className="page">Please log in as a company to view this page.</div>;
  }

  return (
    <div className="page">
      <h1>Company Dashboard for {company.companyName}</h1>
      
      {/* List of Offered Students */}
      <div className="section">
        <h2>Our Offered Students</h2>
        {myOfferedStudents.length > 0 ? (
          myOfferedStudents.map(offer => (
            <div key={offer.student.studentId} className="profile-card">
              <h3>{offer.student.bothNames}</h3>
              <p>Offer Type: <strong>{offer.offerType}</strong></p>
              <p>Student ID: {offer.student.studentId}</p>
              <p>School: {offer.student.school}</p>
              <form onSubmit={(e) => { e.preventDefault(); const res = sendCompanyToSchoolMessage({ studentId: offer.student.studentId, text: schoolMsg }); if(res.success){ setSchoolMsg(""); alert("Message sent to school."); } }}>
                <input type="text" placeholder={`Message to ${offer.student.school}`} value={schoolMsg} onChange={(e)=>setSchoolMsg(e.target.value)} required />
                <button type="submit">Send to School</button>
              </form>
            </div>
          ))
        ) : (
          <p>You have not offered any students yet.</p>
        )}
      </div>

      {/* Company ↔ School messages list (for this company) */}
      <div className="section">
        <h2>Messages with Schools</h2>
        {getCompanySchoolMessages(currentUser.details.companyId).length > 0 ? (
          getCompanySchoolMessages(currentUser.details.companyId).map(msg => (
            <div key={msg.id} className="profile-card">
              <p><strong>School:</strong> {msg.schoolName}</p>
              <p><strong>Student:</strong> {msg.studentId}</p>
              <p><strong>Your Message:</strong> {msg.text}</p>
              {msg.schoolResponse && (
                <p><strong>School Reply:</strong> {msg.schoolResponse}</p>
              )}
              <p><em>{new Date(msg.timestamp).toLocaleString()}</em></p>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

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

      {/* Send General Comment */}
      <div className="section">
        <h2>Send General Comment to RTB</h2>
        <form onSubmit={handleCompanyComment}>
          <textarea
            placeholder="Your comment..."
            value={companyComment}
            onChange={(e) => setCompanyComment(e.target.value)}
            required
          />
          <button type="submit">Send Comment</button>
        </form>
      </div>
      
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
            <form onSubmit={(e) => handleOfferSubmit(e, p.studentId)} style={{ marginTop: '10px' }}>
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