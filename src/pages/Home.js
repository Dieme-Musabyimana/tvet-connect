import React from "react";
import { useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";
import Quiz from "../components/Quiz";

const roles = [
  { name: "Student", path: "student" },
  { name: "School", path: "school" },
  { name: "Company", path: "company" },
  { name: "RTB", path: "rtb" }
];

export default function Home() {
  const navigate = useNavigate();
  const { offeredStudents, successStories } = useDB();

  return (
    <div className="page">
      <h1>Welcome to TVET Connect</h1>
      <p>Please select your role to log in or register.</p>
      <div className="role-buttons">
        {roles.map((role) => (
          <button key={role.path} onClick={() => navigate(`/login/${role.path}`)}>
            {role.name}
          </button>
        ))}
      </div>

      {/* Quiz Section */}
      <div className="section">
        <h2>TVET Quiz for Prizes!</h2>
        <p>Answer questions about TVET and get a chance to win 200 RWF!</p>
        <Quiz />
      </div>

      {/* Offered Students Section */}
      <div className="section">
        <h2>Students with Offers</h2>
        {offeredStudents.length > 0 ? (
          offeredStudents.map((offer, index) => (
            <div key={index} className="profile-card">
              <h3>{offer.student.bothNames}</h3>
              <p>Offered a **{offer.offerType}** by **{offer.company.companyName}**</p>
            </div>
          ))
        ) : (
          <p>No students have received offers yet.</p>
        )}
      </div>

      {/* Success Stories Section */}
      <div className="section">
        <h2>Success Stories</h2>
        {successStories.length > 0 ? (
          successStories.map(story => (
            <div key={story.id} className="profile-card">
              <h3>{story.title}</h3>
              <p>{story.text}</p>
              <img src={story.imageUrl} alt="Success Story" style={{ maxWidth: "100%", height: "auto" }} />
            </div>
          ))
        ) : (
          <p>No success stories available yet.</p>
        )}
      </div>

      {/* Contact and Social Media Section */}
      <div className="section">
        <h2>Connect With Us</h2>
        <div className="connect-buttons">
          <a href="https://wa.me/250786862261" target="_blank" rel="noopener noreferrer">
            <button>Meet with Mentor or Counselor at RTB</button>
          </a>
          <a href="https://wa.me/250782763011" target="_blank" rel="noopener noreferrer">
            <button>Meet with Alumni Member</button>
          </a>
          <a href="https://chat.whatsapp.com/Jd1820626" target="_blank" rel="noopener noreferrer">
            <button>Join Our WhatsApp Organisation</button>
          </a>
        </div>
        <div className="social-media-buttons">
          <a href="https://twitter.com/tvet" target="_blank" rel="noopener noreferrer">
            <button>Follow us on X (Twitter)</button>
          </a>
          <a href="https://instagram.com/tvet" target="_blank" rel="noopener noreferrer">
            <button>Follow us on Instagram</button>
          </a>
          <a href="https://facebook.com/tvet" target="_blank" rel="noopener noreferrer">
            <button>Follow us on Facebook</button>
          </a>
        </div>
      </div>
    </div>
  );
}