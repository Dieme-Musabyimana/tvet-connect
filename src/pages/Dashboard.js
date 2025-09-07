import React from "react";
import { useParams } from "react-router-dom";

export default function Dashboard() {
  const { role } = useParams();

  if (role === "student")
    return <StudentDashboard />;
  if (role === "company")
    return <CompanyDashboard />;
  if (role === "school")
    return <SchoolDashboard />;
  if (role === "government")
    return <GovernmentDashboard />;
  return <div className="container"><h2>No dashboard found</h2></div>;
}

function StudentDashboard() {
  return (
    <div className="container">
      <h2>Student Dashboard</h2>
      <ul>
        <li>Create/view profile (skills, details).</li>
        <li>See internships & job posts from companies.</li>
        <li>Join companies, send feedback to your school.</li>
      </ul>
    </div>
  );
}

function CompanyDashboard() {
  return (
    <div className="container">
      <h2>Company Dashboard</h2>
      <ul>
        <li>Post jobs, internships, apprenticeships (visible to all).</li>
        <li>Comment on students (sent to their school).</li>
        <li>Post general comments (visible to all schools).</li>
        <li>All activity shows your company details.</li>
      </ul>
    </div>
  );
}

function SchoolDashboard() {
  return (
    <div className="container">
      <h2>School Dashboard</h2>
      <ul>
        <li>View & verify student profiles.</li>
        <li>See company comments about students.</li>
        <li>Join community for discussions.</li>
        <li>Track student performance & workplace feedback.</li>
      </ul>
    </div>
  );
}

function GovernmentDashboard() {
  return (
    <div className="container">
      <h2>Government Dashboard</h2>
      <ul>
        <li>View aggregated data (enrollment, placements, engagement).</li>
        <li>Monitor overall TVET system performance.</li>
      </ul>
    </div>
  );
}