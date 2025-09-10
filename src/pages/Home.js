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
  const { schoolFields, sendMessageToStudent, getMessagesForStudent } = useDB();
  const [query, setQuery] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [activeChat, setActiveChat] = useState(null); // studentId for chat box open
  const [chatText, setChatText] = useState("");

  // Build school->fields map from DB (fallback to localStorage 'schools' if present)
  const schoolsMap = useMemo(() => {
    const ls = (() => { try { return JSON.parse(localStorage.getItem('schools')) || {}; } catch { return {}; } })();
    return Object.keys(schoolFields || {}).length ? schoolFields : ls;
  }, [schoolFields]);

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

  const fieldsToShow = query.trim() ? matchingFields : allFields;

  const schoolsOfferingSelected = useMemo(() => {
    if (!selectedField) return [];
    return Object.entries(schoolsMap)
      .filter(([schoolName, fields]) => (fields || []).includes(selectedField))
      .map(([schoolName]) => schoolName);
  }, [selectedField, schoolsMap]);

  const schoolContacts = useMemo(() => {
    const map = {};
    users.filter(u => u.role === 'school').forEach(s => { map[s.details.schoolName] = s.details.contactNumber || 'N/A'; });
    return map;
  }, [users]);

  const offeredFromSelectedSchool = useMemo(() => {
    if (!selectedSchool) return [];
    return offeredStudents.filter(o => o.student.school === selectedSchool && (!selectedField || (o.student.field === selectedField)));
  }, [selectedSchool, selectedField, offeredStudents]);

  const successStoriesFromSelectedSchool = useMemo(() => {
    if (!selectedSchool) return [];
    const offeredNames = new Set(offeredFromSelectedSchool.map(o => o.student.bothNames));
    return successStories.filter(story => offeredNames.has(story.author));
  }, [successStories, offeredFromSelectedSchool]);

  const handleSendChat = (studentId) => {
    if (!chatText.trim()) return;
    sendMessageToStudent({ studentId, text: chatText.trim(), from: 'public' });
    setChatText("");
  };

  return (
    <div className="career-module">
      {/* Bilingual prompt and direct selection */}
      <div className="career-bilingual">
        <p className="career-subtitle-lg">Choose your favorite career from fields offered by schools. We’ll show you schools, offered students, and success stories.</p>
        <p className="career-subtitle-kin">Hitamo umwuga ukunda mu masomo atangwa n’amashuri. Tuzakwereka amashuri, abanyeshuri bahawe amasezerano, n’inkuru z’intsinzi.</p>
      </div>

      {/* Search + manual selection */}
      <div className="career-choices">
        <h4>Available Fields</h4>
        <input
          type="text"
          placeholder="Search dream career... (e.g., Construction, IT)"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        {fieldsToShow.length > 0 ? (
          <div className="choice-list">
            {fieldsToShow.map(f => (
              <button key={f} className={`choice-btn ${selectedField===f? 'active':''}`} onClick={()=>{ setSelectedField(f); setSelectedSchool(""); }}>
                {f}
              </button>
            ))}
          </div>
        ) : (
          <p>No matching fields.</p>
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
                  <div className="school-sub">Contact: {schoolContacts[s] || 'N/A'}</div>
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
                offeredFromSelectedSchool.map((offer, idx) => {
                  const messages = getMessagesForStudent(offer.student.studentId);
                  return (
                    <div key={idx} className="profile-card">
                      {offer.student.studentPhoto && (
                        <img src={offer.student.studentPhoto} alt={offer.student.bothNames} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                      )}
                      <p><strong>{offer.student.bothNames}</strong> — {offer.offerType} at <strong>{offer.company.companyName}</strong></p>
                      <p>Phone: {offer.student.phone || 'N/A'}</p>
                      <button onClick={()=> setActiveChat(activeChat===offer.student.studentId? null : offer.student.studentId)}>
                        {activeChat===offer.student.studentId ? 'Close Chat' : 'Chat'}
                      </button>
                      {activeChat===offer.student.studentId && (
                        <div className="chat-container" style={{height: 240}}>
                          <div className="chat-display">
                            {messages.map(m => (
                              <div key={m.id} className="chat-message"><strong>{m.from}:</strong> {m.text}</div>
                            ))}
                          </div>
                          <form onSubmit={(e)=>{ e.preventDefault(); handleSendChat(offer.student.studentId); }} className="chat-form">
                            <input type="text" placeholder="Type a message..." value={chatText} onChange={(e)=>setChatText(e.target.value)} />
                            <button type="submit">Send</button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })
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
  const [expanded, setExpanded] = useState(""); // which block is expanded

  const expand = (id) => setExpanded(id);
  const close = () => setExpanded("");
  const isExpanded = (id) => expanded === id;

  return (
    <div className="page">
      {/* RTB Logo/Header - logo first */}
      <div className="hero-header">
        <img
          className="rtb-logo"
          src="/rwanda-tvet-board-rtb-466854.png"
          alt="Rwanda TVET Board Logo"
        />
        <div className="hero-text">
          <h1>Welcome to TVET Connect</h1>
          <p className="page-subtitle">Discover career paths, connect with schools and companies, and grow your TVET journey.</p>
        </div>
      </div>

      {/* Blocks Grid (2 rows x 3 columns) */}
      <div className={`block-grid ${expanded ? 'expanded' : ''}`}>
        {/* Row 1 */}
        <div className={`block block-welcome ${isExpanded('welcome') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>Welcome to TVET Connect</h2>
            {!isExpanded('welcome') && <button className="block-expand" onClick={() => expand('welcome')}>Expand</button>}
            {isExpanded('welcome') && <button className="block-close" onClick={close}>Close</button>}
          </div>
          {/* Find Your Career Path inside the welcome block */}
          <div className="career-hero-overlay">
            <div className="career-hero-text">
              <h3 className="career-title">Find Your Career Path</h3>
              <h3 className="career-title-kin">Shakisha Inzira y’Umwuga Wawe</h3>
              <p className="career-subtitle-lg">What’s your dream career? Pick a field to discover matching schools, offered students, and success stories.</p>
              <p className="career-subtitle-kin">Ni uwuhe mwuga w’inzozi zawe? Hitamo isomo, urebe amashuri, abanyeshuri bahawe amasezerano, n’inkuru z’intsinzi.</p>
            </div>
            <div className="career-hero-body">
              <CareerPathFinder users={users} offeredStudents={offeredStudents} successStories={successStories} />
            </div>
          </div>
        </div>

        <div className={`block block-market ${isExpanded('market') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>TVET Job Market Insights</h2>
            {!isExpanded('market') && <button className="block-expand" onClick={() => expand('market')}>Expand</button>}
            {isExpanded('market') && <button className="block-close" onClick={close}>Close</button>}
          </div>
          <HomeStats />
        </div>

        <div className={`block block-gallery ${isExpanded('gallery') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>Rwanda TVET in Pictures</h2>
            {!isExpanded('gallery') && <button className="block-expand" onClick={() => expand('gallery')}>Expand</button>}
            {isExpanded('gallery') && <button className="block-close" onClick={close}>Close</button>}
          </div>
          <div className="image-grid">
            <div className="image-card"><div className="image-overlay">Hands-on technical training</div></div>
            <div className="image-card"><div className="image-overlay">Workshop and practicals</div></div>
            <div className="image-card"><div className="image-overlay">Skills for the future</div></div>
            <div className="image-card"><div className="image-overlay">STEM and innovation</div></div>
          </div>
        </div>

        {/* Row 2 */}
        <div className={`block block-quiz ${isExpanded('quiz') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>TVET Quiz for Prizes!</h2>
            {!isExpanded('quiz') && <button className="block-expand" onClick={() => expand('quiz')}>Expand</button>}
            {isExpanded('quiz') && <button className="block-close" onClick={close}>Close</button>}
          </div>
          <p>Answer questions about TVET to know more about it  </p>
          <Quiz />
        </div>

        <div className={`block block-offers ${isExpanded('offers') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>Students with Offers</h2>
            {!isExpanded('offers') && <button className="block-expand" onClick={() => expand('offers')}>Expand</button>}
            {isExpanded('offers') && <button className="block-close" onClick={close}>Close</button>}
          </div>
          <div className="grid">
            {offeredStudents.length > 0 ? (
              offeredStudents.map((offer, index) => (
                <div key={index} className="profile-card">
                  {offer.student.studentPhoto && (
                    <img src={offer.student.studentPhoto} alt={offer.student.bothNames} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <h3>{offer.student.bothNames}</h3>
                  <p>Offered a <strong>{offer.offerType}</strong> by <strong>{offer.company.companyName}</strong></p>
                </div>
              ))
            ) : (
              <p>No students have received offers yet.</p>
            )}
          </div>
        </div>

        <div className={`block block-stories ${isExpanded('stories') ? 'expanded' : ''}`}>
          <div className="block-header">
            <h2>Success Stories</h2>
            {!isExpanded('stories') && <button className="block-expand" onClick={() => expand('stories')}>Expand</button>}
            {isExpanded('stories') && <button className="block-close" onClick={close}>Close</button>}
          </div>
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
      </div>

      {/* Role Buttons moved to bottom */}
      <div className="role-buttons">
        {roles.map((role) => (
          <button key={role.path} onClick={() => navigate(`/login/${role.path}`)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, lineHeight: 0 }}>{role.icon}</span>
              <span>{role.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}