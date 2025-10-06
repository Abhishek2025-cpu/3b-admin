// src/App.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faEye, faEyeSlash, faKey, faCopyright } from '@fortawesome/free-solid-svg-icons';

import adminLogo from '../assets/3b.png';
import vectorNew from '../assets/Vectornew.png';

const styles = {
  body: { margin: 0, padding: 0, fontFamily: "'Roboto', sans-serif", background: '#f8f9fa', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden' },
  loginContainer: { background: '#f5f5f5', borderRadius: '20px', padding: '35px 25px', boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '350px', boxSizing: 'border-box', textAlign: 'center', zIndex: 1 },

  logo: {
    width: '120px',
    height: '120px',
    marginBottom: '15px',
    borderRadius: '50%',
    objectFit: 'cover',
     display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  },

  h1: { fontSize: '1.5rem', color: '#452983', fontFamily: "'Poppins', sans-serif", fontWeight:"600", margin: '0 0 20px 0' },
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
  const navigate = useNavigate();

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

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(number)) return showToast('Please enter a valid 10-digit phone number.', 'error');
    if (!password) return showToast('Please enter your password.', 'error');

    setIsLoading(true);

    try {
      const response = await fetch('https://threebtest.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, password }),
      });
      const result = await response.json();

      if (response.ok) {
        showToast('Login successful!', 'success');

        // --- FIX START ---
        // Extract 'role' directly from 'result'
        const userRole = result.role; // This will be "admin" or "sub-admin"
        const userName = result.user?.name || 'Manager'; // Get name from result.user, default to 'Manager'
        const authToken = result.token; // Assuming 'token' might also be at top level or in result.user, adjust if needed

        localStorage.setItem('userName', userName);
        localStorage.setItem('userRole', userRole || 'guest'); // Use the extracted userRole
        localStorage.setItem('authToken', authToken); // Set the token

        // --- FIX END ---

        setTimeout(() => {
          navigate('/manager');
        }, 800);

      } else {
        showToast(result.message || 'Invalid credentials or server error.', 'error');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error. Please try again.', 'error');
      setIsLoading(false);
    }
  };

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