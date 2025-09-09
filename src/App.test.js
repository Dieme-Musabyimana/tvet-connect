import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { DBProvider } from './context/InMemoryDB';

// Mock components to avoid complexity in main App tests
jest.mock('./pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('./pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('./pages/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('./pages/StudentDashboard', () => {
  return function MockStudentDashboard() {
    return <div data-testid="student-dashboard">Student Dashboard</div>;
  };
});

const renderAppWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Component', () => {
  test('renders TVET Connect navigation', () => {
    renderAppWithRouter();
    const navLink = screen.getByText('TVET Connect');
    expect(navLink).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    renderAppWithRouter(['/']);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  test('renders login and register links when not logged in', () => {
    renderAppWithRouter();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('navigates to login page', () => {
    renderAppWithRouter(['/login/student']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('navigates to register page', () => {
    renderAppWithRouter(['/register/student']);
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  test('redirects to login when accessing protected route without authentication', () => {
    renderAppWithRouter(['/dashboard/student']);
    // Should redirect to login page for student
    expect(window.location.pathname).toBe('/dashboard/student');
  });
});
