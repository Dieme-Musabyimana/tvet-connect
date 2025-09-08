import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDB } from '../context/InMemoryDB';

export default function Navbar() {
  const { currentUser, logoutUser } = useDB();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/'); // Redirect to the home page after logging out
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span style={{color: 'white'}}>TVE</span>
        <span style={{color: '#00cc99'}}>T Connect</span>
      </Link>
      <div className="nav-links">
        {currentUser ? (
          <>
            <Link to="/profile">{currentUser.role} Dashboard</Link>
            <button onClick={handleLogout} className="nav-button">Logout</button>
          </>
        ) : (
          <div className="nav-login-links">
            <Link to="/">Home</Link>
            <Link to="/login/student" className="nav-button">Student Login</Link>
            <Link to="/login/school" className="nav-button">School Login</Link>
            <Link to="/login/company" className="nav-button">Company Login</Link>
            <Link to="/login/rtb" className="nav-button">RTB Login</Link>
          </div>
        )}
      </div>
    </nav>
  );
}