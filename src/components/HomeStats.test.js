import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeStats from './HomeStats';
import { DBProvider } from '../context/InMemoryDB';

// Mock Recharts components to avoid canvas rendering issues in tests
jest.mock('recharts', () => ({
  PieChart: ({ children, width, height }) => (
    <div data-testid="pie-chart" data-width={width} data-height={height}>
      {children}
    </div>
  ),
  Pie: ({ dataKey, data, label }) => (
    <div data-testid="pie" data-datakey={dataKey} data-label={label?.toString()}>
      {data && data.map((item, index) => (
        <div key={index} data-testid="pie-segment">
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }) => <div data-testid="pie-cell" data-fill={fill} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

const renderHomeStatsWithProvider = () => {
  return render(
    <DBProvider>
      <HomeStats />
    </DBProvider>
  );
};

describe('HomeStats Component', () => {
  test('renders main heading', () => {
    renderHomeStatsWithProvider();
    
    expect(screen.getByText('TVET Job Market Insights')).toBeInTheDocument();
  });

  test('renders general statistics section', () => {
    renderHomeStatsWithProvider();
    
    expect(screen.getByText('General Statistics')).toBeInTheDocument();
  });

  test('displays all stat cards with initial values', () => {
    renderHomeStatsWithProvider();
    
    expect(screen.getByText('Total Students: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Schools: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 0')).toBeInTheDocument();
    expect(screen.getByText('Approved Profiles: 0')).toBeInTheDocument();
    expect(screen.getByText('Job Posts: 0')).toBeInTheDocument();
    expect(screen.getByText('Offered Students: 0')).toBeInTheDocument();
  });

  test('renders pie chart section', () => {
    renderHomeStatsWithProvider();
    
    expect(screen.getByText('Job Market Comparison')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('pie chart has correct dimensions', () => {
    renderHomeStatsWithProvider();
    
    const pieChart = screen.getByTestId('pie-chart');
    expect(pieChart).toHaveAttribute('data-width', '400');
    expect(pieChart).toHaveAttribute('data-height', '300');
  });

  test('displays pie chart data segments', () => {
    renderHomeStatsWithProvider();
    
    const pieSegments = screen.getAllByTestId('pie-segment');
    expect(pieSegments).toHaveLength(3);
    
    expect(screen.getByText('Students Seeking Offers: 0')).toBeInTheDocument();
    expect(screen.getByText('Available Job Opportunities: 0')).toBeInTheDocument();
    expect(screen.getByText('Students Already Offered: 0')).toBeInTheDocument();
  });

  test('includes tooltip and legend components', () => {
    renderHomeStatsWithProvider();
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  test('updates stats when data changes', () => {
    // Create a test component that adds data and then renders HomeStats
    const TestComponentWithData = () => {
      const { registerUser, submitProfile, reviewProfile, createJobPost, loginUser } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        // Add some test data
        registerUser({
          role: 'student',
          details: {
            studentId: '22RP03385',
            email: 'student@test.com',
            password: 'password123'
          }
        });
        
        registerUser({
          role: 'school',
          details: {
            schoolId: 'SCHOOL1',
            schoolName: 'Test School',
            email: 'school@test.com',
            password: 'password123'
          }
        });

        registerUser({
          role: 'company',
          details: {
            companyId: 'COMP1',
            companyName: 'Test Company',
            email: 'company@test.com',
            password: 'password123'
          }
        });

        // Submit and approve a profile
        submitProfile({
          studentId: '22RP03385',
          bothNames: 'John Doe',
          school: 'Test School'
        });

        // Login as company to create job post
        loginUser({
          role: 'company',
          identifier: 'COMP1',
          password: 'password123'
        });

        createJobPost({
          title: 'Test Job',
          description: 'Test job description'
        });
      }, [registerUser, submitProfile, reviewProfile, createJobPost, loginUser]);
      
      return <HomeStats />;
    };

    render(
      <DBProvider>
        <TestComponentWithData />
      </DBProvider>
    );

    expect(screen.getByText('Total Students: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Schools: 1')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 1')).toBeInTheDocument();
    expect(screen.getByText('Job Posts: 1')).toBeInTheDocument();
  });

  test('pie chart data reflects market statistics correctly', () => {
    // Test with mock data to ensure pie chart displays correct values
    const TestComponentWithMarketData = () => {
      const { registerUser, submitProfile, createJobPost, loginUser, offerStudent } = require('../context/InMemoryDB').useDB();
      
      React.useEffect(() => {
        // Create students with profiles
        registerUser({
          role: 'student',
          details: { studentId: '22RP03385', email: 'student1@test.com', password: 'pass' }
        });
        registerUser({
          role: 'student', 
          details: { studentId: '22RP03386', email: 'student2@test.com', password: 'pass' }
        });
        
        // Create company
        registerUser({
          role: 'company',
          details: { companyId: 'COMP1', companyName: 'Test Company', email: 'company@test.com', password: 'pass' }
        });

        // Submit profiles
        submitProfile({ studentId: '22RP03385', bothNames: 'John Doe' });
        submitProfile({ studentId: '22RP03386', bothNames: 'Jane Doe' });

        // Login and create job
        loginUser({ role: 'company', identifier: 'COMP1', password: 'pass' });
        createJobPost({ title: 'Test Job', description: 'Test job' });

        // Offer one student
        offerStudent({ studentId: '22RP03385', offerType: 'internship', companyId: 'COMP1' });
      }, [registerUser, submitProfile, createJobPost, loginUser, offerStudent]);
      
      return <HomeStats />;
    };

    render(
      <DBProvider>
        <TestComponentWithMarketData />
      </DBProvider>
    );

    // Should show: 1 student seeking offers (2 profiles - 1 offered), 1 job opportunity, 1 offered student
    expect(screen.getByText('Students Seeking Offers: 1')).toBeInTheDocument();
    expect(screen.getByText('Available Job Opportunities: 1')).toBeInTheDocument();
    expect(screen.getByText('Students Already Offered: 1')).toBeInTheDocument();
  });

  test('renders with proper CSS classes for styling', () => {
    renderHomeStatsWithProvider();
    
    expect(document.querySelector('.stats-container')).toBeInTheDocument();
    expect(document.querySelector('.stats-content')).toBeInTheDocument();
    expect(document.querySelector('.stats-text-block')).toBeInTheDocument();
    expect(document.querySelector('.stats-grid')).toBeInTheDocument();
    expect(document.querySelector('.pie-chart-block')).toBeInTheDocument();
    
    const statCards = document.querySelectorAll('.stat-card');
    expect(statCards).toHaveLength(6);
  });

  test('handles empty/zero stats gracefully', () => {
    renderHomeStatsWithProvider();
    
    // All stats should start at 0 and component should render without errors
    expect(screen.getByText('Total Students: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Schools: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Companies: 0')).toBeInTheDocument();
    expect(screen.getByText('Approved Profiles: 0')).toBeInTheDocument();
    expect(screen.getByText('Job Posts: 0')).toBeInTheDocument();
    expect(screen.getByText('Offered Students: 0')).toBeInTheDocument();
    
    // Pie chart should still render with zero values
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Students Seeking Offers: 0')).toBeInTheDocument();
  });
});