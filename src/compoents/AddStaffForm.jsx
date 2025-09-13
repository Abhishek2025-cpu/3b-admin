import React, { useState, useRef, useEffect } from 'react';
import { BsPersonPlusFill } from 'react-icons/bs'; // Using react-icons for the bootstrap icon

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

// Password Popup Component
const PasswordPopup = ({ password, show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100]">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full mx-4">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Registration Successful!</h3>
        <p className="mb-5 text-gray-600">The staff member has been added. Their temporary password is:</p>
        <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
          <p className="text-2xl font-mono font-bold tracking-widest text-gray-900 select-all">{password}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-[#7853C2] text-white font-bold py-3 px-6 rounded-md hover:bg-[#6643b1] transition-colors duration-300"
        >
          Close & Finish
        </button>
      </div>
    </div>
  );
};


function AddStaffForm() {
  // State for form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [dob, setDob] = useState('');
  const [adharNumber, setAdharNumber] = useState('');
  const [adharImage, setAdharImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // State for "Other" role and password popup
  const [otherRole, setOtherRole] = useState(''); 
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  
  // *** START: New state for loading indicator ***
  const [isLoading, setIsLoading] = useState(false);
  // *** END: New state ***

  // State for alert notifications
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  
  // Ref for the file input to allow programmatic clearing
  const adharImageRef = useRef(null);
  
  // Hides the alert automatically
  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo({ ...alertInfo, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  // Handler for image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdharImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handler for removing the selected image preview
  const handleRemovePreview = () => {
    setAdharImage(null);
    setPreviewUrl(null);
    if (adharImageRef.current) {
      adharImageRef.current.value = '';
    }
  };
  
  // Resets all form fields
  const resetForm = () => {
    setName('');
    setMobile('');
    setRole('');
    setDob('');
    setAdharNumber('');
    setOtherRole('');
    handleRemovePreview();
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalRole = role === 'Other' ? otherRole : role;

    // Client-side validation
    if (!name || !mobile || !finalRole || !adharImage) {
      setAlertInfo({ show: true, message: 'Please fill in all required fields, including Aadhar image.', type: 'danger' });
      return;
    }

    setIsLoading(true); // Set loading to true before the API call

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('role', finalRole);
    if (dob) formData.append('dob', dob);
    if (adharNumber) formData.append('adharNumber', adharNumber);
    if (adharImage) formData.append('adharImage', adharImage);

    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/add-employees', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setGeneratedPassword(result.password || 'Not Available');
        setShowPasswordPopup(true);
      } else {
        setAlertInfo({ show: true, message: result.message || '❌ Submission failed. Please check inputs.', type: 'danger' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setAlertInfo({ show: true, message: '🚨 Network error. Please try again later.', type: 'danger' });
    } finally {
      setIsLoading(false); // Set loading to false after the API call finishes
    }
  };

const handleClosePasswordPopup = () => {
  setShowPasswordPopup(false);
  setGeneratedPassword('');
  setAlertInfo({ show: true, message: '✅ Staff added successfully!', type: 'success' });

  // Prepare activity object
  const activity = {
    text: `Staff member "${name}" added as ${role === 'Other' ? otherRole : role}`,
    time: "Just now"
  };

  // 🔥 Dispatch event for Dashboard to update immediately
  window.dispatchEvent(new CustomEvent("recent-activity", { detail: activity }));

  // 💾 Save to sessionStorage
  const existingActivities = JSON.parse(sessionStorage.getItem("activities") || "[]");
  sessionStorage.setItem("activities", JSON.stringify([activity, ...existingActivities]));

  resetForm();
};




  const roleOptions = ['Operator', 'Helper', 'Mixture', 'Other'];

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
        password={generatedPassword}
        onClose={handleClosePasswordPopup}
      />

      <div 
        className="bg-[#f5f5f5] p-8 rounded-xl shadow-lg max-w-2xl mx-auto mt-5"
      >
        <h4 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <BsPersonPlusFill /> Add Staff
        </h4>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Form fields remain the same */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
              Full Name<span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2]" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="mb-4">
            <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">
              Mobile No<span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              id="mobile" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2]" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required 
            />
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
              Role<span className="text-red-500">*</span>
            </label>
            <select 
              id="role" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2] bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>Select role</option>
              {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          
          {role === 'Other' && (
            <div className="mb-4">
                <label htmlFor="otherRole" className="block text-gray-700 font-medium mb-2">
                    Specify Role<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="otherRole"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2]"
                    placeholder="please specify the role"
                    value={otherRole}
                    onChange={(e) => setOtherRole(e.target.value)}
                    required
                />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="dob" className="block text-gray-700 font-medium mb-2">Date of Birth</label>
            <input 
              type="date" 
              id="dob" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2]"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="adharNumber" className="block text-gray-700 font-medium mb-2">Aadhar Number</label>
            <input 
              type="text" 
              id="adharNumber" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7853C2]"
              value={adharNumber}
              onChange={(e) => setAdharNumber(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="adharImage" className="block text-gray-700 font-medium mb-2">Aadhar Image<span className="text-red-500">*</span></label>
            <input 
              type="file" 
              id="adharImage" 
              ref={adharImageRef}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#e9e4f5] file:text-[#7853C2] hover:file:bg-[#d8cff0]"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewUrl && (
              <div className="relative inline-block mt-4">
                <img src={previewUrl} alt="Preview" className="w-[100px] h-auto rounded-md" />
                <button 
                  type="button" 
                  onClick={handleRemovePreview}
                  className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer border-2 border-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          {/* *** START: Updated Submit Button with Loader *** */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#7853C2] text-white font-bold py-3 px-4 rounded-md hover:bg-[#6643b1] transition-colors duration-300 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </>
            ) : (
                'Save Staff'
            )}
          </button>
          {/* *** END: Updated Submit Button *** */}
        </form>
      </div>
    </div>
  );
}

export default AddStaffForm;