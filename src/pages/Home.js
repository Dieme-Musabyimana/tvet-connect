import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDB } from "../context/InMemoryDB";
import Quiz from "../components/Quiz";
import HomeStats from "../components/HomeStats";
import { FaTwitter, FaFacebook, FaInstagram, FaUserGraduate, FaSchool, FaBuilding, FaShieldAlt } from 'react-icons/fa';
import { SiX } from 'react-icons/si';

const roles = [
  { name: "Student", path: "student", icon: <FaUserGraduate /> },
  { name: "School", path: "school", icon: <FaSchool /> },
  { name: "Company", path: "company", icon: <FaBuilding /> },
  { name: "RTB", path: "rtb", icon: <FaShieldAlt /> }
];

const socialMediaLinks = [
  { name: "X", icon: <SiX />, url: "https://x.com/RwandaTVETBoard" },
  { name: "Twitter", icon: <FaTwitter />, url: "https://twitter.com/RwandaTVETBoard" },
  { name: "Facebook", icon: <FaFacebook />, url: "https://www.facebook.com/RwandaTVETBoard" },
  { name: "Instagram", icon: <FaInstagram />, url: "https://www.instagram.com/rwandatvetboard" }
];

function CareerPathFinder({ users, offeredStudents, successStories }) {
  const [query, setQuery] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");

  // Build school->fields map from localStorage 'schools'
  const schoolsMap = useMemo(() => JSON.parse(localStorage.getItem('schools')) || {}, []);

  const allFields = useMemo(() => {
    const set = new Set();
    Object.values(schoolsMap).forEach(list => (list || []).forEach(f => set.add(f)));
    return Array.from(set).sort();
  }, [schoolsMap]);

  const matchingFields = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return allFields.filter(f => f.toLowerCase().includes(q));
  }, [query, allFields]);

  const schoolsOfferingSelected = useMemo(() => {
    if (!selectedField) return [];
    return Object.entries(schoolsMap)
      .filter(([schoolName, fields]) => (fields || []).includes(selectedField))
      .map(([schoolName]) => schoolName);
  }, [selectedField, schoolsMap]);

  const offeredFromSelectedSchool = useMemo(() => {
    if (!selectedSchool) return [];
    return offeredStudents.filter(o => o.student.school === selectedSchool && (!selectedField || (o.student.field === selectedField)));
  }, [selectedSchool, selectedField, offeredStudents]);

  const successStoriesFromSelectedSchool = useMemo(() => {
    if (!selectedSchool) return [];
    const offeredNames = new Set(offeredFromSelectedSchool.map(o => o.student.bothNames));
    return successStories.filter(story => offeredNames.has(story.author));
  }, [successStories, offeredFromSelectedSchool]);

  return (
    <div className="career-module">
      {/* Bilingual prompt and direct selection (no typing) */}
      <div className="career-bilingual">
        <p className="career-subtitle-lg">Choose your favorite career from fields offered by schools. We’ll show you schools, offered students, and success stories.</p>
        <p className="career-subtitle-kin">Hitamo umwuga ukunda mu masomo atangwa n’amashuri. Tuzakwereka amashuri, abanyeshuri bahawe amasezerano, n’inkuru z’intsinzi.</p>
      </div>

      {/* All available fields as choices */}
      <div className="career-choices">
        <h4>Available Fields</h4>
        {allFields.length > 0 ? (
          <div className="choice-list">
            {allFields.map(f => (
              <button key={f} className={`choice-btn ${selectedField===f? 'active':''}`} onClick={()=>{ setSelectedField(f); setSelectedSchool(""); }}>
                {f}
              </button>
            ))}
          </div>
        ) : (
          <p>No fields available yet. RTB and schools can add fields in their dashboards.</p>
        )}
      </div>

      {/* Step 2: Select school */}
      {selectedField && (
        <div className="school-select">
          <h4>Schools offering “{selectedField}”</h4>
          {schoolsOfferingSelected.length > 0 ? (
            <div className="school-cards">
              {schoolsOfferingSelected.map(s => (
                <div key={s} className={`school-card ${selectedSchool===s?'active':''}`} onClick={()=>setSelectedSchool(s)}>
                  <div className="school-name">{s}</div>
                  <div className="school-sub">Join these schools to make your dreams come true — explore offered students and success stories</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No schools currently offer this field.</p>
          )}
        </div>
      )}

      {/* Step 3: Results for selected school */}
      {selectedSchool && (
        <div className="school-results">
          <div className="results-header">
            <h4>Explore {selectedSchool}</h4>
            <div className="result-actions">
              <button onClick={()=>setSelectedSchool("")}>Back to schools</button>
              <button onClick={()=>{ setSelectedField(""); setQuery(""); }}>Start over</button>
            </div>
          </div>

          <div className="results-grid">
            <div className="result-block">
              <h5>Students with Offers</h5>
              {offeredFromSelectedSchool.length > 0 ? (
                offeredFromSelectedSchool.map((offer, idx) => (
                  <div key={idx} className="profile-card">
                    {offer.student.studentPhoto && (
                      <img src={offer.student.studentPhoto} alt={offer.student.bothNames} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <p><strong>{offer.student.bothNames}</strong> — {offer.offerType} at <strong>{offer.company.companyName}</strong></p>
                    <p>Phone: {offer.student.phone || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <p>No students from this school have received offers yet.</p>
              )}
            </div>

            <div className="result-block">
              <h5>Success Stories</h5>
              {successStoriesFromSelectedSchool.length > 0 ? (
                successStoriesFromSelectedSchool.map(story => (
                  <div key={story.id} className="profile-card">
                    {story.authorImage && (
                      <img src={story.authorImage} alt={story.author} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    {story.imageUrl && (
                      <img src={story.imageUrl} alt="Success" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
                    )}
                    <p><strong>{story.title}</strong> by {story.author}</p>
                    <p>{story.text}</p>
                  </div>
                ))
              ) : (
                <p>No success stories from this school yet. Be the first to inspire others!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { offeredStudents, successStories, users } = useDB();

  return (
    <div className="page">
      {/* RTB Logo/Header */}
      <div className="hero-header">
        <img
          className="rtb-logo"
          src="tvet/public/rwanda-tvet-board-rtb-466854.png"
          alt="Rwanda TVET Board Logo"
        />
        <div className="hero-text">
          <h1>Welcome to TVET Connect</h1>
          <p className="page-subtitle">Discover career paths, connect with schools and companies, and grow your TVET journey.</p>
        </div>
      </div>

      {/* Find Your Career Path Section with background image and bilingual text */}
      <div className="section career-hero">
        <div className="career-hero-overlay">
          <div className="career-hero-text">
            <h2 className="career-title">Find Your Career Path</h2>
            <h2 className="career-title-kin">Shakisha Inzira y’Umwuga Wawe</h2>
            <p className="career-subtitle-lg">What’s your dream career? Pick a field to discover matching schools, offered students, and success stories.</p>
            <p className="career-subtitle-kin">Ni uwuhe mwuga w’inzozi zawe? Hitamo isomo, urebe amashuri, abanyeshuri bahawe amasezerano, n’inkuru z’intsinzi.</p>
          </div>
          <div className="career-hero-body">
            <CareerPathFinder users={users} offeredStudents={offeredStudents} successStories={successStories} />
          </div>
        </div>
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

      {/* Role Buttons moved to bottom as requested */}

      {/* Offered Students Section */}
      <div className="section horizontal">
        <h2>Students with Offers</h2>
        <div className="grid">
          {offeredStudents.length > 0 ? (
            offeredStudents.map((offer, index) => (
              <div key={index} className="profile-card">
                {offer.student.studentPhoto && (
                  <img src={offer.student.studentPhoto} alt={offer.student.bothNames} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <h3>{offer.student.bothNames}</h3>
                <p>Offered a <strong>{offer.offerType}
                </strong> by <strong>{offer.company.companyName}</strong></p>
              </div>
            ))
          ) : (
            <p>No students have received offers yet.</p>
          )}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="section horizontal">
        <h2>Success Stories</h2>
        <div className="grid">
          {successStories.length > 0 ? (
            successStories.map(story => (
              <div key={story.id} className="profile-card">
                {story.authorImage && (
                  <img src={story.authorImage} alt={story.author} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                )}
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

      {/* Role Buttons moved to bottom as requested */}
      <div className="role-buttons">
        {roles.map((role) => (
          <button key={role.path} onClick={() => navigate(`/login/${role.path}`)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, lineHeight: 0 }}>{role.icon}</span>
              <span>{role.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}