import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";
import GeneralOrgChat from "../components/GeneralOrgChat";

export default function RTBDashboard() {
  const { 
    currentUser, 
    offeredStudents, 
    profiles, 
    users, 
    jobPosts, 
    quizQuestions,
    createQuizQuestion,
    quizWinners,
    addSuccessStory
  } = useDB();

  const [quizData, setQuizData] = useState({ q: "", a: "", options: "" });
  const [successStoryData, setSuccessStoryData] = useState({ title: "", text: "", imageUrl: "" });

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData({ ...quizData, [name]: value });
  };
  
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const optionsArray = quizData.options.split(",").map(opt => opt.trim());
    createQuizQuestion({ ...quizData, options: optionsArray });
    setQuizData({ q: "", a: "", options: "" });
    alert("Quiz question added!");
  };

  const handleSuccessStoryChange = (e) => {
    const { name, value } = e.target;
    setSuccessStoryData({ ...successStoryData, [name]: value });
  };
  
  const handleSuccessStorySubmit = (e) => {
    e.preventDefault();
    addSuccessStory(successStoryData);
    setSuccessStoryData({ title: "", text: "", imageUrl: "" });
    alert("Success story added!");
  };
  
  const handleRewardWinner = (phone) => {
    // This is a simulation. The actual USSD code cannot be executed from the browser.
    const ussdCode = `*182*1*1*${phone.replace(/\D/g,'')}*200*40077#`;
    alert(`Simulating payment for winner with phone number: ${phone}. USSD code: ${ussdCode}`);
  };

  if (!currentUser || currentUser.role !== "rtb") {
    return <div className="page">Please log in as RTB to view this page.</div>;
  }
  
  const approvedProfiles = profiles.filter(p => p.status === "approved");
  const schools = users.filter(u => u.role === "school");

  return (
    <div className="page">
      <h1>RTB Dashboard</h1>

      {/* Quiz Management */}
      <div className="section">
        <h2>Manage TVET Quiz</h2>
        <form onSubmit={handleQuizSubmit}>
          <input type="text" name="q" placeholder="Question" value={quizData.q} onChange={handleQuizChange} required />
          <input type="text" name="a" placeholder="Correct Answer" value={quizData.a} onChange={handleQuizChange} required />
          <input type="text" name="options" placeholder="Options (comma-separated)" value={quizData.options} onChange={handleQuizChange} required />
          <button type="submit">Add Quiz Question</button>
        </form>
        <p>Current number of questions: {quizQuestions.length}</p>
      </div>

      {/* Success Story Management */}
      <div className="section">
        <h2>Add TVET Success Story</h2>
        <form onSubmit={handleSuccessStorySubmit}>
          <input type="text" name="title" placeholder="Story Title" value={successStoryData.title} onChange={handleSuccessStoryChange} required />
          <textarea name="text" placeholder="Story Text" value={successStoryData.text} onChange={handleSuccessStoryChange} required />
          <input type="text" name="imageUrl" placeholder="Image URL" value={successStoryData.imageUrl} onChange={handleSuccessStoryChange} required />
          <button type="submit">Add Story</button>
        </form>
      </div>

      {/* General Organisation Chat & Announcements */}
      <div className="chat-section">
        <h2>General Organisation Chat & Announcements</h2>
        <GeneralOrgChat />
      </div>

      {/* Quiz Winners Section */}
      <div className="section">
        <h2>Quiz Winners (Score > 75%)</h2>
        {quizWinners.length > 0 ? (
          quizWinners.map((winner, index) => (
            <div key={index} className="profile-card">
              <h3>{winner.name}</h3>
              <p>Phone: {winner.phone}</p>
              <p>Score: {winner.finalScore}%</p>
              <button onClick={() => handleRewardWinner(winner.phone)}>Reward Winner</button>
            </div>
          ))
        ) : (
          <p>No winners yet.</p>
        )}
      </div>

      {/* Data Overview Section */}
      <div className="section">
        <h2>Data Overview</h2>
        <h3>Students with Offers</h3>
        {offeredStudents.length > 0 ? (
          offeredStudents.map((offer, index) => (
            <div key={index} className="profile-card">
              <p><strong>Name:</strong> {offer.student.bothNames}</p>
              <p><strong>Student ID:</strong> {offer.student.studentId}</p>
              <p><strong>Offer Type:</strong> {offer.offerType}</p>
              <p><strong>Offered By:</strong> {offer.company.companyName}</p>
            </div>
          ))
        ) : (
          <p>No students have been offered a position yet.</p>
        )}

        <h3>Approved Student Profiles (Not Yet Offered)</h3>
        {approvedProfiles.length > 0 ? (
          approvedProfiles.map(p => (
            <div key={p.id} className="profile-card">
              <p><strong>Name:</strong> {p.bothNames}</p>
              <p><strong>School:</strong> {p.school}</p>
              <p><strong>Skills:</strong> {p.skills}</p>
            </div>
          ))
        ) : (
          <p>No approved profiles available.</p>
        )}

        <h3>Available Schools with Students</h3>
        {schools.length > 0 ? (
          schools.map(school => (
            <div key={school.id} className="profile-card">
              <p><strong>School Name:</strong> {school.details.schoolName}</p>
              <p><strong>Approved Students:</strong> {profiles.filter(p => p.school === school.details.schoolName && p.status === 'approved').length}</p>
            </div>
          ))
        ) : (
          <p>No schools registered yet.</p>
        )}

        <h3>Available Companies with Postings</h3>
        {users.filter(u => u.role === 'company').length > 0 ? (
          users.filter(u => u.role === 'company').map(company => (
            <div key={company.id} className="profile-card">
              <p><strong>Company Name:</strong> {company.details.companyName}</p>
              <h4>Posted Opportunities:</h4>
              {jobPosts.filter(p => p.companyId === company.details.companyId).length > 0 ? (
                jobPosts.filter(p => p.companyId === company.details.companyId).map(post => (
                  <div key={post.id} className="job-post-item">
                    <p><strong>Position:</strong> {post.position}</p>
                    <p><strong>Type:</strong> {post.type}</p>
                    <p><strong>Skills:</strong> {post.requiredSkills}</p>
                  </div>
                ))
              ) : (
                <p>No opportunities posted yet.</p>
              )}
            </div>
          ))
        ) : (
          <p>No companies registered yet.</p>
        )}
      </div>
    </div>
  );
}