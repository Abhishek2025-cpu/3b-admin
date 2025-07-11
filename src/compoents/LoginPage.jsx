// src/App.jsx

import React, { useState, useEffect } from 'react';
// 1. IMPORT useNavigate: This is the hook from React Router for navigation
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faEye, faEyeSlash, faKey, faCopyright } from '@fortawesome/free-solid-svg-icons';

import adminLogo from '../assets/3b_logo.png';
import vectorNew from '../assets/Vectornew.png';

const styles = {
  body: { margin: 0, padding: 0, fontFamily: "'Roboto', sans-serif", background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' },
  loginContainer: { background: '#f5f5f5', borderRadius: '20px', padding: '35px 25px', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '350px', boxSizing: 'border-box', textAlign: 'center', zIndex: 1 },
  
  // 2. CHANGE: Logo is now rounded
  logo: {
    width: '120px',
    height: '120px',
    marginBottom: '15px',
    borderRadius: '50%', // This makes it a circle
    objectFit: 'cover', 
     display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',  // This prevents the image from stretching
  },
  
  h1: { fontSize: '1.5rem', color: '#7853C2', fontFamily: "'Poppins', sans-serif", margin: '0 0 20px 0' },
  inputWrapper: { position: 'relative', marginBottom: '15px', width: '100%' },
  input: { width: '100%', padding: '10px 40px', border: '1px solid #7853C2', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' },
  iconLeft: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#7853C2' },
  iconRight: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '12px', color: '#7853C2', cursor: 'pointer' },
  loginButton: { width: '100%', padding: '12px', backgroundColor: '#7853C2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '10px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background-color 0.3s' },
  loginButtonDisabled: { backgroundColor: '#a991d8', cursor: 'not-allowed' },
  spinner: { display: 'inline-block', width: '1rem', height: '1rem', verticalAlign: 'text-bottom', border: '.2em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', animation: 'spinner-border .75s linear infinite', marginLeft: '10px' },
  forgotPasswordLink: { marginTop: '15px', color: '#6f42c1', textDecoration: 'none', display: 'inline-block' },
  toastContainer: { position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 },
  toast: { minWidth: '250px', padding: '15px', borderRadius: '8px', color: 'white', fontSize: '1rem', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', animation: 'fade-in-out 4s ease-in-out' },
  toastSuccess: { backgroundColor: '#28a745' }, // Green
  toastError: { backgroundColor: '#dc3545' },   // Red
  topImgContainer: { position: 'absolute', top: '0px', right: '0px', zIndex: 0 },
  topImg: { width: '220px' },
  footer: { position: 'fixed', bottom: 0, left: 0, width: '100%', backgroundColor: '#7853C2', color: 'white', textAlign: 'center', padding: '10px 0', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.2)' },
};

const keyframes = `
  @keyframes spinner-border { to { transform: rotate(360deg); } }
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(20px); }
    10%, 90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(20px); }
  }`;

function LoginPage() {
  const navigate = useNavigate(); // Initialize the navigate function from React Router

  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);
  }, []);

  // 3. FIX: The bug causing the green toast to turn red is fixed here.
  // The toast now resets to a neutral state, not a default 'error' state.
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' }); // Reset to empty type
    }, 4000);
  };

 // In your LoginPage.jsx component

const handleLogin = async (e) => {
  e.preventDefault();
  if (!/^\d{10}$/.test(number)) return showToast('Please enter a valid 10-digit phone number.', 'error');
  if (!password) return showToast('Please enter your password.', 'error');
  
  setIsLoading(true);

  try {
    const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number, password }),
    });
    const result = await response.json();

    // CORRECTED LOGIC: We now primarily trust `response.ok`.
    // The `response.ok` property is true for HTTP statuses 200-299.
    if (response.ok) {
      showToast('Login successful!', 'success'); // This will now be green
      
      // Use the data from the 'result' object as before
      const { name, role, token } = result.data || {};
      localStorage.setItem('userName', name || 'Manager');
      localStorage.setItem('userRole', role || 'guest');
      localStorage.setItem('authToken', token);

      // Navigate after a short delay so the user sees the green toast
      setTimeout(() => {
        navigate('/manager');
      }, 800);

    } else {
      // This block now correctly handles actual API errors (like 401, 404, 500)
      showToast(result.message || 'Invalid credentials or server error.', 'error');
      setIsLoading(false);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Network error. Please try again.', 'error');
    setIsLoading(false);
  }
};
  // This combines the base toast style with the correct success or error style
  const toastStyle = {
    ...styles.toast,
    ...(toast.type === 'success' ? styles.toastSuccess : {}),
    ...(toast.type === 'error' ? styles.toastError : {}),
  };

  return (
    <div style={styles.body}>
      <div style={styles.topImgContainer}><img src={vectorNew} alt="Decoration" style={styles.topImg} /></div>
      <div style={styles.loginContainer}>
        <img src={adminLogo} alt="Company Logo" style={styles.logo} />
        <h1 style={styles.h1}>3B Profiles</h1>
        <form onSubmit={handleLogin}>
          <div style={styles.inputWrapper}><FontAwesomeIcon icon={faPhone} style={styles.iconLeft} /><input type="tel" placeholder="Enter your Phone number" style={styles.input} value={number} onChange={(e) => setNumber(e.target.value)} maxLength="10" disabled={isLoading}/></div>
          <div style={styles.inputWrapper}><FontAwesomeIcon icon={faLock} style={styles.iconLeft} /><input type={isPasswordVisible ? 'text' : 'password'} placeholder="Password" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading}/><FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} style={styles.iconRight} onClick={() => !isLoading && setIsPasswordVisible(!isPasswordVisible)}/></div>
          <button type="submit" style={{ ...styles.loginButton, ...(isLoading ? styles.loginButtonDisabled : {}), }} disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login'}
            {isLoading && <div style={styles.spinner}></div>}
          </button>
        </form>
        <p><a href="#" style={styles.forgotPasswordLink}><FontAwesomeIcon icon={faKey} style={{ marginRight: '5px' }}/>Forgot Password?</a></p>
      </div>
      
      {toast.show && (<div style={styles.toastContainer}><div style={toastStyle}>{toast.message}</div></div>)}
      
      <div style={styles.footer}><FontAwesomeIcon icon={faCopyright} style={{ marginRight: '5px' }}/>All Rights Reserved By 3B Profiles</div>
    </div>
  );
}

export default LoginPage;