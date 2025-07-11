// src/components/Dashboard.jsx
import React from 'react';
// REMOVED: The problematic 'react-icons' import is gone.

const styles = {
    // ... all your style objects
    dashboardContainer: { padding: '20px', fontFamily: "'Dancing Script', cursive" },
    userInfo: { backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center', borderBottom: '2px solid #7853C2', marginBottom: '20px' },
    dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#f5f5f5', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s' },
    cardIcon: { fontSize: '2.5rem', marginBottom: '15px', color: '#6f42c1' },
    cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }
};

// REPLACED: Icon prop now accepts a simple emoji
const Card = ({ icon, title, onClick }) => (
  <div style={styles.card} onClick={onClick}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={styles.cardTitle}>{title}</div>
  </div>
);

function Dashboard() {
  const userName = localStorage.getItem('userName') || 'Manager';

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.userInfo}>
        <h2>Welcome back, {userName}!</h2>
        <p>Here's your overview for today.</p>
      </div>
      <div style={styles.dashboardGrid}>
        <Card icon="ℹ️" title="Inventory Management" />
        <Card icon="🚚" title="Assign Machines" />
        <Card icon="📊" title="View Reports" />
        <Card icon="➕" title="Add Staff" />
      </div>
    </div>
  );
}

export default Dashboard;