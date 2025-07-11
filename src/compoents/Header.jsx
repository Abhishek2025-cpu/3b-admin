// src/components/Header.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// REMOVED: The problematic 'react-icons' import is gone.
import { useNavigate } from 'react-router-dom';

const styles = {
  // ... all your style objects are the same
  topBar: { backgroundColor: '#f5f5f5', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: '10px 20px', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0 },
  menuIcon: { fontSize: '1.8rem', cursor: 'pointer', color: '#6f42c1' },
  searchBox: { display: 'flex', alignItems: 'center', flexGrow: 1, margin: '0 20px', position: 'relative' },
  searchInput: { width: '100%', padding: '8px 15px 8px 40px', border: '1px solid #ccc', borderRadius: '20px', outline: 'none' },
  searchIcon: { position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#6f42c1', fontSize: '1.2rem' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  notificationIcon: { fontSize: '1.6rem', color: '#6f42c1', cursor: 'pointer' },
  logoutBtn: { fontSize: '1.5rem', color: '#6f42c1', cursor: 'pointer' },
};

function Header({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.topBar}>
      {/* REPLACED: <BiList> is now a simple emoji span */}
      <span style={styles.menuIcon} title="Menu" onClick={onMenuClick}>☰</span>
      
      <div style={styles.searchBox}>
        {/* REPLACED: <BiSearch> is now a simple emoji span */}
        <span style={styles.searchIcon}>🔍</span>
        <input type="text" style={styles.searchInput} placeholder="Search..." />
      </div>
  
      <div style={styles.topBarRight}>
        {/* REPLACED: <BiBell> is now a simple emoji span */}
        <span style={styles.notificationIcon} title="Notifications">🔔</span>
        <FontAwesomeIcon icon={faSignOutAlt} style={styles.logoutBtn} onClick={handleLogout} title="Logout" />
      </div>
    </div>
  );
}

export default Header;