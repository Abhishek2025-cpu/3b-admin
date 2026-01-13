import React, { useState, useRef, useEffect } from 'react';
import { BsPersonPlusFill } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';

// Alert Component for displaying feedback
const Alert = ({ message, type, show, onClose }) => {
  if (!show) return null;

  const alertStyles = {
    success: 'bg-green-100 border-green-400 text-green-800',
    danger: 'bg-red-100 border-red-400 text-red-800',
  };

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 min-w-[300px] p-4 border rounded-md shadow-lg flex justify-between items-center transition-opacity duration-500 ease-in-out ${alertStyles[type] || alertStyles.danger} ${show ? 'opacity-100' : 'opacity-0'}`}
      style={{ zIndex: 1050 }}
      role="alert"
    >
      <span>{message}</span>
      <button type="button" className="ml-4 font-bold" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

// Password Popup Component - Updated to show multiple credentials
const PasswordPopup = ({ credentials, show, onClose }) => {
  if (!show || !credentials) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100] p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-2 text-gray-800">Registration Successful!</h3>
        <p className="mb-4 text-gray-600">Staff member added. Here are the login details:</p>
        
        <div className="space-y-3 mb-6">
          {credentials.map((cred, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase text-[#7853C2]">{cred.role}</span>
                <span className="text-xs text-gray-500">EID: {cred.eid}</span>
              </div>
              <p className="text-xl font-mono font-bold tracking-wider text-gray-900 select-all">
                {cred.password}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#7853C2] text-white font-bold py-3 px-6 rounded-md hover:bg-[#6643b1] transition-colors duration-300"
        >
          Done & Close
        </button>
      </div>
    </div>
  );
};

function AddStaffForm() {
  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [roles, setRoles] = useState([]); 
  const [dob, setDob] = useState('');
  const [adharNumber, setAdharNumber] = useState('');
  
  // File States
  const [adharImage, setAdharImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const adharImageRef = useRef(null);

  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const profilePicRef = useRef(null);
  
  // Role & Popup State
  const [otherRole, setOtherRole] = useState(''); 
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const roleOptions = ['Operator', 'Helper', 'Mixture', 'Other'];

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo({ ...alertInfo, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  // --- Handlers ---

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setProfilePreview(null);
    if (profilePicRef.current) profilePicRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdharImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePreview = () => {
    setAdharImage(null);
    setPreviewUrl(null);
    if (adharImageRef.current) adharImageRef.current.value = '';
  };

  const handleRoleSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !roles.includes(selectedValue)) {
      setRoles([...roles, selectedValue]);
    }
    e.target.value = ""; 
  };

  const removeRole = (roleToRemove) => {
    setRoles(roles.filter(r => r !== roleToRemove));
    if (roleToRemove === 'Other') setOtherRole('');
  };

  const resetForm = () => {
    setName('');
    setMobile('');
    setRoles([]);
    setDob('');
    setAdharNumber('');
    setOtherRole('');
    handleRemovePreview();
    removeProfilePic();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !mobile || roles.length === 0 || !adharImage || (roles.includes('Other') && !otherRole)) {
      setAlertInfo({ show: true, message: 'Please fill in all required fields.', type: 'danger' });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    if (dob) formData.append('dob', dob);
    if (adharNumber) formData.append('adharNumber', adharNumber);
    if (adharImage) formData.append('adharImage', adharImage);
    if (profilePic) formData.append('profilePic', profilePic);

    // 🔹 UPDATED: Sending roles as an array (roles[])
    roles.forEach((r) => {
      const finalRoleValue = (r === 'Other' ? otherRole : r);
      formData.append('roles[]', finalRoleValue);
    });

    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/add-employees', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        // Ham result.credentials ko popup mein dikhayenge
        setGeneratedCredentials(result.credentials || []);
        setShowPasswordPopup(true);
      } else {
        setAlertInfo({ show: true, message: result.message || 'Submission failed.', type: 'danger' });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: 'Network error. Try again.', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePasswordPopup = () => {
    setShowPasswordPopup(false);
    setGeneratedCredentials([]);
    setAlertInfo({ show: true, message: '✅ Staff added successfully!', type: 'success' });

    const activity = {
      text: `Staff "${name}" added with roles: ${roles.join(', ')}`,
      time: "Just now"
    };

    window.dispatchEvent(new CustomEvent("recent-activity", { detail: activity }));
    const existingActivities = JSON.parse(sessionStorage.getItem("activities") || "[]");
    sessionStorage.setItem("activities", JSON.stringify([activity, ...existingActivities]));

    resetForm();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-5 font-sans">
      <Alert 
        message={alertInfo.message} 
        type={alertInfo.type} 
        show={alertInfo.show}
        onClose={() => setAlertInfo({ ...alertInfo, show: false })}
      />
      
      <PasswordPopup
        show={showPasswordPopup}
        credentials={generatedCredentials}
        onClose={handleClosePasswordPopup}
      />

      <div className="bg-[#f5f5f5] p-8 rounded-xl shadow-lg max-w-2xl mx-auto mt-5">
        <h4 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <BsPersonPlusFill /> Add Staff Member
        </h4>
        
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Profile Image */}
          <div className="mb-6 text-center sm:text-left">
            <label className="block text-gray-700 font-medium mb-2 text-left">Profile Image</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
               <input 
                type="file" 
                ref={profilePicRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#e9e4f5] file:text-[#7853C2] hover:file:bg-[#d8cff0]"
                accept="image/*"
                onChange={handleProfilePicChange}
              />
              {profilePreview && (
                <div className="relative flex-shrink-0">
                  <img src={profilePreview} alt="DP" className="w-16 h-16 object-cover rounded-full border-2 border-[#7853C2]" />
                  <button type="button" onClick={removeProfilePic} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Full Name*</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] outline-none" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              required 
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Mobile No*</label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] outline-none" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder=""
              required 
            />
          </div>

          {/* Multiple Role Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Roles* (Select multiple)</label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {roles.map((r) => (
                <span key={r} className="bg-[#7853C2] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {r}
                  <IoMdClose className="cursor-pointer hover:text-red-300" onClick={() => removeRole(r)} />
                </span>
              ))}
              {roles.length === 0 && <span className="text-gray-400 text-sm italic">No roles selected</span>}
            </div>

            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] bg-white outline-none"
              onChange={handleRoleSelect}
              defaultValue=""
            >
              <option value="" disabled>Choose roles...</option>
              {roleOptions.map(opt => (
                <option key={opt} value={opt} disabled={roles.includes(opt)}>
                  {opt} {roles.includes(opt) ? '(Selected)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {roles.includes('Other') && (
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Specify Other Role*</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] outline-none"
                    placeholder="Enter specific role"
                    value={otherRole}
                    onChange={(e) => setOtherRole(e.target.value)}
                    required
                />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] outline-none"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Aadhar Number</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#7853C2] outline-none"
                value={adharNumber}
                onChange={(e) => setAdharNumber(e.target.value)}
                placeholder="123456789015"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Aadhar Image*</label>
            <input 
              type="file" 
              ref={adharImageRef}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#e9e4f5] file:text-[#7853C2] hover:file:bg-[#d8cff0]"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewUrl && (
              <div className="relative inline-block mt-4">
                <img src={previewUrl} alt="Aadhar" className="w-[120px] h-auto rounded-md border shadow-sm" />
                <button type="button" onClick={handleRemovePreview} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white text-xs">×</button>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#7853C2] text-white font-bold py-3 px-4 rounded-md hover:bg-[#6643b1] transition-all duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Staff...
                </>
            ) : (
                'Save Staff Member'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddStaffForm;