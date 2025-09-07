import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";
import GeneralOrgChat from "../components/GeneralOrgChat";

export default function SchoolDashboard() {
  const { currentUser, profiles, reviewProfile, jobPosts } = useDB();
  const school = currentUser?.details;
  
  const [declineReason, setDeclineReason] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);

  const pendingProfiles = profiles.filter(p => p.status === "pending" && p.school === school.schoolName);
  const approvedProfiles = profiles.filter(p => p.status === "approved" && p.school === school.schoolName);

  const handleReview = (profileId, status) => {
    if (status === "declined" && !declineReason) {
      alert("A reason for declining the profile is required.");
      return;
    }
    const result = reviewProfile({ profileId, status, reason: declineReason });
    if(result.success) {
      setSelectedProfile(null);
      setDeclineReason("");
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="page">
      <h1>School Dashboard for {school.schoolName}</h1>
      
      {/* Profile Review Section */}
      <h2>Pending Profiles</h2>
      {pendingProfiles.length > 0 ? (
        pendingProfiles.map(p => (
          <div key={p.id} className="profile-card">
            <p>Name: {p.bothNames}</p>
            <p>Student ID: {p.studentId}</p>
            <p>Field: {p.field}</p>
            <p>Level: {p.level}</p>
            <button onClick={() => reviewProfile({profileId: p.id, status: 'approved'})}>Approve</button>
            <button onClick={() => setSelectedProfile(p)}>Decline</button>
            {selectedProfile?.id === p.id && (
              <div style={{ marginTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Reason for declining"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  required
                />
                <button onClick={() => handleReview(p.id, "declined")}>Submit Decline</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No new profiles to review.</p>
      )}

      {/* Approved Students Section */}
      <h2>Approved Students from Our School</h2>
      {approvedProfiles.length > 0 ? (
        approvedProfiles.map(p => (
          <div key={p.id} className="profile-card">
            <h3>{p.bothNames}</h3>
            <p>Student ID: {p.studentId}</p>
            <p>Field: {p.field}</p>
            <p>Level: {p.level}</p>
          </div>
        ))
      ) : (
        <p>No students from your school have been approved yet.</p>
      )}

      {/* General Org Chat Section */}
      <div className="chat-section">
        <h2>General Organisation Chat</h2>
        <GeneralOrgChat />
      </div>

      {/* Available Opportunities Section */}
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