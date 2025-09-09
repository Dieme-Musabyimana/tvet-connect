import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import { DBProvider } from '../context/InMemoryDB';

const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ role: 'student' })
}));

const renderRegisterWithProviders = (role = 'student') => {
  // Mock useParams to return the specified role
  jest.doMock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ role })
  }));

  return render(
    <MemoryRouter>
      <DBProvider>
        <Register />
      </DBProvider>
    </MemoryRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Student Registration', () => {
    test('renders student registration form with all required fields', () => {
      renderRegisterWithProviders('student');
      
      expect(screen.getByText('Create student Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Both Names')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Student ID (e.g., 22RP03385)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Profile Photo (Optional)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    test('shows school selection dropdown for student registration', () => {
      renderRegisterWithProviders('student');
      
      expect(screen.getByText('Select your School')).toBeInTheDocument();
    });

    test('renders login link with correct role', () => {
      renderRegisterWithProviders('student');
      
      const loginLink = screen.getByText('Log in here');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login/student');
    });

    test('updates form fields on input change', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      const nameInput = screen.getByPlaceholderText('Both Names');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const studentIdInput = screen.getByPlaceholderText('Student ID (e.g., 22RP03385)');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@test.com');
      await user.type(studentIdInput, '22RP03385');

      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@test.com');
      expect(studentIdInput.value).toBe('22RP03385');
    });

    test('registers student successfully with valid data', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      // Fill out the form
      await user.type(screen.getByPlaceholderText('Both Names'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email Address'), 'john@test.com');
      await user.type(screen.getByPlaceholderText('Student ID (e.g., 22RP03385)'), '22RP03385');
      await user.type(screen.getByPlaceholderText('Phone Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
      });

      // Should navigate to login page after 2 seconds
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login/student');
      }, { timeout: 3000 });
    });

    test('shows error message for invalid student ID', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      // Fill out form with invalid student ID
      await user.type(screen.getByPlaceholderText('Both Names'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email Address'), 'john@test.com');
      await user.type(screen.getByPlaceholderText('Student ID (e.g., 22RP03385)'), 'invalid-id');
      await user.type(screen.getByPlaceholderText('Phone Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid Student ID format/)).toBeInTheDocument();
      });
    });

    test('handles file upload for profile photo', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      const fileInput = screen.getByPlaceholderText('Profile Photo (Optional)');
      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });

      await user.upload(fileInput, file);

      expect(fileInput.files[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    });
  });

  describe('School Registration', () => {
    test('renders school registration form with correct fields', () => {
      renderRegisterWithProviders('school');
      
      expect(screen.getByText('Create school Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('School Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('School Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('School ID (e.g., RPcollege)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('School Contact Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    test('does not show school selection for school registration', () => {
      renderRegisterWithProviders('school');
      
      expect(screen.queryByText('Select your School')).not.toBeInTheDocument();
    });

    test('registers school successfully with valid data', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('school');
      
      await user.type(screen.getByPlaceholderText('School Name'), 'Test School');
      await user.type(screen.getByPlaceholderText('School Email'), 'school@test.com');
      await user.type(screen.getByPlaceholderText('School ID (e.g., RPcollege)'), 'SCHOOL123');
      await user.type(screen.getByPlaceholderText('School Contact Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
      });
    });
  });

  describe('Company Registration', () => {
    test('renders company registration form with correct fields', () => {
      renderRegisterWithProviders('company');
      
      expect(screen.getByText('Create company Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Company Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Company Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Company ID (e.g., MyCompany)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Company Contact Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    test('registers company successfully with valid data', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('company');
      
      await user.type(screen.getByPlaceholderText('Company Name'), 'Test Company');
      await user.type(screen.getByPlaceholderText('Company Email'), 'company@test.com');
      await user.type(screen.getByPlaceholderText('Company ID (e.g., MyCompany)'), 'COMP123');
      await user.type(screen.getByPlaceholderText('Company Contact Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
      });
    });
  });

  describe('RTB Registration', () => {
    test('renders RTB registration form with correct fields', () => {
      renderRegisterWithProviders('rtb');
      
      expect(screen.getByText('Create rtb Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    test('registers RTB user successfully with valid data', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('rtb');
      
      await user.type(screen.getByPlaceholderText('Email Address'), 'rtb@test.com');
      await user.type(screen.getByPlaceholderText('Phone Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    test('prevents form submission with empty required fields', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      
      // Try to submit empty form
      await user.click(submitButton);
      
      // Form should not submit due to browser validation
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('shows error for duplicate user registration', async () => {
      const user = userEvent.setup();
      
      // Create a component that pre-registers a user
      const TestComponent = () => {
        const { registerUser } = require('../context/InMemoryDB').useDB();
        
        React.useEffect(() => {
          registerUser({
            role: 'student',
            details: {
              studentId: '22RP03385',
              email: 'john@test.com',
              password: 'password123'
            }
          });
        }, [registerUser]);
        
        return <Register />;
      };

      // Mock useParams for the test component
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
        useParams: () => ({ role: 'student' })
      }));

      render(
        <MemoryRouter>
          <DBProvider>
            <TestComponent />
          </DBProvider>
        </MemoryRouter>
      );
      
      // Try to register with same details
      await user.type(screen.getByPlaceholderText('Both Names'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email Address'), 'john@test.com');
      await user.type(screen.getByPlaceholderText('Student ID (e.g., 22RP03385)'), '22RP03385');
      await user.type(screen.getByPlaceholderText('Phone Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/User with this ID or email already exists/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Links', () => {
    test('renders correct login link for each role', () => {
      // Test different roles
      const roles = ['student', 'school', 'company', 'rtb'];
      
      roles.forEach(role => {
        const { unmount } = renderRegisterWithProviders(role);
        
        const loginLink = screen.getByText('Log in here');
        expect(loginLink.closest('a')).toHaveAttribute('href', `/login/${role}`);
        
        unmount();
      });
    });

    test('handles form submission event correctly', async () => {
      const user = userEvent.setup();
      renderRegisterWithProviders('student');
      
      const form = screen.getByRole('form') || screen.getByTestId('register-form') || 
                   document.querySelector('form');
      
      // Fill minimum required fields
      await user.type(screen.getByPlaceholderText('Both Names'), 'John Doe');
      await user.type(screen.getByPlaceholderText('Email Address'), 'john@test.com');
      await user.type(screen.getByPlaceholderText('Student ID (e.g., 22RP03385)'), '22RP03385');
      await user.type(screen.getByPlaceholderText('Phone Number'), '1234567890');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');

      if (form) {
        fireEvent.submit(form);
      } else {
        await user.click(screen.getByRole('button', { name: 'Create Account' }));
      }

      await waitFor(() => {
        expect(screen.getByText('Account created successfully! You can now log in.')).toBeInTheDocument();
      });
    });
  });
});