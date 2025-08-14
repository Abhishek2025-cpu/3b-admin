// src/components/ManageStaff.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaUsers, FaPen, FaTrash, FaEye, FaPlus, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// API Endpoints
const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api/staff';

// --- Reusable UI Components ---

const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#6f42c1] rounded-full animate-spin"></div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <nav className="flex justify-center mt-6 gap-2 flex-wrap">
        {pageNumbers.map((number) => (
          <button key={number} onClick={() => onPageChange(number)} className={`px-4 py-2 font-semibold text-white rounded-md transition-colors ${ currentPage === number ? 'bg-[#4b2a82]' : 'bg-[#6f42c1] hover:bg-[#59359a]' }`} disabled={currentPage === number}>
            {number}
          </button>
        ))}
      </nav>
    );
};

// --- Modal Components ---

// MODIFIED: AadharImageModal now has no dark background (light-box style)
const AadharImageModal = ({ imageUrl, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex justify-center items-center p-4 pointer-events-none" onClick={onClose}>
            <div className="relative pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <img src={imageUrl} alt="Aadhar Card" className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl border-4 border-white" />
                <button onClick={onClose} className="absolute -top-5 -right-5 bg-white text-black rounded-full w-10 h-10 font-bold text-2xl flex items-center justify-center leading-none shadow-lg hover:scale-110 transition-transform">&times;</button>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex justify-center items-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm pointer-events-auto border-2 border-indigo-200">
                <p className="text-lg mb-4 text-gray-800 font-medium">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const UpdateStaffModal = ({ staff, isOpen, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => { if (staff) setFormData({ name: staff.name || '', mobile: staff.mobile || '', role: staff.role || '', otherRole: staff.otherRole || '', dob: staff.dob ? new Date(staff.dob).toISOString().split('T')[0] : '', adharNumber: staff.adharNumber || '', adharImage: null }); }, [staff]);
  if (!isOpen) return null;
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setFormData(prev => ({ ...prev, adharImage: e.target.files[0] }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key]) data.append(key, formData[key]) });
    try {
      const response = await fetch(`${API_BASE_URL}/update-employees/${staff._id}`, { method: 'PATCH', body: data });
      if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to update employee'); }
      toast.success('Employee updated successfully!');
      onUpdateSuccess();
    } catch (error) { toast.error(`Update failed: ${error.message}`); } 
    finally { setIsSubmitting(false); }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"><h5 className="text-xl font-semibold p-4 border-b">Update Employee</h5><form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden"><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto"><div><label className="block mb-1 font-medium">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div><div><label className="block mb-1 font-medium">Mobile</label><input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 border rounded" required /></div><div><label className="block mb-1 font-medium">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white" required><option value="">Select Role</option><option value="Helper">Helper</option><option value="Operator">Operator</option><option value="Mixture">Mixture</option><option value="Other">Other</option></select></div>{formData.role === 'Other' && <div><label className="block mb-1 font-medium">Other Role</label><input type="text" name="otherRole" value={formData.otherRole} onChange={handleChange} className="w-full p-2 border rounded" /></div>}<div><label className="block mb-1 font-medium">DOB</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" /></div><div><label className="block mb-1 font-medium">Aadhar Number</label><input type="text" name="adharNumber" value={formData.adharNumber} onChange={handleChange} className="w-full p-2 border rounded" /></div><div><label className="block mb-1 font-medium">New Aadhar Image (Optional)</label><input type="file" name="adharImage" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" /></div></div><div className="p-4 border-t mt-auto flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update'}</button></div></form></div>
    </div>
  );
};


// MODIFIED: EmployeeDetails now includes a clickable Aadhar image
const EmployeeDetails = ({ staff, onImageClick }) => {
    if (!staff) return null;
    return (
        <div className="bg-slate-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <div>
                <p className="font-semibold text-gray-600">Mobile:</p>
                <p className="text-gray-800">{staff.mobile || 'N/A'}</p>
            </div>
            <div>
                <p className="font-semibold text-gray-600">Aadhar Number:</p>
                <p className="text-gray-800 font-mono">{staff.adharNumber || 'N/A'}</p>
            </div>
            <div className="flex gap-4">
                {staff.adharImageUrl && (
                    <div>
                        <p className="font-semibold text-gray-600 mb-1">Aadhar:</p>
                        <img 
                            src={staff.adharImageUrl} 
                            alt="Aadhar thumbnail" 
                            className="w-24 h-16 object-cover rounded-md border-2 border-gray-300 cursor-pointer hover:border-[#6f42c1] transition"
                            onClick={() => onImageClick(staff.adharImageUrl)}
                        />
                    </div>
                )}
                 <div>
                    <p className="font-semibold text-gray-600 mb-1">Status History:</p>
                    {staff.statusHistory && staff.statusHistory.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-sm max-h-24 overflow-y-auto bg-white p-2 rounded-md border">
                            {staff.statusHistory.slice().reverse().map(history => (
                                <li key={history._id}>
                                    <span className={`font-bold ${history.status ? 'text-green-600' : 'text-red-500'}`}>{history.status ? 'Active' : 'Inactive'}</span>
                                    {' on '}
                                    <span className="text-gray-700">{new Date(history.changedAt).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-gray-500">No history.</p>}
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewingAadharUrl, setViewingAadharUrl] = useState('');
  const [isAadharModalOpen, setIsAadharModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const rowsPerPage = 10;
  
  const fetchStaff = useCallback(async () => {
    if (staffList.length === 0) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-employees`);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setStaffList(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (err) { setError(err.message || 'Failed to fetch staff data.'); } 
    finally { setLoading(false); }
  }, [staffList.length]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffList;
    const lowercasedQuery = searchQuery.toLowerCase();
    return staffList.filter(staff => Object.values(staff).some(value => String(value).toLowerCase().includes(lowercasedQuery)));
  }, [staffList, searchQuery]);
  
  const staffSummary = useMemo(() => {
    const roleCounts = staffList.reduce((acc, staff) => {
        const role = staff.role || 'Unassigned';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});
    return { totalStaff: staffList.length, roles: Object.keys(roleCounts).sort(), roleCounts };
  }, [staffList]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  
  const paginatedStaff = useMemo(() => filteredStaff.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredStaff, currentPage, rowsPerPage]);
  
  const totalPages = useMemo(() => Math.ceil(filteredStaff.length / rowsPerPage), [filteredStaff.length, rowsPerPage]);
const handleDelete = useCallback(async (staffId) => {
    // 1. Confirm with the user before deleting
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
        return; // If the user clicks "Cancel", stop the function
    }

    try {
        // 2. Make the API call to the delete endpoint
        const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/staff/delete-employees/${staffId}`, {
            method: 'DELETE',
        });

        // 3. Handle the response
        if (response.ok) {
            // If deletion is successful
            alert('Staff member deleted successfully.'); // You can replace this with your custom Alert component
            
            // 4. Refresh the staff list to update the UI
            fetchStaff(); 

        } else {
            // If the server returns an error (e.g., staff not found)
            const errorData = await response.json();
            alert(errorData.message || 'Failed to delete staff member.');
            console.error('Server error on delete:', errorData);
        }
    } catch (error) {
        // 5. Handle network errors (e.g., no internet connection)
        console.error('Network error on delete:', error);
        alert('An error occurred. Please check your network and try again.');
    }
}, [fetchStaff]); // fetchStaff is a necessary dependency to refresh the list
  
  const handleToggleStatus = async () => {
    if (!selectedStaff) return;
    const newStatus = !(selectedStaff.status ?? false);
    handleCloseModals();
    const promise = fetch(`${API_BASE_URL}/employees/${selectedStaff._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).then(res => {
      if (!res.ok) { return res.json().then(err => { throw new Error(err.message || 'API request failed') }); }
      return res.json();
    });

    await toast.promise(promise, {
      loading: 'Updating status...',
      success: (data) => {
        fetchStaff();
        return data.message || 'Status updated successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const handleOpenUpdateModal = (staff) => { setSelectedStaff(staff); setIsUpdateModalOpen(true); };
  const handleOpenAadharModal = (url) => { setViewingAadharUrl(url); setIsAadharModalOpen(true); };
  const handleOpenConfirmModal = (staff) => { setSelectedStaff(staff); setIsConfirmModalOpen(true); };
  const handleToggleDetailsRow = (staffId) => { setExpandedRowId(prevId => (prevId === staffId ? null : staffId)); };
  
  const handleCloseModals = () => {
    setIsUpdateModalOpen(false);
    setIsAadharModalOpen(false);
    setIsConfirmModalOpen(false);
    setSelectedStaff(null);
    setViewingAadharUrl('');
  };
  
  const handleUpdateSuccess = () => { handleCloseModals(); fetchStaff(); };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4"><h2 className="text-3xl font-bold text-[#6f42c1] flex items-center gap-3"><FaUsers /> Manage Staff</h2><button onClick={() => alert("Navigate to Add Staff page")} className="bg-[#6f42c1] hover:bg-[#59359a] text-white font-bold py-2 px-5 rounded-lg shadow-md flex items-center gap-2 transition-colors"><FaPlus /> Add Staff</button></div>
        <input type="text" placeholder="Search by any field..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-lg mb-6 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f42c1]" />
        
        {loading ? <Loader /> : error ? <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div> : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-[#f3f0fa] text-[#6f42c1]">
                  <tr>
                    {['Sr.', 'Name', 'Role', 'EID', 'Joined', 'Actions'].map(h => <th key={h} className="p-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map((staff, index) => (
                      <React.Fragment key={staff._id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                          <td className="p-3 font-semibold text-gray-800">{staff.name || '-'}</td>
                          <td className="p-3">{staff.role || '-'}</td>
                          <td className="p-3 font-mono">{staff.eid || '-'}</td>
                          <td className="p-3">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : '-'}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-4">
                              <button onClick={() => handleToggleDetailsRow(staff._id)} title="View Details" className="p-1">
                                {expandedRowId === staff._id ? <FaEyeSlash className="text-gray-600"/> : <FaEye className="text-gray-500 hover:text-gray-800"/>}
                              </button>
                              <label className="relative inline-flex items-center cursor-pointer" title={staff.status ? 'Deactivate' : 'Activate'}>
                                  <input type="checkbox" checked={staff.status ?? false} onChange={() => handleOpenConfirmModal(staff)} className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6f42c1]"></div>
                              </label>
                              {/* <FaPen onClick={() => handleOpenUpdateModal(staff)} className="cursor-pointer text-blue-600 hover:text-blue-800" title="Edit" size={18} /> */}
                              <FaTrash onClick={() => handleDelete(staff._id)} className="cursor-pointer text-red-600 hover:text-red-800" title="Delete" size={18} />
                            </div>
                          </td>
                        </tr>
                        {expandedRowId === staff._id && (
                            <tr className="border-b">
                                <td colSpan="6" className="p-0">
                                    <EmployeeDetails staff={staff} onImageClick={handleOpenAadharModal} />
                                /</td>
                            </tr>
                        )}
                      </React.Fragment>
                    )) }
                </tbody>
              </table>
            </div>
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-[#6f42c1] mb-4">Staff Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Staff</p><p className="text-2xl font-bold">{staffSummary.totalStaff}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Roles</p><p className="text-2xl font-bold">{staffSummary.roles.length}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                        <p className="text-sm text-gray-500 mb-2">Role Breakdown</p>
                        <div className="space-y-1 text-sm">{staffSummary.roles.map(role => (<div key={role} className="flex justify-between"><span>{role}:</span><span className="font-semibold">{staffSummary.roleCounts[role]}</span></div>))}</div>
                    </div>
                </div>
            </div>
          </>
        )}
      </div>

      <UpdateStaffModal isOpen={isUpdateModalOpen} onClose={handleCloseModals} onUpdateSuccess={handleUpdateSuccess} staff={selectedStaff} />
      <AadharImageModal isOpen={isAadharModalOpen} onClose={handleCloseModals} imageUrl={viewingAadharUrl} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseModals} onConfirm={handleToggleStatus} message={`Are you sure you want to ${selectedStaff?.status ? 'DEACTIVATE' : 'ACTIVATE'} this employee?`} />
    </div>
  );
}

export default ManageStaff;