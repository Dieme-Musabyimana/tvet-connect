import React from 'react';
import { useDB } from '../context/InMemoryDB';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#FFBB28', '#00C49F', '#8884d8'];

export default function HomeStats() {
    const { getDashboardStats, getMarketStats } = useDB();
    const stats = getDashboardStats();
    const marketStats = getMarketStats();
  
    const pieChartData = [
      { name: 'Students Seeking Offers', value: marketStats.studentsSeekingOffers },
      { name: 'Available Job Opportunities', value: marketStats.totalPositions },
      { name: 'Students Already Offered', value: marketStats.offeredStudentsCount }
    ];
  
    return (
      <div className="stats-container">
        <h2>TVET Job Market Insights</h2>
        <div className="stats-content">
          <div className="stats-text-block">
            <h3>General Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">Total Students: {stats.totalStudents}</div>
              <div className="stat-card">Total Schools: {stats.totalSchools}</div>
              <div className="stat-card">Total Companies: {stats.totalCompanies}</div>
              <div className="stat-card">Approved Profiles: {stats.approvedProfiles}</div>
              <div className="stat-card">Job Posts: {stats.jobPostsCount}</div>
              <div className="stat-card">Offered Students: {stats.offeredStudentsCount}</div>
            </div>
          </div>
          <div className="pie-chart-block">
            <h3>Job Market Comparison</h3>
            <PieChart width={400} height={300}>
              <Pie
                dataKey="value"
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    );
  }