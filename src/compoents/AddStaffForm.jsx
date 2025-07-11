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


function AddStaffForm() {
  // State for form fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [dob, setDob] = useState('');
  const [adharNumber, setAdharNumber] = useState('');
  const [adharImage, setAdharImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // State for alert notifications
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });
  
  // Ref for the file input to allow programmatic clearing
  const adharImageRef = useRef(null);
  
  // Hides the alert automatically after 4 seconds
  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => {
        setAlertInfo({ ...alertInfo, show: false });
      }, 4000);
      return () => clearTimeout(timer); // Cleanup timer on component unmount or if alert changes
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
    // Reset the file input value
    if (adharImageRef.current) {
      adharImageRef.current.value = '';
    }
  };
  
  // Resets all form fields and the image preview
  const resetForm = () => {
    setName('');
    setMobile('');
    setRole('');
    setDob('');
    setAdharNumber('');
    handleRemovePreview();
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !mobile || !role) {
      setAlertInfo({ show: true, message: 'Please fill in all required fields.', type: 'danger' });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobile', mobile);
    formData.append('role', role);
    if (dob) formData.append('dob', dob);
    if (adharNumber) formData.append('adharNumber', adharNumber);
    if (adharImage) formData.append('adharImage', adharImage);

    try {
      // Replace with your actual API endpoint
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/add-employees', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setAlertInfo({ show: true, message: '✅ Staff added successfully!', type: 'success' });
        resetForm();
      } else {
        setAlertInfo({ show: true, message: result.message || '❌ Submission failed. Please check inputs.', type: 'danger' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setAlertInfo({ show: true, message: '🚨 Network error. Please try again later.', type: 'danger' });
    }
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

      <div 
        // Replicating the .form-container styles with Tailwind CSS and arbitrary values
        className="bg-[#f5f5f5] p-8 rounded-xl shadow-lg max-w-2xl mx-auto mt-5"
      >
        <h4 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <BsPersonPlusFill /> Add Staff
        </h4>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name Input */}
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

          {/* Mobile No Input */}
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

          {/* Role Select */}
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

          {/* Date of Birth Input */}
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

          {/* Aadhar Number Input */}
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

          {/* Aadhar Image Input */}
          <div className="mb-6">
            <label htmlFor="adharImage" className="block text-gray-700 font-medium mb-2">Aadhar Image</label>
            <input 
              type="file" 
              id="adharImage" 
              ref={adharImageRef}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#e9e4f5] file:text-[#7853C2] hover:file:bg-[#d8cff0]"
              accept="image/*"
              onChange={handleImageChange}
            />
            {/* Image Preview */}
            {previewUrl && (
              <div className="relative inline-block mt-4">
                <img src={previewUrl} alt="Preview" className="w-[100px] h-auto rounded-md" />
                <button 
                  type="button" 
                  onClick={handleRemovePreview}
                  // Replicating the .remove-image styles
                  className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold cursor-pointer border-2 border-white"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            // Replicating the .btn custom styles
            className="w-full bg-[#7853C2] text-white font-bold py-3 px-4 rounded-md hover:bg-[#6643b1] transition-colors duration-300"
          >
            Save Staff
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddStaffForm;