import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Search, Eye, Trash2, X, Copy, Check, 
    Calendar, Mail, Phone, MapPin, Shield, ExternalLink, 
    AlertCircle, User, Loader2
} from 'lucide-react';

// --- Configuration ---
const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api/sub-admin';

// --- Reusable Modern Modal ---
const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className={`relative bg-white rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden z-50`}
                >
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// --- Sub-Components ---

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={title}>
        <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
            </div>
            <p className="text-slate-600 mb-8">{message}</p>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Confirm</button>
            </div>
        </div>
    </ModalWrapper>
);

const AddSubAdminModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', dob: '', address: '' });
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Verification document is required.'); return; }
        setError('');
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            data.append('verificationDocument', file);
            await onAdd(data);
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add New Sub-Admin" maxWidth="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input type="text" name="name" placeholder="John Doe" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <input type="tel" name="phone" placeholder="+91 00000 00000" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                        <input type="date" name="dob" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Address</label>
                    <textarea name="address" rows="2" placeholder="Enter full address" onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"></textarea>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Verification Document (ID Proof)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-indigo-400 transition-colors">
                        <div className="space-y-1 text-center">
                            <User className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    <span>Upload a file</span>
                                    <input type="file" onChange={handleFileChange} required accept="image/*" className="sr-only" />
                                </label>
                                <p className="pl-1 text-slate-500">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">{file ? file.name : 'PNG, JPG up to 10MB'}</p>
                        </div>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center gap-2 transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                        Add Sub-Admin
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

const DetailsModal = ({ isOpen, onClose, admin }) => {
    if (!isOpen || !admin) return null;

    const InfoRow = ({ icon: Icon, label, value, isStatus }) => (
        <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                <Icon size={18} />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                {isStatus ? (
                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase ${value === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {value}
                    </span>
                ) : (
                    <p className="text-slate-800 font-semibold break-all">{value}</p>
                )}
            </div>
        </div>
    );

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Sub-Admin Profile" maxWidth="max-w-lg">
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <img 
                        src={admin.profilePicture?.url || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-50 shadow-xl" 
                    />
                    <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-xl border-2 border-white shadow-lg ${admin.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                        <Shield size={14} className="text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tight">{admin.name}</h2>
                <p className="text-slate-400 font-medium">{admin.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow icon={Phone} label="Phone" value={admin.phone} />
                <InfoRow icon={Calendar} label="DOB" value={new Date(admin.dob).toLocaleDateString()} />
                <InfoRow icon={Shield} label="Status" value={admin.status} isStatus />
                <InfoRow icon={Mail} label="Permissions" value={admin.permissions.join(', ')} />
                <div className="md:col-span-2">
                    <InfoRow icon={MapPin} label="Address" value={admin.address} />
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
                <a 
                    href={admin.verificationDocument?.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 w-full p-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
                >
                    <ExternalLink size={18} /> View Verification ID
                </a>
            </div>
        </ModalWrapper>
    );
};

const PasswordDisplayModal = ({ isOpen, onClose, password }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Account Created!">
            <div className="text-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <p className="text-slate-600 mb-6">Generated temporary password for the new admin:</p>
                <div className="relative group">
                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 font-mono text-2xl font-bold text-indigo-600 break-all">
                        {password}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="absolute top-2 right-2 p-2 bg-white shadow-md rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <p className="mt-6 text-sm text-slate-400 font-medium leading-relaxed">
                    Make sure to share this password with the sub-admin. They will be asked to change it upon first login.
                </p>
                <button onClick={onClose} className="w-full mt-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all uppercase tracking-widest">
                    Done
                </button>
            </div>
        </ModalWrapper>
    );
};

// --- Main Component ---
export default function SubAdmins() {
    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const fetchSubAdmins = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/sub-admins`);
            if (!response.ok) throw new Error('Failed to fetch sub-admins.');
            const data = await response.json();
            setSubAdmins(Array.isArray(data) ? data : []);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSubAdmins(); }, []);

    const handleAdd = async (formData) => {
        const response = await fetch(`${API_BASE_URL}/register`, { method: 'POST', body: formData });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Registration failed.');
        }
        const data = await response.json();
        if (data.autoGeneratedPassword) {
            setNewAdminPassword(data.autoGeneratedPassword);
            setIsPasswordModalOpen(true);
        }
        setIsAddModalOpen(false);
        fetchSubAdmins();
    };

    const handleStatusToggle = async (admin) => {
        const newStatus = admin.status === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`${API_BASE_URL}/status/${admin._id}`, { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ status: newStatus }) 
            });
            if (!res.ok) throw new Error('Update failed');
            setSubAdmins(subAdmins.map(sa => sa._id === admin._id ? { ...sa, status: newStatus } : sa));
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async (adminId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/delete/${adminId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setSubAdmins(subAdmins.filter(sa => sa._id !== adminId));
        } catch (err) { alert(err.message); }
    };

    const openConfirmModal = (admin, action, message) => {
        setSelectedAdmin(admin);
        setConfirmAction(() => action);
        setConfirmMessage(message);
        setIsConfirmModalOpen(true);
    };

    const filteredAdmins = useMemo(() => {
        return subAdmins.filter(admin => 
            admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            admin.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [subAdmins, searchQuery]);

    if (isLoading) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50 text-indigo-600">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Card */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Sub-Admins</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage permissions and team accounts</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by name/email..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                        >
                            <UserPlus size={20} />
                            Add Admin
                        </button>
                    </div>
                </motion.div>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-xs font-black tracking-[0.2em]">
                                    <th className="px-8 py-6">Admin Profile</th>
                                    <th className="px-8 py-6">Contact Info</th>
                                    <th className="px-8 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAdmins.length > 0 ? filteredAdmins.map((admin, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={admin._id} 
                                        className="hover:bg-indigo-50/30 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img 
                                                        src={admin.profilePicture?.url || 'https://via.placeholder.com/40'} 
                                                        alt="" 
                                                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all shadow-md" 
                                                    />
                                                    {admin.status === 'active' && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 tracking-tight leading-none">{admin.name}</p>
                                                    <p className="text-xs text-slate-400 font-bold mt-1 tracking-wider uppercase">ID: {admin._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                    <Mail size={14} className="text-slate-300" /> {admin.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <Phone size={14} className="text-slate-300" /> {admin.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button 
                                                onClick={() => openConfirmModal(
                                                    admin, 
                                                    () => handleStatusToggle(admin),
                                                    `Do you want to ${admin.status === 'active' ? 'Deactivate' : 'Activate'} ${admin.name}?`
                                                )}
                                                className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${admin.status === 'active' ? 'bg-green-500 shadow-green-100 shadow-lg' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${admin.status === 'active' ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => { setSelectedAdmin(admin); setIsDetailsModalOpen(true); }}
                                                    className="p-3 bg-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => openConfirmModal(
                                                        admin, 
                                                        () => handleDelete(admin._id),
                                                        `Permanently delete ${admin.name}? This action cannot be undone.`
                                                    )}
                                                    className="p-3 bg-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                                            No sub-admins found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Modals Container */}
            <AddSubAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />
            <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} admin={selectedAdmin} />
            <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={() => { confirmAction(); setIsConfirmModalOpen(false); }} title="Are you sure?" message={confirmMessage} />
            <PasswordDisplayModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} password={newAdminPassword} />
        </div>
    );
}