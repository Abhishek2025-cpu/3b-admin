import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Camera, IdCard, Calendar, Phone, User, 
  X, CheckCircle2, AlertCircle, Loader2, Briefcase 
} from 'lucide-react';

// --- Premium Animated Toast ---
const Toast = ({ message, type, show, onClose }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className={`fixed top-6 left-1/2 z-[2000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl min-w-[320px] border ${
          type === 'success' 
            ? 'bg-white/90 border-emerald-500 text-emerald-900 backdrop-blur-md' 
            : 'bg-white/90 border-rose-500 text-rose-900 backdrop-blur-md'
        }`}
      >
        {type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto hover:bg-black/5 p-1 rounded-full transition-colors">
          <X size={18} />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Premium Password Popup ---
const PasswordPopup = ({ credentials, show, onClose }) => {
  if (!show || !credentials) return null;
  const credentialsList = Array.isArray(credentials) ? credentials : [credentials];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[1100] p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-purple-100"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Registration Successful!</h3>
        <p className="text-center text-slate-500 mb-6 italic text-sm">Please save these login credentials securely.</p>

        <div className="space-y-4 mb-8">
          {credentialsList.map((cred, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 relative overflow-hidden group"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
                  {cred.role || 'STAFF'}
                </span>
                <span className="text-xs font-semibold text-slate-400">EID: {cred.eid}</span>
              </div>
              <p className="text-3xl font-mono font-bold text-slate-800 tracking-tighter select-all cursor-pointer hover:text-purple-700 transition-colors">
                {cred.password}
              </p>
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <IdCard size={40} />
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Done & Close
        </button>
      </motion.div>
    </div>
  );
};

function AddStaffForm() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [dob, setDob] = useState('');
  const [adharNumber, setAdharNumber] = useState('');
  const [otherRole, setOtherRole] = useState('');
  
  const [adharImage, setAdharImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'success' });

  const adharImageRef = useRef(null);
  const profilePicRef = useRef(null);

  const roleOptions = ['Operator', 'Helper', 'Mixture', 'Other'];

  useEffect(() => {
    if (alertInfo.show) {
      const timer = setTimeout(() => setAlertInfo({ ...alertInfo, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdharImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setName(''); setMobile(''); setRole(''); setDob(''); setAdharNumber(''); setOtherRole('');
    setAdharImage(null); setPreviewUrl(null); setProfilePic(null); setProfilePreview(null);
    if (adharImageRef.current) adharImageRef.current.value = '';
    if (profilePicRef.current) profilePicRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !mobile || !role || !adharImage || (role === 'Other' && !otherRole)) {
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
    formData.append('role', role);
    if (role === 'Other') formData.append('otherRoles', otherRole);

    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/add-employees', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setGeneratedCredentials(result.credentials ? (Array.isArray(result.credentials) ? result.credentials : [result.credentials]) : []);
        setShowPasswordPopup(true);
      } else {
        setAlertInfo({ show: true, message: result.message || 'Something went wrong!', type: 'danger' });
      }
    } catch (error) {
      setAlertInfo({ show: true, message: 'Network error. Please try again later.', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-100 selection:text-purple-900">
      <Toast {...alertInfo} onClose={() => setAlertInfo({ ...alertInfo, show: false })} />
      <PasswordPopup show={showPasswordPopup} credentials={generatedCredentials} onClose={() => {
        setShowPasswordPopup(false);
        setAlertInfo({ show: true, message: 'Staff member added successfully!', type: 'success' });
        resetForm();
      }} />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
          
          {/* Header Section */}
          <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <UserPlus className="text-purple-400" size={32} />
                Add New Staff Member
              </h1>
              <p className="text-slate-400 mt-2">Fill in the details below to register a new employee.</p>
            </div>
            {/* Design Elements */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8 bg-white">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-slate-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-400">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-slate-300" size={40} />
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={profilePicRef} 
                  onChange={handleProfilePicChange} 
                  accept="image/*"
                />
                <button 
                  type="button"
                  onClick={() => profilePicRef.current.click()}
                  className="absolute -bottom-3 -right-3 bg-purple-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-purple-700 transition-transform active:scale-90"
                >
                  <Camera size={18} />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-slate-800 text-lg">Profile Photo</h3>
                <p className="text-sm text-slate-500 max-w-[200px] mt-1">Upload a clear face photo of the staff member (Optional).</p>
                {profilePreview && (
                  <button onClick={() => {setProfilePic(null); setProfilePreview(null)}} className="text-xs text-rose-500 font-semibold mt-2 hover:underline">Remove Photo</button>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Designation / Role *</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all appearance-none font-medium text-slate-700"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="" disabled>Select Role</option>
                    {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {/* Other Role Specification */}
              {role === 'Other' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Specify Role *</label>
                  <input
                    type="text"
                    placeholder="E.g. Supervisor"
                    className="w-full px-4 py-4 bg-purple-50/50 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                    value={otherRole}
                    onChange={(e) => setOtherRole(e.target.value)}
                  />
                </motion.div>
              )}

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium text-slate-700"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              {/* Aadhar Number */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Aadhar Number</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="12 digit Aadhar number"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                    value={adharNumber}
                    onChange={(e) => setAdharNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Aadhar Card Document *</label>
              <div 
                className={`relative group border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer ${
                  previewUrl ? 'border-purple-500 bg-purple-50/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                }`}
                onClick={() => adharImageRef.current.click()}
              >
                <input type="file" ref={adharImageRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                
                {previewUrl ? (
                  <div className="relative inline-block group">
                    <img src={previewUrl} alt="Aadhar Preview" className="max-h-[180px] rounded-xl shadow-lg border-2 border-white" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-sm">Change Document</div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IdCard className="text-purple-600" size={28} />
                    </div>
                    <p className="font-bold text-slate-700">Upload Aadhar Image</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, or JPEG format (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_40px_rgba(124,58,237,0.4)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Processing...
                </>
              ) : (
                'Register Staff Member'
              )}
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8 font-medium">Secure Staff Management Portal • Version 2.0.4</p>
      </motion.div>
    </div>
  );
}

export default AddStaffForm;