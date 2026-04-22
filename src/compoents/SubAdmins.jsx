import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Search, Eye, Trash2, X, Copy, Check, 
    Calendar, Mail, Phone, MapPin, Shield, ExternalLink, 
    AlertCircle, User, Loader2, Camera, FileText
} from 'lucide-react';

const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api/sub-admin';

// MODAL WRAPPER FIXED: Added flex-col and max-h logic
const ModalWrapper = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    className={`relative bg-white rounded-[2rem] shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] overflow-hidden z-50`}
                >
                    {/* Header: Always Fixed at Top */}
                    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    
                    {/* Body: Scrollable */}
                    <div className="p-6 overflow-y-auto custom-scrollbar grow">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

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
    const [profilePicture, setProfilePicture] = useState(null);
    const [verificationDocument, setVerificationDocument] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDocChange = (e) => setVerificationDocument(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!verificationDocument) { setError('Verification document is required.'); return; }
        setError('');
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('dob', formData.dob);
            data.append('address', formData.address);
            if (profilePicture) data.append('profilePicture', profilePicture);
            data.append('verificationDocument', verificationDocument);
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
                <div className="flex flex-col items-center mb-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-indigo-400 transition-all">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">
                                    <Camera size={32} />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all">
                            <Camera size={16} />
                            <input type="file" name="profilePicture" onChange={handleProfileChange} accept="image/*" className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input type="text" name="name" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <input type="email" name="email" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <input type="tel" name="phone" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                        <input type="date" name="dob" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Address</label>
                    <textarea name="address" rows="2" onChange={handleChange} required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Verification Document</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl">
                        <div className="space-y-1 text-center">
                            <FileText className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600">
                                <label className="relative cursor-pointer bg-white font-medium text-indigo-600">
                                    <span>Upload Document</span>
                                    <input type="file" name="verificationDocument" onChange={handleDocChange} required className="sr-only" />
                                </label>
                            </div>
                            <p className="text-xs text-slate-400">{verificationDocument?.name || 'PNG, JPG, PDF'}</p>
                        </div>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg disabled:bg-indigo-300 flex items-center gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />} Add Admin
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

const DetailsModal = ({ isOpen, onClose, admin }) => {
    if (!isOpen || !admin) return null;

    const InfoRow = ({ icon: Icon, label, value, isStatus }) => (
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 shrink-0">
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                {isStatus ? (
                    <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold uppercase ${value === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {value}
                    </span>
                ) : (
                    <p className="text-slate-800 font-bold truncate text-sm">{value || 'N/A'}</p>
                )}
            </div>
        </div>
    );

    const isPDF = admin.verificationDocument?.url?.toLowerCase().endsWith('.pdf');

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Sub-Admin Profile" maxWidth="max-w-2xl">
            <div className="flex flex-col items-center mb-8 shrink-0">
                <div className="relative">
                    <img 
                        src={admin.profilePicture?.url || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="w-28 h-28 rounded-[2rem] object-cover ring-4 ring-indigo-50 shadow-xl" 
                    />
                    <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-xl border-4 border-white shadow-lg ${admin.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                        <Shield size={16} className="text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tight">{admin.name}</h2>
                <p className="text-slate-400 font-medium">{admin.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <InfoRow icon={Phone} label="Phone Number" value={admin.phone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={new Date(admin.dob).toLocaleDateString()} />
                <InfoRow icon={Shield} label="Account Status" value={admin.status} isStatus />
                <InfoRow icon={MapPin} label="Office Address" value={admin.address} />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600" /> Verification ID Proof
                    </h4>
                    {admin.verificationDocument?.url && (
                        <a href={admin.verificationDocument.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:scale-110 transition-transform">
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>
                
                <div className="bg-slate-100 rounded-[2rem] p-3 border-2 border-dashed border-slate-200 overflow-hidden min-h-[200px] flex items-center justify-center">
                    {admin.verificationDocument?.url ? (
                        isPDF ? (
                            <iframe src={`${admin.verificationDocument.url}#toolbar=0`} className="w-full h-[400px] rounded-2xl" title="ID Proof" />
                        ) : (
                            <img src={admin.verificationDocument.url} alt="ID Proof" className="w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-sm" />
                        )
                    ) : (
                        <div className="text-center py-10">
                            <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No Document Available</p>
                        </div>
                    )}
                </div>
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
                <p className="text-slate-600 mb-6">Temporary password generated:</p>
                <div className="relative">
                    <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-indigo-200 font-mono text-2xl font-bold text-indigo-600">
                        {password}
                    </div>
                    <button onClick={copyToClipboard} className="absolute top-2 right-2 p-2 bg-white shadow-md rounded-xl text-indigo-600 hover:bg-indigo-50">
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl transition-all uppercase tracking-widest">Done</button>
            </div>
        </ModalWrapper>
    );
};

export default function SubAdmins() {
    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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
            const data = await response.json();
            setSubAdmins(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); } 
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
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
            <Loader2 className="animate-spin mb-4 text-indigo-600" size={48} />
            <p className="font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Sub-Admins</h1>
                        <p className="text-slate-500 font-medium mt-1">Management console for team permissions</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input type="text" placeholder="Search admins..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                            <UserPlus size={20} /> Add Admin
                        </button>
                    </div>
                </header>

                <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[11px] font-black tracking-widest">
                                    <th className="px-8 py-6">Admin Detail</th>
                                    <th className="px-8 py-6">Contact</th>
                                    <th className="px-8 py-6 text-center">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAdmins.map((admin, idx) => (
                                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img src={admin.profilePicture?.url || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                                                <div>
                                                    <p className="font-black text-slate-800 tracking-tight">{admin.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: {admin._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-medium text-slate-600">{admin.email}</div>
                                            <div className="text-xs text-slate-400">{admin.phone}</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button onClick={() => openConfirmModal(admin, () => handleStatusToggle(admin), `Change status for ${admin.name}?`)} className={`relative h-6 w-11 rounded-full transition-colors ${admin.status === 'active' ? 'bg-green-500' : 'bg-slate-200'}`}>
                                                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${admin.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelectedAdmin(admin); setIsDetailsModalOpen(true); }} className="p-3 bg-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Eye size={18} /></button>
                                                <button onClick={() => openConfirmModal(admin, () => handleDelete(admin._id), `Delete ${admin.name} permanently?`)} className="p-3 bg-slate-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddSubAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />
            <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} admin={selectedAdmin} />
            <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={() => { confirmAction(); setIsConfirmModalOpen(false); }} title="Confirm Action" message={confirmMessage} />
            <PasswordDisplayModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} password={newAdminPassword} />
        </div>
    );
}