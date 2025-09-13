// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  dashboardContainer: { padding: '20px', fontFamily: "'Dancing Script', cursive" },
  userInfo: { backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center', borderBottom: '2px solid #7853C2', marginBottom: '20px' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#f5f5f5', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, boxShadow 0.2s' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '15px', color: '#6f42c1' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' },

  // NEW STYLES FOR RECENT ACTIVITY
  recentActivityContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  recentTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#6f42c1' },
  activityList: { listStyle: 'none', padding: 0, margin: 0 },
  activityItem: { padding: '10px 0', borderBottom: '1px solid #eee' },
  activityText: { fontSize: '1rem', color: '#333' },
  timestamp: { fontSize: '0.8rem', color: '#777', marginLeft: '8px' }
};

// Simple card component
const Card = ({ icon, title, onClick }) => (
  <div style={styles.card} onClick={onClick}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={styles.cardTitle}>{title}</div>
  </div>
);

function Dashboard() {
  const userName = localStorage.getItem('userName') || 'Manager';
  const navigate = useNavigate();


  const [activities, setActivities] = useState([]);


useEffect(() => {
  const stored = JSON.parse(sessionStorage.getItem("activities") || "[]");
  setActivities(stored);

  const handleNewActivity = (e) => {
    const newActivity = { id: Date.now(), ...e.detail };
    setActivities(prev => [newActivity, ...prev]);

    // keep in sessionStorage too
    sessionStorage.setItem("activities", JSON.stringify([newActivity, ...prev]));
  };

  window.addEventListener("recent-activity", handleNewActivity);
  return () => window.removeEventListener("recent-activity", handleNewActivity);
}, []);







  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.userInfo}>
        <h2>Welcome back, {userName}!</h2>
        <p>Here's your overview for today.</p>
      </div>

      <div style={styles.dashboardGrid}>
        <Card icon="ℹ️" title="Inventory Management" onClick={() => navigate('/manager/view-items')} />
        <Card icon="🚚" title="Assign Machines" />
        <Card icon="📊" title="View Reports" />
        <Card icon="➕" title="Add Staff" onClick={() => navigate('/manager/manage-staff')} />
      </div>

      {/* Recent Activity Section */}
      <div style={styles.recentActivityContainer}>
        <h3 style={styles.recentTitle}>Recent Activity</h3>
        <ul style={styles.activityList}>
          {activities.map(activity => (
            <li key={activity.id} style={styles.activityItem}>
              <span style={styles.activityText}>{activity.text}</span>
              <span style={styles.timestamp}>({activity.time})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
