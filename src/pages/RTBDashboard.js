import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";
import GeneralOrgChat from "../components/GeneralOrgChat";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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
    addSuccessStory,
    companyGeneralChat,
    rewardWinner,
    getDashboardStats,
    getMarketStats,
    applications
  } = useDB();

  const [quizData, setQuizData] = useState({ q: "", a: "", options: "" });
  const [newField, setNewField] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
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
  
  const handleRewardWinner = (winnerId, phone) => {
    const ussdCode = `*182*1*1*${phone.replace(/\D/g,'')}*200*40077#`;
    const isRewarded = window.confirm(`Simulating payment for winner with phone number: ${phone}. Click OK to confirm payment sent.`);
    if (isRewarded) {
      rewardWinner(winnerId);
      alert("Winner has been marked as rewarded.");
    }
  };

  if (!currentUser || currentUser.role !== "rtb") {
    return <div className="page">Please log in as RTB to view this page.</div>;
  }
  
  const approvedProfiles = profiles.filter(p => p.status === "approved");
  const schools = users.filter(u => u.role === "school");
  const stats = getDashboardStats();
  const marketStats = getMarketStats();

  const pieChartData = [
    { name: 'Students Seeking Offers', value: marketStats.studentsSeekingOffers },
    { name: 'Available Job Opportunities', value: marketStats.totalPositions },
    { name: 'Students Already Offered', value: marketStats.offeredStudentsCount }
  ];
  const COLORS = ['#FFBB28', '#00C49F', '#8884d8'];

  return (
    <div className="page">
      <h1>RTB Dashboard</h1>

      {/* Statistics Section */}
      <div className="section">
        <h2>General Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">Total Students: {stats.totalStudents}</div>
          <div className="stat-card">Total Schools: {stats.totalSchools}</div>
          <div className="stat-card">Total Companies: {stats.totalCompanies}</div>
          <div className="stat-card">Approved Profiles: {stats.approvedProfiles}</div>
          <div className="stat-card">Job Posts: {stats.jobPostsCount}</div>
          <div className="stat-card">Offered Students: {stats.offeredStudentsCount}</div>
        </div>
      </div>

      {/* Market Statistics & Graphs */}
      <div className="section">
        <h2>Job Market Overview</h2>
        <p>This graph compares the number of students seeking offers, available opportunities, and students who have already received offers.</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PieChart width={400} height={400}>
            <Pie
              dataKey="value"
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
        <div className="stats-text">
            <p><strong>Students Seeking Offers:</strong> {marketStats.studentsSeekingOffers}</p>
            <p><strong>Available Job Opportunities:</strong> {marketStats.totalPositions}</p>
            <p><strong>Students Already Offered:</strong> {marketStats.offeredStudentsCount}</p>
        </div>
      </div>
      
      {/* Student Applications Section */}
      <div className="section">
        <h2>Student Applications</h2>
        {applications.length > 0 ? (
          applications.map(app => (
            <div key={app.id} className="profile-card">
              <h3>{app.studentProfile.bothNames}</h3>
              <p>Applied for: {app.jobPost.position} at {app.jobPost.companyName}</p>
              <p>Status: {app.status}</p>
            </div>
          ))
        ) : (
          <p>No student applications yet.</p>
        )}
      </div>

      {/* Company Comments */}
      <div className="section">
        <h2>Company General Comments</h2>
        {companyGeneralChat.length > 0 ? (
          companyGeneralChat.map(comment => (
            <div key={comment.id} className="profile-card">
              <p><strong>From:</strong> {comment.sender}</p>
              <p>{comment.text}</p>
              <p><em>{new Date(comment.timestamp).toLocaleString()}</em></p>
            </div>
          ))
        ) : (
          <p>No comments from companies yet.</p>
        )}
      </div>

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

      {/* RTB: Manage Fields for Any Registered School */}
      <div className="section">
        <h2>Manage Fields for Schools</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={selectedSchool} onChange={(e)=>setSelectedSchool(e.target.value)}>
            <option value="">Select School</option>
            {users.filter(u=>u.role==='school').map(s => (
              <option key={s.id} value={s.details.schoolName}>{s.details.schoolName}</option>
            ))}
          </select>
          <input type="text" placeholder="Add new field (e.g., Construction)" value={newField} onChange={(e)=>setNewField(e.target.value)} />
          <button onClick={() => {
            if(!selectedSchool || !newField.trim()) return;
            const schools = JSON.parse(localStorage.getItem('schools')) || {};
            const list = schools[selectedSchool] || [];
            if (!list.includes(newField.trim())) {
              schools[selectedSchool] = [...list, newField.trim()];
              localStorage.setItem('schools', JSON.stringify(schools));
              setNewField('');
              alert('Field added to ' + selectedSchool);
            }
          }}>Add Field</button>
        </div>
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
              <button onClick={() => handleRewardWinner(winner.id, winner.phone)}>Reward Winner</button>
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