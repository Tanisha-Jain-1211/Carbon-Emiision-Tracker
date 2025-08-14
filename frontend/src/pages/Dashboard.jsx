import React from 'react';

const dashboardContainerStyle = {
  backgroundImage: "url('/bg.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const contentStyle = {
  textAlign: 'center',
  color: '#2d2d2d',
  fontWeight: 'bold',
  fontSize: '1.8rem',
  backgroundColor: 'rgba(255, 255, 255, 0.53)',
  padding: '2rem 3rem',
  borderRadius: '12px',
  boxShadow: '0 0 15px rgba(0,0,0,0.2)',
};

const Dashboard = () => {
  return (
    <div style={dashboardContainerStyle}>
      <div style={contentStyle}>
        <h2>offsetX</h2>
        <p>Welcome to your carbon tracker dashboard.</p>
        <p>
          Here you will be able to track emissions from your food, travel,
          electricity, and lifestyle inputs.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
