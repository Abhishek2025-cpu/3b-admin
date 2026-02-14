// src/compoents/Settings.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faBell, faSignOutAlt, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: localStorage.getItem('userName') || 'Manager',
    email: 'manager@3bprofiles.com',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', profile.name);
    toast.success("Profile updated successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const containerStyle = {
    padding: '30px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  };

  const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '14px'
  };

  const buttonStyle = {
    backgroundColor: '#6f42c1',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#6f42c1', marginBottom: '25px' }}>App Settings</h2>

      {/* Profile Settings */}
      <div style={cardStyle}>
        <h4 style={{ color: '#6f42c1', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <FontAwesomeIcon icon={faUser} /> Profile Information
        </h4>
        <form onSubmit={handleProfileUpdate}>
          <label>Full Name</label>
          <input 
            style={inputStyle} 
            type="text" 
            value={profile.name} 
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
          <label>Email Address</label>
          <input 
            style={inputStyle} 
            type="email" 
            value={profile.email} 
            disabled 
          />
          <button type="submit" style={buttonStyle}>
            <FontAwesomeIcon icon={faSave} /> Save Profile
          </button>
        </form>
      </div>

      {/* Password Settings */}
      <div style={cardStyle}>
        <h4 style={{ color: '#6f42c1', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <FontAwesomeIcon icon={faLock} /> Change Password
        </h4>
        <form onSubmit={handlePasswordChange}>
          <input 
            style={inputStyle} 
            type="password" 
            placeholder="Current Password" 
            value={passwords.current}
            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
          />
          <input 
            style={inputStyle} 
            type="password" 
            placeholder="New Password" 
            value={passwords.new}
            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
          />
          <input 
            style={inputStyle} 
            type="password" 
            placeholder="Confirm New Password" 
            value={passwords.confirm}
            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
          />
          <button type="submit" style={buttonStyle}>
            <FontAwesomeIcon icon={faSave} /> Update Password
          </button>
        </form>
      </div>

      {/* Preferences */}
      <div style={cardStyle}>
        <h4 style={{ color: '#6f42c1', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          <FontAwesomeIcon icon={faBell} /> Preferences
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span>Email Notifications</span>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span>System Alerts</span>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...cardStyle, border: '1px solid #ffcccc' }}>
        <h4 style={{ color: '#dc3545' }}>Account Actions</h4>
        <button 
          onClick={handleLogout}
          style={{ ...buttonStyle, backgroundColor: '#dc3545', marginTop: '15px' }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout from Device
        </button>
      </div>
    </div>
  );
};

export default Settings;