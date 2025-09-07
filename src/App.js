import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { DBProvider, useDB } from "./context/InMemoryDB";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import RTBDashboard from "./pages/RTBDashboard";

function MainApp() {
  const { currentUser, logout } = useDB();

  return (
    <div className="container">
      <nav>
        <Link to="/">TVET Connect</Link>
        {currentUser ? (
          <>
            <Link to={`/dashboard/${currentUser.role}`}>Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login/student">Login</Link>
            <Link to="/register/student">Register</Link>
          </>
        )}
      </nav>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register/:role" element={<Register />} />
          <Route path="/login/:role" element={<Login />} />
          
          <Route path="/dashboard/student" element={
              currentUser && currentUser.role === "student" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login/student" />
              )
            }
          />
          <Route path="/dashboard/school" element={
              currentUser && currentUser.role === "school" ? (
                <SchoolDashboard />
              ) : (
                <Navigate to="/login/school" />
              )
            }
          />
          <Route path="/dashboard/company" element={
              currentUser && currentUser.role === "company" ? (
                <CompanyDashboard />
              ) : (
                <Navigate to="/login/company" />
              )
            }
          />
          <Route path="/dashboard/rtb" element={
              currentUser && currentUser.role === "rtb" ? (
                <RTBDashboard />
              ) : (
                <Navigate to="/login/rtb" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DBProvider>
      <MainApp />
    </DBProvider>
  );
}