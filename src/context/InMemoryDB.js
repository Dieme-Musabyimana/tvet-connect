import React, { createContext, useContext, useState } from "react";

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const DBContext = createContext();

// Regular expressions for ID validation
const studentIdRegex = /^\d{2}RP\d{5}$/;
const schoolIdRegex = /^RP[a-zA-Z0-9]+$/;
const companyIdRegex = /^[a-zA-Z0-9]+$/;

export function DBProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [offeredStudents, setOfferedStudents] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizWinners, setQuizWinners] = useState([]);
  const [generalOrgChat, setGeneralOrgChat] = useState([]);
  const [rtbAnnouncements, setRtbAnnouncements] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const registerUser = ({ role, details }) => {
    const existingUser = users.find(u => u.details.email === details.email);
    if (existingUser) {
      return { success: false, message: "User with this email already exists." };
    }

    // New ID validation logic
    if (role === 'student' && !studentIdRegex.test(details.studentId)) {
      return { success: false, message: "Invalid student ID format. Must be like '22RP03385'." };
    }
    if (role === 'school' && !schoolIdRegex.test(details.schoolId)) {
      return { success: false, message: "Invalid school ID format. Must start with 'RP' followed by a name (no spaces)." };
    }
    if (role === 'company' && !companyIdRegex.test(details.companyId)) {
      return { success: false, message: "Invalid company ID format. Must be a name (no spaces)." };
    }

    const newUser = { id: uuid(), role, details, password: details.password };
    setUsers([...users, newUser]);
    return { success: true };
  };

  const loginUser = ({ role, identifier, password }) => {
    const user = users.find(u => u.role === role && (u.details.email === identifier || u.details.id === identifier));
    if (user && user.password === password) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: "Invalid credentials." };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const submitProfile = (profileData) => {
    // If a profile already exists and was declined, allow re-submission
    const existingIndex = profiles.findIndex(p => p.studentId === profileData.studentId);
    if (existingIndex > -1) {
        setProfiles(profiles.map((p, index) => index === existingIndex ? { ...profileData, id: p.id, status: "pending", declineReason: null } : p));
        return { success: true, message: "Profile updated and re-submitted for review." };
    }

    setProfiles([...profiles, { ...profileData, id: uuid(), status: "pending", declineReason: null }]);
    return { success: true, message: "Profile submitted for review." };
  };

  const reviewProfile = ({ profileId, status, reason = null }) => {
    if (status === "declined" && !reason) {
      return { success: false, message: "Decline reason is required." };
    }
    setProfiles(
      profiles.map(p =>
        p.id === profileId ? { ...p, status, declineReason: reason } : p
      )
    );
    return { success: true };
  };
  
  const createJobPost = (postData) => {
    const newPost = { ...postData, id: uuid(), companyId: currentUser.details.companyId };
    setJobPosts([...jobPosts, newPost]);
  };
  
  const createQuizQuestion = (questionData) => {
    setQuizQuestions([...quizQuestions, { ...questionData, id: uuid() }]);
  };

  const offerStudent = ({ studentId, companyId, offerType }) => {
    const studentProfile = profiles.find(p => p.studentId === studentId);
    const company = users.find(u => u.details.companyId === companyId);
    
    if (studentProfile && company) {
        // 1. Add student to offered list for RTB
        setOfferedStudents([...offeredStudents, { student: studentProfile, company: company.details, offerType }]);
        
        // 2. Remove student's profile from other company dashboards
        setProfiles(profiles.filter(p => p.studentId !== studentId));
        
        return { success: true, message: `Offer for ${studentProfile.bothNames} sent successfully!` };
    }
    return { success: false, message: "Student or company not found." };
  };

  const addQuizWinner = (winnerData) => {
    setQuizWinners([...quizWinners, { ...winnerData, id: uuid() }]);
  };

  const addGeneralMessage = (messageData) => {
    setGeneralOrgChat([...generalOrgChat, { ...messageData, id: uuid() }]);
  };

  const addRTBAnnouncement = (messageData) => {
    setRtbAnnouncements([...rtbAnnouncements, { ...messageData, id: uuid() }]);
  };

  const addSuccessStory = (storyData) => {
    setSuccessStories([...successStories, { ...storyData, id: uuid() }]);
  };

  return (
    <DBContext.Provider
      value={{
        users,
        profiles,
        jobPosts,
        offeredStudents,
        quizQuestions,
        quizWinners,
        generalOrgChat,
        rtbAnnouncements,
        successStories,
        currentUser,
        registerUser,
        loginUser,
        logout,
        submitProfile,
        reviewProfile,
        createJobPost,
        offerStudent,
        createQuizQuestion,
        addQuizWinner,
        addGeneralMessage,
        addRTBAnnouncement,
        addSuccessStory,
      }}
    >
      {children}
    </DBContext.Provider>
  );
}

export function useDB() {
  return useContext(DBContext);
}