import React from 'react';
import { useDB } from '../context/InMemoryDB';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#FFBB28', '#00C49F', '#8884d8'];

export default function HomeStats() {
    const { getDashboardStats, getMarketStats } = useDB();
    const stats = getDashboardStats();
    const marketStats = getMarketStats();

    // Replace URLs below with your own Rwanda TVET image links or local /images assets
    const tvetImages = [
      { src: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1200&auto=format&fit=crop', caption: 'Hands-on technical training' },
      { src: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop', caption: 'Workshop and practicals' },
      { src: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=1200&auto=format&fit=crop', caption: 'Skills for the future' },
      { src: 'https://images.unsplash.com/photo-1492679877627-6e89abbf23d5?q=80&w=1200&auto=format&fit=crop', caption: 'STEM and innovation' }
    ];
  
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
          <div className="pie-chart-block" style={{ width: '100%', height: 300 }}>
            <h3>Job Market Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={pieChartData && pieChartData.some(d => d.value > 0) ? pieChartData : [{ name: 'No data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {(pieChartData && pieChartData.some(d => d.value > 0) ? pieChartData : [{ name: 'No data', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rwanda TVET related images (replace links as needed) */}
        <div className="section horizontal">
          <h3>Rwanda TVET in Pictures</h3>
          <div className="image-grid">
            {tvetImages.map((img, idx) => (
              <div className="image-card" key={idx}>
                <img src={img.src} alt={img.caption} />
                <div className="image-caption">{img.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }