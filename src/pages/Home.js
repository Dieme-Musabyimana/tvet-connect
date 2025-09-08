import React from "react";
import { useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";
import Quiz from "../components/Quiz";
import HomeStats from "../components/HomeStats";
import { FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';
import { SiX } from 'react-icons/si';

const roles = [
  { name: "Student", path: "student" },
  { name: "School", path: "school" },
  { name: "Company", path: "company" },
  { name: "RTB", path: "rtb" }
];

const socialMediaLinks = [
  { name: "X", icon: <SiX />, url: "https://x.com/RwandaTVETBoard" },
  { name: "Twitter", icon: <FaTwitter />, url: "https://twitter.com/RwandaTVETBoard" },
  { name: "Facebook", icon: <FaFacebook />, url: "https://www.facebook.com/RwandaTVETBoard" },
  { name: "Instagram", icon: <FaInstagram />, url: "https://www.instagram.com/rwandatvetboard" }
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
      
      {/* Home Stats Section */}
      <div className="section">
        <HomeStats />
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
              <p>by {story.author}</p>
              <p>{story.text}</p>
              {story.imageUrl && <img src={story.imageUrl} alt="Success Story" style={{ maxWidth: "100%", height: "auto" }} />}
            </div>
          ))
        ) : (
          <p>No success stories available yet.</p>
        )}
      </div>

      {/* Contact and Social Media Section */}
      <div className="section">
        <h2>Connect With Us</h2>
        <div className="connect-buttons-container">
          <div className="connect-buttons">
            <a href="https://wa.me/250786862261" target="_blank" rel="noopener noreferrer">
              <button>Meet with a Mentor at RTB</button>
            </a>
            <a href="https://wa.me/250782763011" target="_blank" rel="noopener noreferrer">
              <button>Meet with Alumni Member</button>
            </a>
            <a href="https://chat.whatsapp.com/Jd1820626" target="_blank" rel="noopener noreferrer">
              <button>Join Our WhatsApp Group</button>
            </a>
          </div>
          <div className="social-media-buttons">
            {socialMediaLinks.map(platform => (
              <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer">
                <button>
                  {platform.icon} {platform.name}
                </button>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}