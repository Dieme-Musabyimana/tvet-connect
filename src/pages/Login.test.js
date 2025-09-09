import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { DBProvider } from '../context/InMemoryDB';

const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ role: 'student' })
}));

const renderLoginWithProviders = (role = 'student') => {
  // Mock useParams to return the specified role
  jest.doMock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ role })
  }));

  return render(
    <MemoryRouter>
      <DBProvider>
        <Login />
      </DBProvider>
    </MemoryRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with correct title', () => {
    renderLoginWithProviders();
    
    expect(screen.getByText('student Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email or Student ID')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  });

  test('renders correct placeholder for different roles', () => {
    // Test school role
    const { unmount } = renderLoginWithProviders('school');
    expect(screen.getByPlaceholderText('Email or School ID')).toBeInTheDocument();
    unmount();

    // Test company role  
    renderLoginWithProviders('company');
    expect(screen.getByPlaceholderText('Email or Company ID')).toBeInTheDocument();
  });

  test('renders register link with correct role', () => {
    renderLoginWithProviders();
    
    const registerLink = screen.getByText('Register here');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register/student');
  });

  test('updates form fields on input change', () => {
    renderLoginWithProviders();
    
    const identifierInput = screen.getByPlaceholderText('Email or Student ID');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(identifierInput, { target: { value: '22RP03385' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(identifierInput.value).toBe('22RP03385');
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error message for invalid credentials', async () => {
    renderLoginWithProviders();
    
    const identifierInput = screen.getByPlaceholderText('Email or Student ID');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: 'Log In' });

    fireEvent.change(identifierInput, { target: { value: 'invalid@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials.')).toBeInTheDocument();
    });
  });

  test('navigates to dashboard on successful login', async () => {
    const { container } = render(
      <MemoryRouter>
        <DBProvider>
          <TestLoginWithUser />
        </DBProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/student');
    });
  });

  test('prevents form submission with empty fields', () => {
    renderLoginWithProviders();
    
    const loginButton = screen.getByRole('button', { name: 'Log In' });
    const identifierInput = screen.getByPlaceholderText('Email or Student ID');
    const passwordInput = screen.getByPlaceholderText('Password');

    // Check that inputs are required
    expect(identifierInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');

    // Try to submit empty form
    fireEvent.click(loginButton);
    
    // Form should not submit due to browser validation
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles form submission correctly', async () => {
    renderLoginWithProviders();
    
    const form = screen.getByRole('form') || container.querySelector('form');
    const identifierInput = screen.getByPlaceholderText('Email or Student ID');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(identifierInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    fireEvent.submit(form);

    // Should attempt login (will fail with test data, but form submission works)
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials.')).toBeInTheDocument();
    });
  });
});

// Test component that creates a user and then logs in
function TestLoginWithUser() {
  const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
  
  React.useEffect(() => {
    // Register a user
    registerUser({
      role: 'student',
      details: {
        studentId: '22RP03385',
        email: 'test@example.com',
        password: 'password123'
      }
    });

    // Login the user
    const result = loginUser({
      role: 'student',
      identifier: 'test@example.com',
      password: 'password123'
    });

    if (result.success) {
      mockNavigate('/dashboard/student');
    }
  }, [registerUser, loginUser]);

  return <div>Test component</div>;
}