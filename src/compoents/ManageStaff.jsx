// src/components/ManageStaff.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaUsers, FaPen, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 font-semibold text-white rounded-md transition-colors ${
            currentPage === number ? 'bg-[#4b2a82]' : 'bg-[#6f42c1] hover:bg-[#59359a]'
          }`}
          disabled={currentPage === number}
        >
          {number}
        </button>
      ))}
    </nav>
  );
};

// --- Modal Components ---

const AadharImageModal = ({ imageUrl, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        // SOLUTION: Ensured modal has a dark overlay
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="relative" onClick={(e) => e.stopPropagation()}><img src={imageUrl} alt="Aadhar Card" className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-lg" /><button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full w-9 h-9 font-bold text-2xl flex items-center justify-center leading-none">&times;</button></div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        // SOLUTION: Ensured modal has a dark overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <p className="text-lg mb-4">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm</button>
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
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => { if (formData[key]) data.append(key, formData[key]) });
    try {
      const response = await fetch(`${API_BASE_URL}/update-employees/${staff._id}`, { method: 'PATCH', body: data });
      if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to update employee'); }
      alert('Employee updated successfully!');
      onUpdateSuccess();
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    // SOLUTION: Ensured modal has a dark overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <h5 className="text-xl font-semibold p-4 border-b">Update Employee</h5>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            <div><label className="block mb-1 font-medium">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div><label className="block mb-1 font-medium">Mobile</label><input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div><label className="block mb-1 font-medium">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white" required><option value="">Select Role</option><option value="Helper">Helper</option><option value="Operator">Operator</option><option value="Mixture">Mixture</option><option value="Other">Other</option></select></div>
            {formData.role === 'Other' && <div><label className="block mb-1 font-medium">Other Role</label><input type="text" name="otherRole" value={formData.otherRole} onChange={handleChange} className="w-full p-2 border rounded" /></div>}
            <div><label className="block mb-1 font-medium">DOB</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            <div><label className="block mb-1 font-medium">Aadhar Number</label><input type="text" name="adharNumber" value={formData.adharNumber} onChange={handleChange} className="w-full p-2 border rounded" /></div>
            <div><label className="block mb-1 font-medium">New Aadhar Image (Optional)</label><input type="file" name="adharImage" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" /></div>
          </div>
          <div className="p-4 border-t mt-auto flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update'}</button></div>
        </form>
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

  const rowsPerPage = 10;
  
  const fetchStaff = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-employees`);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setStaffList(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch staff data.');
    } finally {
      setLoading(false);
    }
  }, []);

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
  const paginatedStaff = useMemo(() => filteredStaff.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredStaff, currentPage]);
  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const handleDelete = useCallback(async (staffId) => {
    if (window.confirm('Are you sure you want to PERMANENTLY DELETE this employee?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete-employees/${staffId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete.');
        alert('Employee deleted successfully.');
        fetchStaff();
      } catch (err) {
        alert(`Error deleting employee: ${err.message}`);
      }
    }
  }, [fetchStaff]);
  
  const handleToggleStatus = useCallback(async () => {
    if (!selectedStaff) return;
    try {
        const response = await fetch(`${API_BASE_URL}/toggle-status/${selectedStaff._id}`, { method: 'PATCH' });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to update status.');
        }
        alert('Status updated successfully.');
        fetchStaff();
    } catch (err) {
        alert(`Error updating status: ${err.message}`);
    } finally {
        handleCloseModals();
    }
  }, [selectedStaff, fetchStaff]);

  const handleOpenUpdateModal = (staff) => { setSelectedStaff(staff); setIsUpdateModalOpen(true); };
  const handleOpenAadharModal = (url) => { setViewingAadharUrl(url); setIsAadharModalOpen(true); };
  const handleOpenConfirmModal = (staff) => { setSelectedStaff(staff); setIsConfirmModalOpen(true); };

  const handleCloseModals = () => {
    setIsUpdateModalOpen(false); setIsAadharModalOpen(false); setIsConfirmModalOpen(false);
    setSelectedStaff(null); setViewingAadharUrl('');
  };

  const handleUpdateSuccess = () => { handleCloseModals(); fetchStaff(); };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-[#6f42c1] flex items-center gap-3"><FaUsers /> Manage Staff</h2>
            <button onClick={() => alert("Navigate to Add Staff page")} className="bg-[#6f42c1] hover:bg-[#59359a] text-white font-bold py-2 px-5 rounded-lg shadow-md flex items-center gap-2 transition-colors"><FaPlus /> Add Staff</button>
        </div>
        <input type="text" placeholder="Search by any field (Name, Role, EID, Phone...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-lg mb-6 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f42c1]" />
        
        {loading ? <Loader /> : error ? <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div> : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-[#f3f0fa] text-[#6f42c1]">
                  <tr>
                    {/* SOLUTION: Removed the 'Status' text column */}
                    {['Sr.', 'Name', 'Role', 'DOB', 'DOJ', 'EID', 'Aadhar Img', 'Status Updated', 'Actions'].map(h => <th key={h} className="p-3">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.length > 0 ? paginatedStaff.map((staff, index) => (
                      <tr key={staff._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td className="p-3">{staff.name || '-'}</td>
                        <td className="p-3">{staff.role || '-'}</td>
                        <td className="p-3">{staff.dob ? new Date(staff.dob).toLocaleDateString() : '-'}</td>
                        <td className="p-3">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : '-'}</td>
                        <td className="p-3">{staff.eid || '-'}</td>
                        <td className="p-3 text-center">{staff.adharImageUrl ? <button onClick={() => handleOpenAadharModal(staff.adharImageUrl)} className="text-blue-600 hover:text-blue-800"><FaEye size={20} /></button> : '-'}</td>
                        <td className="p-3">{staff.statusUpdatedAt ? new Date(staff.statusUpdatedAt).toLocaleString() : 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-4">
                            {/* SOLUTION: Styled toggle switch */}
                            <label className="relative inline-flex items-center cursor-pointer" title={staff.isActive ?? true ? 'Deactivate' : 'Activate'}>
                                <input type="checkbox" checked={staff.isActive ?? true} onChange={() => handleOpenConfirmModal(staff)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6f42c1]"></div>
                            </label>
                            <FaPen onClick={() => handleOpenUpdateModal(staff)} className="cursor-pointer text-blue-600 hover:text-blue-800" title="Edit" size={18} />
                            <FaTrash onClick={() => handleDelete(staff._id)} className="cursor-pointer text-red-600 hover:text-red-800" title="Delete" size={18} />
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="9" className="text-center p-6 text-gray-500">No staff data available.</td></tr>}
                </tbody>
              </table>
            </div>
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-[#6f42c1] mb-4">Staff Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Staff</p><p className="text-2xl font-bold">{staffSummary.totalStaff}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Total Roles</p><p className="text-2xl font-bold">{staffSummary.roles.length}</p></div>
                    <div className="p-4 bg-gray-50 rounded-lg col-span-1 lg:col-span-1"><p className="text-sm text-gray-500 mb-2">Role Breakdown</p><div className="space-y-1 text-sm">{staffSummary.roles.map(role => (<div key={role} className="flex justify-between"><span>{role}:</span><span className="font-semibold">{staffSummary.roleCounts[role]}</span></div>))}</div></div>
                </div>
            </div>
          </>
        )}
      </div>

      <UpdateStaffModal isOpen={isUpdateModalOpen} onClose={handleCloseModals} onUpdateSuccess={handleUpdateSuccess} staff={selectedStaff} />
      <AadharImageModal isOpen={isAadharModalOpen} onClose={handleCloseModals} imageUrl={viewingAadharUrl} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={handleCloseModals} onConfirm={handleToggleStatus} message={`Are you sure you want to ${selectedStaff?.isActive ?? true ? 'deactivate' : 'activate'} this employee?`} />
    </div>
  );
}

export default ManageStaff;