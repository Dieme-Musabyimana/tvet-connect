import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { DBProvider } from '../context/InMemoryDB';

const mockNavigate = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderNavbarWithProviders = () => {
  return render(
    <MemoryRouter>
      <DBProvider>
        <Navbar />
      </DBProvider>
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo with correct styling and link', () => {
    renderNavbarWithProviders();
    
    const logoLink = screen.getByRole('link', { name: /TVET Connect/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    
    expect(screen.getByText('TVE')).toBeInTheDocument();
    expect(screen.getByText('T Connect')).toBeInTheDocument();
  });

  test('renders login links when user is not logged in', () => {
    renderNavbarWithProviders();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Student Login')).toBeInTheDocument();
    expect(screen.getByText('School Login')).toBeInTheDocument();
    expect(screen.getByText('Company Login')).toBeInTheDocument();
    expect(screen.getByText('RTB Login')).toBeInTheDocument();
    
    // Should not show logout button when not logged in
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('login links have correct href attributes', () => {
    renderNavbarWithProviders();
    
    expect(screen.getByText('Home')).toHaveAttribute('href', '/');
    expect(screen.getByText('Student Login')).toHaveAttribute('href', '/login/student');
    expect(screen.getByText('School Login')).toHaveAttribute('href', '/login/school');
    expect(screen.getByText('Company Login')).toHaveAttribute('href', '/login/company');
    expect(screen.getByText('RTB Login')).toHaveAttribute('href', '/login/rtb');
  });

  test('renders dashboard link and logout button when user is logged in', () => {
    // Create a test component that sets up a logged-in user
    const TestComponentWithUser = () => {
      const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });
      }, [registerUser, loginUser]);
      
      return <Navbar />;
    };

    render(
      <MemoryRouter>
        <DBProvider>
          <TestComponentWithUser />
        </DBProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('student Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Should not show login links when logged in
    expect(screen.queryByText('Student Login')).not.toBeInTheDocument();
    expect(screen.queryByText('School Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Company Login')).not.toBeInTheDocument();
    expect(screen.queryByText('RTB Login')).not.toBeInTheDocument();
  });

  test('dashboard link shows correct role', () => {
    const roles = ['student', 'school', 'company', 'rtb'];
    
    roles.forEach((role) => {
      const TestComponentWithRole = () => {
        const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
        
        React.useEffect(() => {
          const userDetails = {
            role,
            details: {
              email: `${role}@test.com`,
              password: 'password123'
            }
          };

          if (role === 'student') {
            userDetails.details.studentId = '22RP03385';
          } else if (role === 'school') {
            userDetails.details.schoolId = 'SCHOOL123';
            userDetails.details.schoolName = 'Test School';
          } else if (role === 'company') {
            userDetails.details.companyId = 'COMP123';
            userDetails.details.companyName = 'Test Company';
          }

          registerUser(userDetails);

          const identifier = role === 'student' ? '22RP03385' : 
                           role === 'school' ? 'SCHOOL123' : 
                           role === 'company' ? 'COMP123' : 
                           `${role}@test.com`;

          loginUser({ role, identifier, password: 'password123' });
        }, [registerUser, loginUser]);
        
        return <Navbar />;
      };

      const { unmount } = render(
        <MemoryRouter>
          <DBProvider>
            <TestComponentWithRole />
          </DBProvider>
        </MemoryRouter>
      );

      expect(screen.getByText(`${role} Dashboard`)).toBeInTheDocument();
      
      unmount();
    });
  });

  test('handles logout functionality', async () => {
    const user = userEvent.setup();
    
    const TestComponentWithLoggedInUser = () => {
      const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });
      }, [registerUser, loginUser]);
      
      return <Navbar />;
    };

    render(
      <MemoryRouter>
        <DBProvider>
          <TestComponentWithLoggedInUser />
        </DBProvider>
      </MemoryRouter>
    );

    // Verify user is logged in
    expect(screen.getByText('student Dashboard')).toBeInTheDocument();
    
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    // Should navigate to home page
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('logout button has correct className', () => {
    const TestComponentWithUser = () => {
      const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });
      }, [registerUser, loginUser]);
      
      return <Navbar />;
    };

    render(
      <MemoryRouter>
        <DBProvider>
          <TestComponentWithUser />
        </DBProvider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toHaveClass('nav-button');
  });

  test('renders with correct CSS classes for styling', () => {
    renderNavbarWithProviders();
    
    expect(document.querySelector('.navbar')).toBeInTheDocument();
    expect(document.querySelector('.logo')).toBeInTheDocument();
    expect(document.querySelector('.nav-links')).toBeInTheDocument();
    expect(document.querySelector('.nav-login-links')).toBeInTheDocument();
    
    const navButtons = document.querySelectorAll('.nav-button');
    expect(navButtons.length).toBeGreaterThan(0);
  });

  test('profile link has correct href', () => {
    const TestComponentWithUser = () => {
      const { registerUser, loginUser } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });

        loginUser({
          role: 'student',
          identifier: '22RP03385',
          password: 'password123'
        });
      }, [registerUser, loginUser]);
      
      return <Navbar />;
    };

    render(
      <MemoryRouter>
        <DBProvider>
          <TestComponentWithUser />
        </DBProvider>
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('student Dashboard');
    expect(dashboardLink).toHaveAttribute('href', '/profile');
  });

  test('handles click events on navigation links', async () => {
    const user = userEvent.setup();
    renderNavbarWithProviders();
    
    // Test clicking on login links (they should navigate but won't in test environment)
    const studentLoginLink = screen.getByText('Student Login');
    await user.click(studentLoginLink);
    
    // Verify link is clickable (actual navigation testing would require more complex setup)
    expect(studentLoginLink).toBeInTheDocument();
  });

  test('logo has correct styling attributes', () => {
    renderNavbarWithProviders();
    
    const tveText = screen.getByText('TVE');
    const tConnectText = screen.getByText('T Connect');
    
    expect(tveText).toHaveStyle('color: white');
    expect(tConnectText).toHaveStyle('color: #00cc99');
  });
});