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
    overflowY: 'auto',
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1999,
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
  // 🔹 Step 1: Nayi state add karein
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={styles.managerLayout}>
      <div 
        style={{...styles.overlay, ...(isSidebarOpen ? styles.overlayVisible : {})}} 
        onClick={toggleSidebar}
      ></div>
      
      {/* 🔹 Step 2: Sidebar ko searchQuery pass karein */}
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} searchQuery={searchQuery} />
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 🔹 Step 3: Header ko searchQuery aur setSearchQuery dono pass karein */}
        <Header 
          onMenuClick={toggleSidebar} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        <main style={styles.mainContent}>
         <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default ManagerLayout;