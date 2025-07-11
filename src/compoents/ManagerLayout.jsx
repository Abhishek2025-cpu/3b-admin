// src/pages/manager/ManagerLayout.jsx

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom'; 

const styles = {
  managerLayout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flexGrow: 1,
    overflowY: 'auto', // Allows content to scroll independently
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1999, // Below sidebar, above content
    opacity: 0, transition: 'opacity 0.3s',
    pointerEvents: 'none',
  },
  overlayVisible: {
    opacity: 1,
    pointerEvents: 'auto',
  },
};

function ManagerLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={styles.managerLayout}>
      {/* The overlay will cover the content when the sidebar is open */}
      <div 
        style={{...styles.overlay, ...(isSidebarOpen ? styles.overlayVisible : {})}} 
        onClick={toggleSidebar}
      ></div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Header onMenuClick={toggleSidebar} />
        <main style={styles.mainContent}>
         <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default ManagerLayout;