import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faArrowRight, faCheckCircle, faCopyright } from '@fortawesome/free-solid-svg-icons';

import { adminLogin, verifyOtp } from '../../src/compoents/Services/userController'; 
import adminLogo from '../assets/3b.png';
import vectorNew from '../assets/Vectornew.png';

const styles = {
  body: { margin: 0, padding: 0, fontFamily: "'Poppins', sans-serif", background: '#f4f7fe', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'hidden', position: 'relative' },
  loginContainer: { background: '#ffffff', borderRadius: '28px', padding: '45px 35px', boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.08)', width: '90%', maxWidth: '450px', boxSizing: 'border-box', textAlign: 'center', zIndex: 2, position: 'relative' },
  logo: { width: '110px', height: '110px', marginBottom: '15px', borderRadius: '50%', objectFit: 'cover' },
  h1: { fontSize: '1.8rem', color: '#452983', fontWeight: "700", margin: '0 0 10px 0' },
  subText: { color: '#777', fontSize: '1rem', marginBottom: '30px' },
  inputWrapper: { position: 'relative', marginBottom: '25px', width: '100%' },
  input: { width: '100%', padding: '16px 50px', border: '1.5px solid #e1e1e1', borderRadius: '14px', boxSizing: 'border-box', fontSize: '1.05rem', outline: 'none', transition: '0.3s', backgroundColor: '#fdfdfd', color: '#333' },
  iconLeft: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '18px', color: '#7853C2', fontSize: '1.1rem' },
  mainButton: { width: '100%', padding: '16px', backgroundColor: '#7853C2', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', boxShadow: '0 6px 18px rgba(120, 83, 194, 0.3)', transition: '0.3s' },
  topImgContainer: { position: 'absolute', top: '0px', right: '0px', zIndex: 1 },
  topImg: { width: '280px', opacity: 0.9 },
  footer: { position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#7853C2', color: 'white', textAlign: 'center', padding: '14px 0', fontSize: '0.9rem', zIndex: 10, fontWeight: '500' },
  loaderRing: { border: '4px solid #f3f3f3', borderTop: '4px solid #7853C2', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '20px auto' },
  successIcon: { fontSize: '4rem', color: '#28a745', marginBottom: '20px' }
};

const globalStyle = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  input:focus { border-color: #7853C2 !important; background: #fff !important; box-shadow: 0 0 0 5px rgba(120, 83, 194, 0.1); }
  input::placeholder { letter-spacing: normal !important; color: #aaa; }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [number, setNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [sessionData, setSessionData] = useState({ userId: '', sessionId: '' });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (number.length === 10) {
      setLoading(true);
      try {
        const data = await adminLogin(number);
        setSessionData({ userId: data.userId, sessionId: data.sessionId });
        setStep(2);
      } catch (error) {
        alert(error.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep(3);
      setIsVerifying(true);
      try {
        await verifyOtp(sessionData.userId, otp, sessionData.sessionId);
        setIsVerifying(false);
        setTimeout(() => navigate('/manager'), 1500);
      } catch (error) {
        alert(error.message || "Invalid OTP");
        setStep(2);
        setIsVerifying(false);
      }
    }
  };

  return (
    <div style={styles.body}>
      <style>{globalStyle}</style>
      
      <div style={styles.topImgContainer}>
        <img src={vectorNew} alt="bg" style={styles.topImg} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.4 }}
        style={styles.loginContainer}
      >
        <img src={adminLogo} alt="Logo" style={styles.logo} />
        <h1 style={styles.h1}>3B Profiles</h1>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p style={styles.subText}>Enter your mobile number to proceed</p>
              <form onSubmit={handleSendOtp}>
                <div style={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faPhone} style={styles.iconLeft} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    style={styles.input} 
                    value={number}
                    onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength="10"
                    required
                  />
                </div>
                <button type="submit" style={styles.mainButton} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Get OTP'} 
                  {!loading && <FontAwesomeIcon icon={faArrowRight} />}
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p style={styles.subText}>OTP sent to <b>+91 {number}</b></p>
              <form onSubmit={handleVerifyOtp}>
                <div style={styles.inputWrapper}>
                  <FontAwesomeIcon icon={faLock} style={styles.iconLeft} />
                  <input 
                    type="text" 
                    placeholder="Enter 6 Digit OTP" 
                    style={{
                        ...styles.input, 
                        letterSpacing: otp.length > 0 ? '8px' : 'normal',
                        textAlign: otp.length > 0 ? 'center' : 'left',
                        paddingLeft: otp.length > 0 ? '15px' : '50px'
                    }} 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength="6"
                    required
                  />
                </div>
                <button type="submit" style={styles.mainButton}>
                  Verify & Login <FontAwesomeIcon icon={faCheckCircle} />
                </button>
                <div 
                  onClick={() => { setStep(1); setOtp(''); }} 
                  style={{marginTop: '20px', fontSize: '0.9rem', color: '#7853C2', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline'}}
                >
                  Change Phone Number
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="status-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{padding: '30px 0'}}
            >
              {isVerifying ? (
                <>
                  <div style={styles.loaderRing}></div>
                  <h3 style={{color: '#452983', marginTop: '15px'}}>Verifying OTP...</h3>
                  <p style={{color: '#888'}}>Please hold on a moment</p>
                </>
              ) : (
                <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} style={styles.successIcon} />
                  <h2 style={{color: '#28a745', margin: '0 0 10px 0'}}>Login Successful!</h2>
                  <p style={styles.subText}>Welcome back, Redirecting...</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={styles.footer}>
        <FontAwesomeIcon icon={faCopyright} style={{ marginRight: '8px' }}/>
        2025 All Rights Reserved By 3B Profiles
      </div>
    </div>
  );
}

export default LoginPage;