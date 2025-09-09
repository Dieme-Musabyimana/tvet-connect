import React, { createContext, useContext, useState, useEffect } from 'react';

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
  studentFeedback: [],
  companyGeneralChat: [],
  rewardedWinners: [],
  applications: [],
  schoolFields: {
    'TVETSchoolA': ['Electrical Engineering', 'Automotive Mechanics', 'Culinary Arts'],
    'TVETSchoolB': ['Information Technology', 'Plumbing', 'Construction'],
    'TVETSchoolC': ['Hospitality Management', 'Welding', 'Fashion Design'],
  }
};

const studentIdRegex = /^\d{2}RP\d{4,5}$/;
const schoolIdRegex = /^[a-zA-Z0-9]+$/;
const companyIdRegex = /^[a-zA-Z0-9]+$/;

export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
  // Initialize from localStorage if available
  const [db, setDB] = useState(() => {
    try {
      const stored = localStorage.getItem('tvet_db');
      return stored ? JSON.parse(stored) : initialDB;
    } catch (e) {
      return initialDB;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('tvet_current_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('tvet_db', JSON.stringify(db));
    } catch {}
  }, [db]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('tvet_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('tvet_current_user');
      }
    } catch {}
  }, [currentUser]);

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
    studentFeedback,
    companyGeneralChat,
    rewardedWinners,
    applications,
    schoolFields
  } = db;

  const registerUser = ({ role, details, file }) => {
    if (role === 'student' && !studentIdRegex.test(details.studentId)) {
      return { success: false, message: "Invalid Student ID format. Must be like '22RP03385'." };
    }
    if (role === 'school' && !schoolIdRegex.test(details.schoolId)) {
      return { success: false, message: "Invalid School ID. Must be alphanumeric." };
    }
    if (role === 'company' && !companyIdRegex.test(details.companyId)) {
      return { success: false, message: "Invalid Company ID. Must be alphanumeric." };
    }

    const userExists = users.find(u =>
      (u.details.email === details.email) ||
      (u.details.studentId && u.details.studentId === details.studentId) ||
      (u.details.schoolId && u.details.schoolId === details.schoolId) ||
      (u.details.companyId && u.details.companyId === details.companyId)
    );

    if (userExists) {
      return { success: false, message: "User with this ID or email already exists." };
    }

    const newUser = { id: Date.now(), role, details: { ...details }, password: details.password, file };
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
    
    // Only allow editing if the profile is pending
    if (existingProfile && existingProfile.status !== 'pending') {
      return { success: false, message: "Profile cannot be edited once approved or declined." };
    }

    const newProfile = { id: Date.now(), ...profileData, status: "pending", timestamp: Date.now() };
    if (existingProfile) {
      setDB(prev => ({ ...prev, profiles: prev.profiles.map(p => p.id === existingProfile.id ? newProfile : p) }));
    } else {
      setDB(prev => ({ ...prev, profiles: [...prev.profiles, newProfile] }));
    }
    return { success: true, message: "Profile submitted for review." };
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
    const newPost = { id: Date.now(), ...postData, companyId: currentUser.details.companyId, companyName: currentUser.details.companyName };
    setDB(prev => ({ ...prev, jobPosts: [...prev.jobPosts, newPost] }));
  };
  
  const applyToJob = ({ studentId, jobPostId }) => {
    const studentProfile = profiles.find(p => p.studentId === studentId);
    const jobPost = jobPosts.find(j => j.id === jobPostId);
    if (!studentProfile || !jobPost) {
      return { success: false, message: "Student profile or job post not found." };
    }
    const newApplication = { 
      id: Date.now(), 
      studentId, 
      jobPostId, 
      status: 'pending' 
    };
    setDB(prev => ({ ...prev, applications: [...prev.applications, newApplication] }));
    return { success: true, message: "Application submitted successfully!" };
  };

  const offerStudent = ({ studentId, offerType, companyId }) => {
    const studentProfile = profiles.find(p => p.studentId === studentId);
    const company = users.find(u => u.details.companyId === companyId)?.details;
    if (studentProfile && company) {
      setDB(prev => ({
        ...prev,
        offeredStudents: [...prev.offeredStudents, { student: studentProfile, company, offerType }],
      }));
      return { success: true, message: `Offer for ${studentProfile.bothNames} sent successfully!` };
    }
    return { success: false, message: "Student or company not found." };
  };
  
  const addSuccessStory = (storyData) => {
    const newStory = { 
      id: Date.now(), 
      ...storyData, 
      author: currentUser.details.bothNames || currentUser.details.email, 
      authorRole: currentUser.role,
      timestamp: Date.now()
    };
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
    // Check if the sender is a school and replace email with school name
    if (currentUser.role === 'school') {
      messageData.sender = currentUser.details.schoolName;
    }
    setDB(prev => ({ ...prev, generalOrgChat: [...prev.generalOrgChat, { ...messageData, timestamp: Date.now() }] }));
  };

  const addCompanyComment = (commentData) => {
    setDB(prev => ({ ...prev, companyGeneralChat: [...prev.companyGeneralChat, { ...commentData, timestamp: Date.now() }] }));
  };
  
  const addRTBAnnouncement = (announcementData) => {
    setDB(prev => ({ ...prev, rtbAnnouncements: [...prev.rtbAnnouncements, announcementData] }));
  };

  const addStudentFeedback = (feedbackData) => {
    setDB(prev => ({ ...prev, studentFeedback: [...prev.studentFeedback, { ...feedbackData, timestamp: Date.now() }] }));
  };

  const addSchoolResponse = (responseData) => {
    setDB(prev => ({ ...prev, studentFeedback: prev.studentFeedback.map(fb => fb.id === responseData.feedbackId ? { ...fb, schoolResponse: responseData.text, schoolResponseTimestamp: Date.now() } : fb) }));
  };

  const rewardWinner = (winnerId) => {
    const winner = quizWinners.find(w => w.id === winnerId);
    if(winner) {
      setDB(prev => ({
        ...prev,
        rewardedWinners: [...prev.rewardedWinners, winner],
        quizWinners: prev.quizWinners.filter(w => w.id !== winnerId)
      }));
      return { success: true };
    }
    return { success: false };
  };

  const getDashboardStats = () => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalSchools = users.filter(u => u.role === 'school').length;
    const totalCompanies = users.filter(u => u.role === 'company').length;
    const approvedProfiles = profiles.filter(p => p.status === 'approved').length;
    const jobPostsCount = jobPosts.length;
    const offeredStudentsCount = offeredStudents.length;

    return {
      totalStudents,
      totalSchools,
      totalCompanies,
      approvedProfiles,
      jobPostsCount,
      offeredStudentsCount,
    };
  };

  const getMarketStats = () => {
    const studentsWithProfiles = profiles.length;
    const totalPositions = jobPosts.length;
    const offeredStudentsCount = offeredStudents.length;
    const studentsSeekingOffers = studentsWithProfiles - offeredStudentsCount;

    return {
      studentsSeekingOffers,
      totalPositions,
      offeredStudentsCount,
    };
  };
  
  const getSchoolFields = (schoolName) => {
    return schoolFields[schoolName] || [];
  };

  const getSchoolOfferedStudents = (schoolName) => {
    return offeredStudents.filter(o => o.student.school === schoolName);
  };
  
  const getCompanyOfferedStudents = (companyId) => {
    return offeredStudents.filter(o => o.company.companyId === companyId);
  };

  const getStudentApplications = (studentId) => {
    return applications.filter(a => a.studentId === studentId);
  };
  
  // NEW: Function to get applications for a specific company
  const getCompanyApplications = (companyId) => {
    const companyJobPostIds = jobPosts
      .filter(post => post.companyId === companyId)
      .map(post => post.id);

    return applications
      .filter(app => companyJobPostIds.includes(app.jobPostId))
      .map(app => {
        const studentProfile = profiles.find(p => p.studentId === app.studentId);
        const jobPost = jobPosts.find(p => p.id === app.jobPostId);
        return {
          ...app,
          studentProfile,
          jobPost
        };
      });
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
        studentFeedback,
        companyGeneralChat,
        rewardedWinners,
        applications,
        currentUser,
        registerUser,
        loginUser,
        logoutUser,
        submitProfile,
        reviewProfile,
        createJobPost,
        applyToJob,
        offerStudent,
        addSuccessStory,
        createQuizQuestion,
        addQuizWinner,
        addGeneralMessage,
        addCompanyComment,
        addRTBAnnouncement,
        addStudentFeedback,
        addSchoolResponse,
        rewardWinner,
        getDashboardStats,
        getMarketStats,
        getSchoolFields,
        getSchoolOfferedStudents,
        getCompanyOfferedStudents,
        getStudentApplications,
        getCompanyApplications, // NEW: Added to context value
      }}
    >
      {children}
    </DBContext.Provider>
  );
};