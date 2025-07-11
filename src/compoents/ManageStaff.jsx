import React, { useState, useEffect, useMemo } from 'react';
import { FaUsers, FaPen, FaTrash, FaEye } from 'react-icons/fa';

// API Endpoints - It's good practice to define these at the top
// Note: The original code used different domains for GET and DELETE/PATCH. 
// I'm using the one from the GET request for consistency. Please adjust if needed.
const API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api/staff';

// --- Reusable Components ---

const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <div
      // Replicating the .loader style with Tailwind
      className="w-10 h-10 border-4 border-gray-200 border-t-[#6f42c1] rounded-full animate-spin"
    ></div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center mt-6 gap-2 flex-wrap">
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          // Replicating .pagination-container button styles
          className={`px-4 py-2 font-semibold text-white rounded-md transition-colors
            ${currentPage === number ? 'bg-[#4b2a82]' : 'bg-[#6f42c1] hover:bg-[#59359a]'}
            disabled:bg-gray-400 disabled:cursor-not-allowed`}
          disabled={currentPage === number}
        >
          {number}
        </button>
      ))}
    </nav>
  );
};

const UpdateStaffModal = ({ staff, isOpen, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When the modal opens, populate the form with the staff member's data
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        mobile: staff.mobile || '',
        role: staff.role || '',
        otherRole: staff.otherRole || '',
        // Format date for <input type="date"> which needs 'YYYY-MM-DD'
        dob: staff.dob ? new Date(staff.dob).toISOString().split('T')[0] : '',
        adharNumber: staff.adharNumber || '',
        adharImage: null,
      });
    }
  }, [staff]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, adharImage: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) { // Only append if value exists
        data.append(key, formData[key]);
      }
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/update-employees/${staff._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update employee');
      }

      alert('Employee updated successfully!');
      onUpdateSuccess(); // This will trigger a data refresh in the parent
    } catch (error) {
      console.error('Update Error:', error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h5 className="text-xl font-semibold">Update Employee</h5>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            {/* Form Fields */}
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Mobile</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white" required>
                <option value="">Select Role</option>
                <option value="Helper">Helper</option>
                <option value="Operator">Operator</option>
                <option value="Mixture">Mixture</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {formData.role === 'Other' && (
              <div>
                <label className="block mb-1 font-medium">Other Role</label>
                <input type="text" name="otherRole" value={formData.otherRole} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium">DOB</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Aadhar Number</label>
              <input type="text" name="adharNumber" value={formData.adharNumber} onChange={handleChange} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Aadhar Image (Optional)</label>
              <input type="file" name="adharImage" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200" />
            </div>
          </div>
          <div className="p-4 border-t mt-auto flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-employees`);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setStaffList(Array.isArray(data) ? data.reverse() : []); // Show newest first
    } catch (err) {
      setError(err.message || 'Failed to fetch staff data.');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff =>
      (staff.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.eid?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [staffList, searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredStaff.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStaff, currentPage]);

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/delete-employees/${staffId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete.');
        alert('Employee deleted successfully.');
        fetchStaff(); // Re-fetch the list after deleting
      } catch (err) {
        alert('Error deleting employee.');
        console.error('Delete Error:', err);
      }
    }
  };

  const handleOpenUpdateModal = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const handleUpdateSuccess = () => {
    handleCloseModal();
    fetchStaff(); // Re-fetch data to show the update
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-[#6f42c1] mb-6 flex items-center gap-3">
          <FaUsers /> Manage Staff
        </h2>

        <input
          type="text"
          placeholder="Search by Name or EID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          // Replicating .search-bar and .form-control styles
          className="w-full max-w-md mb-6 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f42c1]"
        />

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500 text-lg bg-red-100 p-4 rounded-md">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-[#f3f0fa] text-[#6f42c1]">
                  <tr>
                    <th className="p-3">Sr. No</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">DOB</th>
                    <th className="p-3">EID</th>
                    <th className="p-3">Password</th>
                    <th className="p-3">Aadhar No</th>
                    <th className="p-3">Aadhar Img</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.length > 0 ? (
                    paginatedStaff.map((staff, index) => (
                      <tr key={staff._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                        <td className="p-3">{staff.name || '-'}</td>
                        <td className="p-3">{staff.mobile || '-'}</td>
                        <td className="p-3">{staff.role || '-'}</td>
                        <td className="p-3">{staff.dob ? new Date(staff.dob).toLocaleDateString() : '-'}</td>
                        <td className="p-3">{staff.eid || '-'}</td>
                        <td className="p-3">{staff.password || '-'}</td>
                        <td className="p-3">{staff.adharNumber || '-'}</td>
                        <td className="p-3">
                          {staff.adharImageUrl ? (
                            <a href={staff.adharImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              <FaEye size={20} />
                            </a>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-4">
                            <FaPen
                              onClick={() => handleOpenUpdateModal(staff)}
                              className="cursor-pointer text-[#6f42c1] hover:text-[#a078e3] transition-colors"
                              title="Edit"
                              size={18}
                            />
                            <FaTrash
                              onClick={() => handleDelete(staff._id)}
                              className="cursor-pointer text-[#b32a6f] hover:text-red-500 transition-colors"
                              title="Delete"
                              size={18}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center p-6 text-gray-500">
                        No staff data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <UpdateStaffModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateSuccess={handleUpdateSuccess}
        staff={selectedStaff}
      />
    </div>
  );
}

export default ManageStaff;