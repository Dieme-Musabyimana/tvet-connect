import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { DBProvider, useDB } from './InMemoryDB';

// Test wrapper component
const wrapper = ({ children }) => <DBProvider>{children}</DBProvider>;

describe('InMemoryDB Context', () => {
  describe('User Registration', () => {
    test('registers a student user successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123',
            bothNames: 'John Doe'
          }
        });
        
        expect(response.success).toBe(true);
      });
    });

    test('fails to register student with invalid ID format', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.registerUser({
          role: 'student',
          details: {
            studentId: 'invalid-id',
            email: 'student@test.com',
            password: 'password123'
          }
        });
        
        expect(response.success).toBe(false);
        expect(response.message).toContain('Invalid Student ID format');
      });
    });

    test('fails to register duplicate user', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      const userDetails = {
        role: 'student',
        details: {
          studentId: '22RP03385',
          email: 'student@test.com',
          password: 'password123'
        }
      };

      act(() => {
        // Register first user
        result.current.registerUser(userDetails);
        
        // Try to register duplicate
        const response = result.current.registerUser(userDetails);
        
        expect(response.success).toBe(false);
        expect(response.message).toContain('User with this ID or email already exists');
      });
    });

    test('registers school user successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.registerUser({
          role: 'school',
          details: {
            schoolId: 'SCHOOL123',
            schoolName: 'Test School',
            email: 'school@test.com',
            password: 'password123'
          }
        });
        
        expect(response.success).toBe(true);
      });
    });

    test('registers company user successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.registerUser({
          role: 'company',
          details: {
            companyId: 'COMP123',
            companyName: 'Test Company',
            email: 'company@test.com',
            password: 'password123'
          }
        });
        
        expect(response.success).toBe(true);
      });
    });
  });

  describe('User Authentication', () => {
    test('logs in student successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // First register a user
        result.current.registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        // Then try to login
        const response = result.current.loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });
        
        expect(response.success).toBe(true);
        expect(result.current.currentUser).toBeTruthy();
        expect(result.current.currentUser.role).toBe('student');
      });
    });

    test('fails login with wrong password', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // First register a user
        result.current.registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        // Try to login with wrong password
        const response = result.current.loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'wrongpassword'
        });
        
        expect(response.success).toBe(false);
        expect(response.message).toBe('Invalid credentials.');
      });
    });

    test('logs out user successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Register and login user
        result.current.registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        result.current.loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });

        // Logout
        result.current.logoutUser();
        
        expect(result.current.currentUser).toBeNull();
      });
    });
  });

  describe('Profile Management', () => {
    test('submits student profile successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });
        
        expect(response.success).toBe(true);
        expect(response.message).toContain('Profile submitted for review');
      });
    });

    test('prevents editing non-pending profiles', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Submit profile
        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });

        // Approve the profile
        const profile = result.current.profiles[0];
        result.current.reviewProfile({
          profileId: profile.id,
          status: 'approved'
        });

        // Try to edit approved profile
        const response = result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'Jane Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });
        
        expect(response.success).toBe(false);
        expect(response.message).toContain('Profile cannot be edited once approved or declined');
      });
    });

    test('reviews profile successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Submit profile
        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });

        const profile = result.current.profiles[0];
        const response = result.current.reviewProfile({
          profileId: profile.id,
          status: 'approved'
        });
        
        expect(response.success).toBe(true);
        
        const updatedProfile = result.current.profiles.find(p => p.id === profile.id);
        expect(updatedProfile.status).toBe('approved');
      });
    });

    test('declines profile with reason', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Submit profile
        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });

        const profile = result.current.profiles[0];
        result.current.reviewProfile({
          profileId: profile.id,
          status: 'declined',
          reason: 'Missing documents'
        });
        
        const updatedProfile = result.current.profiles.find(p => p.id === profile.id);
        expect(updatedProfile.status).toBe('declined');
        expect(updatedProfile.declineReason).toBe('Missing documents');
      });
    });
  });

  describe('Job Management', () => {
    test('creates job post successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Login as company first
        result.current.registerUser({
          role: 'company',
          details: {
            companyId: 'COMP123',
            companyName: 'Test Company',
            email: 'company@test.com',
            password: 'password123'
          }
        });

        result.current.loginUser({
          role: 'company',
          identifier: 'COMP123',
          password: 'password123'
        });

        result.current.createJobPost({
          title: 'Software Developer',
          description: 'Looking for a software developer',
          requirements: 'JavaScript, React'
        });
        
        expect(result.current.jobPosts).toHaveLength(1);
        expect(result.current.jobPosts[0].title).toBe('Software Developer');
        expect(result.current.jobPosts[0].companyId).toBe('COMP123');
      });
    });

    test('applies to job successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Create a profile
        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School',
          fieldOfStudy: 'Engineering'
        });

        // Create a job post
        result.current.registerUser({
          role: 'company',
          details: {
            companyId: 'COMP123',
            companyName: 'Test Company',
            email: 'company@test.com',
            password: 'password123'
          }
        });

        result.current.loginUser({
          role: 'company',
          identifier: 'COMP123',
          password: 'password123'
        });

        result.current.createJobPost({
          title: 'Software Developer',
          description: 'Looking for a software developer'
        });

        const jobPost = result.current.jobPosts[0];
        const response = result.current.applyToJob({
          studentId: '22RP03385',
          jobPostId: jobPost.id
        });
        
        expect(response.success).toBe(true);
        expect(response.message).toBe('Application submitted successfully!');
        expect(result.current.applications).toHaveLength(1);
      });
    });

    test('fails to apply to job without profile', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.applyToJob({
          studentId: '22RP03385',
          jobPostId: 999
        });
        
        expect(response.success).toBe(false);
        expect(response.message).toBe('Student profile or job post not found.');
      });
    });
  });

  describe('Statistics', () => {
    test('calculates dashboard stats correctly', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Add some test data
        result.current.registerUser({
          role: 'student',
          details: { studentId: '22RP03385', email: 'student1@test.com', password: 'pass' }
        });
        
        result.current.registerUser({
          role: 'school',
          details: { schoolId: 'SCHOOL1', email: 'school1@test.com', password: 'pass' }
        });

        result.current.registerUser({
          role: 'company',
          details: { companyId: 'COMP1', email: 'company1@test.com', password: 'pass' }
        });

        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe'
        });

        const profile = result.current.profiles[0];
        result.current.reviewProfile({
          profileId: profile.id,
          status: 'approved'
        });

        const stats = result.current.getDashboardStats();
        
        expect(stats.totalStudents).toBe(1);
        expect(stats.totalSchools).toBe(1);
        expect(stats.totalCompanies).toBe(1);
        expect(stats.approvedProfiles).toBe(1);
      });
    });

    test('calculates market stats correctly', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Add profiles and offers
        result.current.submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe'
        });

        result.current.submitProfile({
          studentId: '22RP03386',
          bothNames: 'Jane Doe'
        });

        result.current.offerStudent({
          studentId: '22RP03385',
          offerType: 'internship',
          companyId: 'COMP1'
        });

        const stats = result.current.getMarketStats();
        
        expect(stats.studentsSeekingOffers).toBe(1); // 2 profiles - 1 offered
        expect(stats.offeredStudentsCount).toBe(1);
      });
    });
  });

  describe('School Fields', () => {
    test('returns correct school fields', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      const fields = result.current.getSchoolFields('TVETSchoolA');
      expect(fields).toContain('Electrical Engineering');
      expect(fields).toContain('Automotive Mechanics');
      expect(fields).toContain('Culinary Arts');
    });

    test('returns empty array for unknown school', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      const fields = result.current.getSchoolFields('UnknownSchool');
      expect(fields).toEqual([]);
    });
  });

  describe('Success Stories', () => {
    test('adds success story with current user info', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        // Login first
        result.current.registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            bothNames: 'John Doe',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        result.current.loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });

        result.current.addSuccessStory({
          title: 'My Success Story',
          content: 'This is my success story...'
        });
        
        expect(result.current.successStories).toHaveLength(1);
        expect(result.current.successStories[0].title).toBe('My Success Story');
        expect(result.current.successStories[0].author).toBe('John Doe');
        expect(result.current.successStories[0].authorRole).toBe('student');
      });
    });
  });

  describe('Quiz Management', () => {
    test('creates quiz question successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        result.current.createQuizQuestion({
          question: 'What is TVET?',
          answer: 'Technical and Vocational Education and Training',
          options: ['Option A', 'Option B', 'Option C']
        });
        
        expect(result.current.quizQuestions).toHaveLength(1);
        expect(result.current.quizQuestions[0].question).toBe('What is TVET?');
      });
    });

    test('adds quiz winner successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        result.current.addQuizWinner({
          name: 'John Doe',
          phone: '1234567890',
          score: 85
        });
        
        expect(result.current.quizWinners).toHaveLength(1);
        expect(result.current.quizWinners[0].name).toBe('John Doe');
      });
    });

    test('rewards winner successfully', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        result.current.addQuizWinner({
          id: 1,
          name: 'John Doe',
          phone: '1234567890',
          score: 85
        });

        const response = result.current.rewardWinner(1);
        
        expect(response.success).toBe(true);
        expect(result.current.rewardedWinners).toHaveLength(1);
        expect(result.current.quizWinners).toHaveLength(0);
      });
    });

    test('fails to reward non-existent winner', () => {
      const { result } = renderHook(() => useDB(), { wrapper });
      
      act(() => {
        const response = result.current.rewardWinner(999);
        
        expect(response.success).toBe(false);
      });
    });
  });
});