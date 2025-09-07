import React, { createContext, useContext, useState } from 'react';

const DBContext = createContext();

const initialDB = {
  users: [],
  profiles: [],
  jobPosts: [],
  offeredStudents: [],
  successStories: [],
  quizQuestions: [],
  quizWinners: [],
  generalOrgChat: [],
  rtbAnnouncements: [],
};

const studentIdRegex = /^\d{2}RP\d{4,5}$/;
const schoolIdRegex = /^[a-zA-Z0-9]+$/;
const companyIdRegex = /^[a-zA-Z0-9]+$/;

export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
  const [db, setDB] = useState(initialDB);
  const [currentUser, setCurrentUser] = useState(null);

  const {
    users,
    profiles,
    jobPosts,
    offeredStudents,
    successStories,
    quizQuestions,
    quizWinners,
    generalOrgChat,
    rtbAnnouncements,
  } = db;

  const registerUser = ({ role, details }) => {
    // ID validation
    if (role === 'student' && !studentIdRegex.test(details.studentId)) {
      return { success: false, message: "Invalid Student ID format. Must be like '22RP03385'." };
    }
    if (role === 'school' && !schoolIdRegex.test(details.schoolId)) {
      return { success: false, message: "Invalid School ID. Must be alphanumeric." };
    }
    if (role === 'company' && !companyIdRegex.test(details.companyId)) {
      return { success: false, message: "Invalid Company ID. Must be alphanumeric." };
    }

    // Check for existing user
    const userExists = users.find(u =>
      (u.details.email === details.email) ||
      (u.details.studentId && u.details.studentId === details.studentId) ||
      (u.details.schoolId && u.details.schoolId === details.schoolId) ||
      (u.details.companyId && u.details.companyId === details.companyId)
    );

    if (userExists) {
      return { success: false, message: "User with this ID or email already exists." };
    }

    const newUser = { id: Date.now(), role, details: { ...details }, password: details.password };
    setDB(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return { success: true };
  };

  const loginUser = ({ role, identifier, password }) => {
    let identifierKey;
    if (role === 'student') {
      identifierKey = 'studentId';
    } else if (role === 'school') {
      identifierKey = 'schoolId';
    } else if (role === 'company') {
      identifierKey = 'companyId';
    } else {
      identifierKey = 'email';
    }

    const user = users.find(u =>
      u.role === role &&
      (u.details.email === identifier || u.details[identifierKey] === identifier) &&
      u.details.password === password
    );

    if (user) {
      setCurrentUser(user);
      return { success: true };
    }
    return { success: false, message: "Invalid credentials." };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const submitProfile = (profileData) => {
    const existingProfile = profiles.find(p => p.studentId === profileData.studentId);
    const newProfile = { id: Date.now(), ...profileData, status: "pending" };
    if (existingProfile) {
      setDB(prev => ({ ...prev, profiles: prev.profiles.map(p => p.id === existingProfile.id ? newProfile : p) }));
    } else {
      setDB(prev => ({ ...prev, profiles: [...prev.profiles, newProfile] }));
    }
  };

  const reviewProfile = ({ profileId, status, reason = "" }) => {
    setDB(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === profileId ? { ...p, status, declineReason: status === "declined" ? reason : undefined } : p
      ),
    }));
    return { success: true };
  };

  const createJobPost = (postData) => {
    const newPost = { id: Date.now(), ...postData, companyId: currentUser.details.companyId };
    setDB(prev => ({ ...prev, jobPosts: [...prev.jobPosts, newPost] }));
  };

  const offerStudent = ({ studentId, offerType }) => {
    const studentProfile = profiles.find(p => p.studentId === studentId);
    const company = currentUser?.details;
    if (studentProfile && company) {
      setDB(prev => ({
        ...prev,
        offeredStudents: [...prev.offeredStudents, { student: studentProfile, company, offerType }],
        profiles: prev.profiles.filter(p => p.studentId !== studentId),
      }));
      return { success: true, message: `Offer for ${studentProfile.bothNames} sent successfully!` };
    }
    return { success: false, message: "Student or company not found." };
  };

  const addSuccessStory = (storyData) => {
    const newStory = { id: Date.now(), ...storyData };
    setDB(prev => ({ ...prev, successStories: [...prev.successStories, newStory] }));
  };

  const createQuizQuestion = (questionData) => {
    const newQuestion = { id: Date.now(), ...questionData };
    setDB(prev => ({ ...prev, quizQuestions: [...prev.quizQuestions, newQuestion] }));
  };

  const addQuizWinner = (winnerData) => {
    setDB(prev => ({ ...prev, quizWinners: [...prev.quizWinners, winnerData] }));
  };
  
  const addGeneralMessage = (messageData) => {
    setDB(prev => ({ ...prev, generalOrgChat: [...prev.generalOrgChat, messageData] }));
  };
  
  const addRTBAnnouncement = (announcementData) => {
    setDB(prev => ({ ...prev, rtbAnnouncements: [...prev.rtbAnnouncements, announcementData] }));
  };

  return (
    <DBContext.Provider
      value={{
        users,
        profiles,
        jobPosts,
        offeredStudents,
        successStories,
        quizQuestions,
        quizWinners,
        generalOrgChat,
        rtbAnnouncements,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        submitProfile,
        reviewProfile,
        createJobPost,
        offerStudent,
        addSuccessStory,
        createQuizQuestion,
        addQuizWinner,
        addGeneralMessage,
        addRTBAnnouncement,
      }}
    >
      {children}
    </DBContext.Provider>
  );
};