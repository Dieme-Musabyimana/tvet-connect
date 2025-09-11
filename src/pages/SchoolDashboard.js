import React, { useState, useEffect } from "react";
import { useDB } from "../context/InMemoryDB";
import GeneralOrgChat from "../components/GeneralOrgChat";

export default function SchoolDashboard() {
  const { currentUser, profiles, reviewProfile, jobPosts, studentFeedback, addSchoolResponse, addGeneralMessage, getMessagesForSchool, addSchoolReply, getSchoolOfferedStudents } = useDB();
  const school = currentUser?.details;
  
  const [declineReason, setDeclineReason] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [schoolResponse, setSchoolResponse] = useState("");
  const [newField, setNewField] = useState("");
  const [fieldsOfStudy, setFieldsOfStudy] = useState([]);
  const [viewMore, setViewMore] = useState(null); // State to track which profile is expanded

  useEffect(() => {
    const storedFields = JSON.parse(localStorage.getItem('schools')) || {};
    setFieldsOfStudy(storedFields[school.schoolName] || []);
  }, [school.schoolName]);

  const handleAddField = () => {
    if (newField.trim() && !fieldsOfStudy.includes(newField.trim())) {
      const updatedFields = [...fieldsOfStudy, newField.trim()];
      setFieldsOfStudy(updatedFields);
      const schools = JSON.parse(localStorage.getItem('schools')) || {};
      schools[school.schoolName] = updatedFields;
      localStorage.setItem('schools', JSON.stringify(schools));
      setNewField("");
    }
  };

  const pendingProfiles = profiles.filter(p => p.status === "pending" && p.school === school.schoolName);
  const approvedProfiles = profiles.filter(p => p.status === "approved" && p.school === school.schoolName);
  const myStudentsFeedback = studentFeedback.filter(fb => fb.schoolName === school.schoolName);

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

  const handleSchoolResponse = (feedbackId) => {
    addSchoolResponse({ feedbackId, text: schoolResponse });
    setSchoolResponse("");
    alert("Response sent to student!");
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    addGeneralMessage({
        id: Date.now(),
        sender: school.schoolName,
        text: message,
        timestamp: new Date().toISOString()
    });
    e.target.message.value = "";
  };
  
  return (
    <div className="page">
      <h1>School Dashboard for {school.schoolName}</h1>

      <div className="block-grid three-cols">
        {/* Manage Fields */}
        <div className="block bg-a">
          <h2>Manage Fields of Study</h2>
          <div className="flex-row">
            <input type="text" placeholder="Add new field (e.g., Construction)" value={newField} onChange={(e) => setNewField(e.target.value)} />
            <button onClick={handleAddField}>Add Field</button>
          </div>
          <ul>
            {fieldsOfStudy.map((field, index) => <li key={index}>{field}</li>)}
          </ul>
        </div>

        {/* Pending Profiles */}
        <div className="block bg-b">
          <h2>Pending Profiles</h2>
          {pendingProfiles.length > 0 ? (
            pendingProfiles.map(p => (
              <div key={p.id} className="profile-card">
                <p>Name: {p.bothNames}</p>
                <p>Student ID: {p.studentId}</p>
                <p>Field: {p.field}</p>
                <p>Level: {p.level}</p>
                {viewMore === p.id && (
                  <div style={{ marginTop: '10px' }}>
                    <p>Description: {p.description}</p>
                    <p>Skills: {p.skills}</p>
                    <p>Target: {p.target}</p>
                  </div>
                )}
                <button onClick={() => setViewMore(viewMore === p.id ? null : p.id)}>
                  {viewMore === p.id ? "View Less" : "View More"}
                </button>
                <button onClick={() => reviewProfile({profileId: p.id, status: 'approved'})}>Approve</button>
                <button onClick={() => setSelectedProfile(p)}>Decline</button>
                {selectedProfile?.id === p.id && (
                  <div style={{ marginTop: '10px' }}>
                    <input type="text" placeholder="Reason for declining" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} required />
                    <button onClick={() => handleReview(p.id, "declined")}>Submit Decline</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No new profiles to review.</p>
          )}
        </div>

        {/* Student Feedback */}
        <div className="block bg-c">
          <h2>Student Feedback</h2>
          {myStudentsFeedback.length > 0 ? (
            myStudentsFeedback.map(fb => (
              <div key={fb.id} className="profile-card">
                <p><strong>Student:</strong> {fb.studentId}</p>
                <p><strong>Feedback:</strong> {fb.feedback}</p>
                {fb.schoolResponse ? (
                  <p><strong>Your Response:</strong> {fb.schoolResponse}</p>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSchoolResponse(fb.id); }}>
                    <input type="text" placeholder="Respond to student..." value={schoolResponse} onChange={(e) => setSchoolResponse(e.target.value)} required />
                    <button type="submit">Send Response</button>
                  </form>
                )}
              </div>
            ))
          ) : (
            <p>No new feedback from your students.</p>
          )}
        </div>

        {/* Company Messages */}
        <div className="block bg-d">
          <h2>Company Messages</h2>
          {getMessagesForSchool(school.schoolName).length > 0 ? (
            getMessagesForSchool(school.schoolName).map(msg => (
              <div key={msg.id} className="profile-card">
                <p><strong>From Company:</strong> {msg.companyName}</p>
                <p><strong>Student:</strong> {msg.studentId}</p>
                <p>{msg.text}</p>
                {msg.schoolResponse ? (
                  <p><strong>Your Response:</strong> {msg.schoolResponse}</p>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); addSchoolReply({ messageId: msg.id, text: schoolResponse }); setSchoolResponse(""); }}>
                    <input type="text" placeholder="Reply to company..." value={schoolResponse} onChange={(e)=>setSchoolResponse(e.target.value)} required />
                    <button type="submit">Reply</button>
                  </form>
                )}
                <p><em>{new Date(msg.timestamp).toLocaleString()}</em></p>
              </div>
            ))
          ) : (
            <p>No direct messages from companies yet.</p>
          )}
        </div>

        {/* Offered Students */}
        <div className="block bg-e">
          <h2>Our Offered Students</h2>
          {getSchoolOfferedStudents ? (
            getSchoolOfferedStudents(school.schoolName).length > 0 ? (
              getSchoolOfferedStudents(school.schoolName).map((o, idx) => (
                <div key={idx} className="profile-card">
                  <h3>{o.student.bothNames}</h3>
                  <p><strong>Student ID:</strong> {o.student.studentId}</p>
                  <p><strong>Offer Type:</strong> {o.offerType}</p>
                  <p><strong>Offered By:</strong> {o.company.companyName}</p>
                </div>
              ))
            ) : (
              <p>No offered students yet.</p>
            )
          ) : null}
        </div>

        {/* Approved Students */}
        <div className="block bg-f">
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
        </div>

        {/* General Organisation Chat */}
        <div className="block bg-a">
          <h2>General Organisation Chat</h2>
          <GeneralOrgChat />
        </div>

        {/* Available Opportunities */}
        <div className="block bg-b">
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
      </div>
    </div>
  );
}