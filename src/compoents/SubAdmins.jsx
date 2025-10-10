import React, { useState, useEffect, useMemo } from 'react';

// --- Configuration ---
const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api/sub-admin';

// --- Helper Components & Icons (Unchanged) ---
// Assuming these are defined elsewhere or inline for brevity.
// If you need actual icon components, please provide their definitions.
const ViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const Spinner = () => <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-indigo-600 rounded-full" role="status" aria-label="loading"></div>;

// Eye icon for showing password
const EyeOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

// Eye icon for hiding password
const EyeClosedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414L5.586 7H4a1 1 0 00-.894 1.447l.858 1.716C4.981 11.258 5 11.667 5 12a5 5 0 008.207 3.82L17.293 18.293a1 1 0 101.414-1.414L3.707 2.293zm9.176 9.176a3 3 0 01-4.243-4.243L12.586 7H16a1 1 0 00.894-1.447l-1.45-2.9A1 1 0 0015 2h-1a1 1 0 00-.894.553L12.707 4.293 9.793 1.38A1 1 0 008.38 0L.707 7.673a1 1 0 001.414 1.414L7 3.414 12.08 8.5a1 1 0 001.414 0 1 1 0 000-1.414L9 1.414 2.414 8.086 1.707 7.379 0 9.086 7.673 16.759a1 1 0 001.414 0 1 1 0 000-1.414L8.414 14l1.293-1.293z" clipRule="evenodd" />
    </svg>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-20 p-4 pointer-events-none">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 pointer-events-auto">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

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
            // onClose(); // Close only after successful password display
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-40  bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800  ">Add New Sub-Admin</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required className="p-2 border rounded-md" />
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="p-2 border rounded-md" />
                        <input type="tel" name="phone" placeholder="Phone Number" onChange={handleChange} required className="p-2 border rounded-md" />
                        <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required className="p-2 border rounded-md" />
                    </div>
                    <textarea name="address" placeholder="Address" onChange={handleChange} className="w-full p-2 border rounded-md"></textarea>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Verification Document (Image)</label>
                        <input type="file" onChange={handleFileChange} required accept="image/png, image/jpeg, image/jpg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#6F42C1] text-white rounded-md disabled:bg-indigo-300">
                            {isSubmitting ? 'Submitting...' : 'Add Sub-Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// New Password Display Modal
const PasswordDisplayModal = ({ isOpen, onClose, password }) => {
    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        alert('Password copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Sub-Admin Created Successfully!</h2>
                <p className="text-gray-700 mb-2">The auto-generated password for the new sub-admin is:</p>
                <div className="flex items-center bg-gray-100 p-3 rounded-md border border-gray-300">
                    <span className="flex-grow font-mono text-lg text-gray-900 break-all select-all">{password}</span>
                    <button
                        onClick={copyToClipboard}
                        className="ml-4 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                        title="Copy to clipboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        <span className="ml-1 hidden sm:inline">Copy</span>
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Please save this password securely. It will be required for the sub-admin's first login.</p>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Done</button>
                </div>
            </div>
        </div>
    );
};


const DetailsModal = ({ isOpen, onClose, admin }) => {
    // New state to toggle password visibility - DEFAULT TO TRUE (PASSWORD IS SHOWN)
    const [showPassword, setShowPassword] = useState(true);

    if (!isOpen || !admin) return null;

    return (
        <div className="fixed inset-0 z-40 flex justify-center items-start pt-20 p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 pointer-events-auto">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">{admin.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
                    <div className="md:col-span-2 flex items-center justify-center mb-2">
                        <img src={admin.profilePicture?.url || 'https://via.placeholder.com/150'} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200" />
                    </div>
                    <div><strong className="text-gray-900">Email:</strong><br/>{admin.email}</div>
                    <div><strong className="text-gray-900">Phone:</strong><br/>{admin.phone}</div>
                    <div><strong className="text-gray-900">Date of Birth:</strong><br/>{new Date(admin.dob).toLocaleDateString()}</div>
                    <div><strong className="text-gray-900">Status:</strong><br/><span className={`capitalize font-semibold ${admin.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{admin.status}</span></div>
                    <div className="md:col-span-2"><strong className="text-gray-900">Address:</strong><br/>{admin.address}</div>
                    {/* Updated Password Field with Show/Hide Toggle */}
                    <div className="md:col-span-2">
                        {/* <strong className="text-gray-900">Password (Auto-generated):</strong><br/>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={admin.autoGeneratedPassword}
                                readOnly
                                className="w-full p-2 pr-10 border rounded-md bg-gray-100 text-gray-700 font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 p-1 text-gray-500 hover:text-gray-800"
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                            </button>
                        </div> */}
                        {/* <p className="text-xs text-gray-500 mt-1">
                            Note: This is the initial auto-generated password.
                        </p> */}
                    </div>
                    <div className="md:col-span-2"><strong className="text-gray-900">Permissions:</strong><br/>{admin.permissions.join(', ')}</div>
                    <div><strong className="text-gray-900">Created At:</strong><br/>{new Date(admin.createdAt).toLocaleString()}</div>
                    <div><strong className="text-gray-900">Last Updated:</strong><br/>{new Date(admin.updatedAt).toLocaleString()}</div>
                    <div className="md:col-span-2"><strong className="text-gray-900">Verification Document:</strong><br/>
                        <a href={admin.verificationDocument.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                            View Document
                        </a>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- The Main Component ---
function SubAdmins() {
    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    // New state for password display modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newAdminPassword, setNewAdminPassword] = useState('');

    const fetchSubAdmins = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/sub-admins`);
            if (!response.ok) throw new Error('Failed to fetch sub-admins.');
            const data = await response.json();
            setSubAdmins(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => { fetchSubAdmins(); }, []);

    const handleAdd = async (formData) => {
        const response = await fetch(`${API_BASE_URL}/register`, { method: 'POST', body: formData });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Registration failed.');
        }
        const responseData = await response.json(); // Get the response data
        
        // Handle password display
        if (responseData.autoGeneratedPassword) {
            setNewAdminPassword(responseData.autoGeneratedPassword);
            setIsPasswordModalOpen(true);
        }

        await fetchSubAdmins(); // Refresh the list of sub-admins
        setIsAddModalOpen(false); // Close the add modal after successful submission
    };

    const handleStatusToggle = async (admin) => {
        const newStatus = admin.status === 'active' ? 'inactive' : 'active';
        try {
            const response = await fetch(`${API_BASE_URL}/status/${admin._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
            if (!response.ok) throw new Error('Failed to update status.');
            setSubAdmins(subAdmins.map(sa => sa._id === admin._id ? { ...sa, status: newStatus } : sa));
        } catch (err) { alert(err.message); }
    };
    
    const handleDelete = async (adminId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/delete/${adminId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete sub-admin.');
            setSubAdmins(subAdmins.filter(sa => sa._id !== adminId));
        } catch (err) { alert(err.message); }
    };

    const openConfirmModal = (admin, action, message) => {
        setSelectedAdmin(admin);
        setConfirmAction(() => action);
        setConfirmMessage(message);
        setIsConfirmModalOpen(true);
    };

    const openDetailsModal = (admin) => {
        // When opening details, ensure the autoGeneratedPassword is part of the selectedAdmin
        // This is a simplification; in a real app, you wouldn't keep plain passwords in state
        // and would retrieve it securely or not display it at all.
        setSelectedAdmin({ ...admin, autoGeneratedPassword: newAdminPassword || admin.autoGeneratedPassword });
        setIsDetailsModalOpen(true);
    };

    const onConfirm = () => {
        if (selectedAdmin && confirmAction) {
            confirmAction(selectedAdmin);
        }
        setIsConfirmModalOpen(false);
        setSelectedAdmin(null);
        setConfirmAction(null);
    };

    const filteredAdmins = useMemo(() => {
        if (!searchQuery) return subAdmins;
        return subAdmins.filter(admin => admin.name.toLowerCase().includes(searchQuery.toLowerCase()) || admin.email.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [subAdmins, searchQuery]);

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /><p className="ml-4 text-xl">Loading Sub-Admins...</p></div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

    return (
        <>
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Sub-Admin Management</h1>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"/>
                            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-[#6F42C1] text-white font-semibold rounded-lg shadow-md">Add Sub-Admin</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Phone</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdmins.length > 0 ? filteredAdmins.map(admin => (
                                    <tr key={admin._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <img src={admin.profilePicture?.url || 'https://via.placeholder.com/40'} alt={admin.name} className="w-10 h-10 rounded-full object-cover" />
                                            {admin.name}
                                        </td>
                                        <td className="px-6 py-4">{admin.email}</td>
                                        <td className="px-6 py-4">{admin.phone}</td>
                                        <td className="px-6 py-4 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={admin.status === 'active'}
                                                    onChange={() => openConfirmModal(
                                                        admin,
                                                        () => handleStatusToggle(admin),
                                                        `Are you sure you want to change status to '${admin.status === 'active' ? 'inactive' : 'active'}'?`
                                                    )}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                            </label>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-4">
                                                <button onClick={() => openDetailsModal(admin)} title="View Details" className="text-blue-600 hover:text-blue-800"><ViewIcon /></button>
                                                <button
                                                    onClick={() => openConfirmModal(
                                                        admin,
                                                        () => handleDelete(admin._id),
                                                        `This will permanently delete ${admin.name}. This action cannot be undone.`
                                                    )}
                                                    title="Delete" className="text-red-600 hover:text-red-800"><DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No sub-admins found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddSubAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAdd} />
            <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} admin={selectedAdmin} />
            <ConfirmModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={onConfirm} title="Confirm Action" message={confirmMessage} />
            {/* Password Display Modal */}
            <PasswordDisplayModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                password={newAdminPassword}
            />
        </>
    );
}

export default SubAdmins;