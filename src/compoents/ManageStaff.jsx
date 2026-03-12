import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUsers,
  FaPen,
  FaTrash,
  FaEye,
  FaPlus,
  FaEyeSlash,
  FaTimes,
  FaDownload,
  FaCamera,
  FaIdCard,
  FaSearch,
  FaPhoneAlt,
  FaCalendarAlt,
  FaPrint                                                                                                                                
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const API_BASE_URL =
  "https://threebapi-1067354145699.asia-south1.run.app/api/staff";

// --- Components ---

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-fuchsia-500 rounded-full animate-spin-slow opacity-50"></div>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex justify-center mt-8 gap-2 flex-wrap">
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all shadow-sm ${
            currentPage === number
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-violet-300 transform scale-105"
              : "bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-600 border border-gray-100"
          }`}
          disabled={currentPage === number}
        >
          {number}
        </button>
      ))}
    </nav>
  );
};

const AadharImageModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Document</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
            @page { size: auto; margin: 0mm; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-center items-center p-4 backdrop-blur-sm bg-black/60 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Display Card"
          className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
        />
        
        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="absolute -top-4 right-10 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border border-white"
          title="Print Image"
        >
          <FaPrint size={18} />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white text-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors border border-gray-100"
        >
          <FaTimes size={20} />
        </button>
      </div>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-center items-center p-4 backdrop-blur-sm bg-gray-900/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-white/50 animate-in slide-in-from-bottom-5">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            !
          </div>
          <h3 className="text-xl font-bold text-gray-800">Confirmation</h3>
          <p className="text-gray-500 mt-2">{message}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED EDIT MODAL ---
const UpdateStaffModal = ({ staff, isOpen, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    dob: "",
    adharNumber: "",
    password: "",
    role: [],
    otherRoles: "",
    adharImage: null,
    profilePic: null,
  });
  
  // State for Image Previews
  const [previews, setPreviews] = useState({
    profile: null,
    adhar: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // UPDATED: Removed Supervisor & Driver
  const roleOptions = [
    "Helper",
    "Operator",
    "Mixture",
    "Other",
  ];

  useEffect(() => {
    if (staff) {
      // Role logic
      let initialRoles = [];
      if (Array.isArray(staff.role)) {
        initialRoles = [...staff.role];
      } else if (staff.role) {
        initialRoles = [staff.role];
      }

      // Other Roles logic
      let initialOtherRoles = "";
      if (Array.isArray(staff.otherRoles) && staff.otherRoles.length > 0) {
        initialOtherRoles = staff.otherRoles.join(", ");
      } else if (staff.otherRoles) {
        initialOtherRoles = staff.otherRoles;
      }

      setFormData({
        name: staff.name || "",
        mobile: staff.mobile || "",
        dob: staff.dob ? new Date(staff.dob).toISOString().split("T")[0] : "",
        adharNumber: staff.adharNumber || "",
        password: staff.password || "",
        role: initialRoles,
        otherRoles: initialOtherRoles,
        adharImage: null,
        profilePic: null,
      });

      // UPDATED: Set initial previews from existing data
      setPreviews({
        profile: staff.profilePic?.url || null, // Handles object structure
        adhar: staff.adharImageUrl || null      // Handles direct string
      });
    }
  }, [staff]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // UPDATED: File change creates a local preview URL
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({
        ...prev,
        [name === "profilePic" ? "profile" : "adhar"]: objectUrl
      }));
    }
  };

  const handleRoleCheckboxChange = (option) => {
    setFormData((prev) => {
      const currentRoles = prev.role;
      if (currentRoles.includes(option)) {
        return { ...prev, role: currentRoles.filter((r) => r !== option) };
      } else {
        return { ...prev, role: [...currentRoles, option] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("mobile", formData.mobile);
    data.append("dob", formData.dob);
    data.append("adharNumber", formData.adharNumber);
    data.append("password", formData.password);

    formData.role.forEach((r) => {
      data.append("role", r);
    });

    if (formData.otherRoles) {
      data.append("otherRoles", formData.otherRoles);
    }

    if (formData.adharImage) {
      data.append("adharImage", formData.adharImage);
    }
    if (formData.profilePic) {
      data.append("profilePic", formData.profilePic);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/update/${staff._id}`, 
        {
          method: "PUT",
          body: data,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update employee");
      }
      toast.success("Employee updated successfully!");
      onUpdateSuccess();
    } catch (error) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <FaPen className="text-white" />
            </div>
            <h5 className="text-xl font-bold text-white tracking-wide">Update Employee</h5>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden bg-gray-50/50">
          <div className="p-6 overflow-y-auto custom-scrollbar">
            
            {/* Top Section: Images & Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
                
                {/* Images Column */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    
                    {/* Profile Pic Upload */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Profile Picture</label>
                        <div className="relative inline-block group cursor-pointer">
                            <img 
                                src={previews.profile || `https://ui-avatars.com/api/?name=${formData.name}&background=e0e7ff&color=4f46e5`} 
                                alt="Profile Preview" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-violet-100 shadow-md transition-transform group-hover:scale-105"
                            />
                            <label className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-violet-700 transition-colors">
                                <FaCamera size={14} />
                                <input type="file" name="profilePic" onChange={handleFileChange} accept="image/*" className="hidden" />
                            </label>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Click camera icon to change DP</p>
                    </div>

                    {/* Aadhar Image Upload */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                             <FaIdCard /> Aadhar Card
                        </label>
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-32 group">
                             {previews.adhar ? (
                                <img src={previews.adhar} alt="Aadhar" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                             )}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <label className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-gray-100 flex items-center gap-2">
                                    <FaPen /> Upload
                                    <input type="file" name="adharImage" onChange={handleFileChange} accept="image/*" className="hidden" />
                                </label>
                             </div>
                        </div>
                    </div>

                </div>

                {/* Form Fields Column */}
                <div className="w-full md:w-2/3 space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <input
                            type="text" name="name" value={formData.name} onChange={handleChange}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all shadow-sm"
                            required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                            <input
                            type="text" name="mobile" value={formData.mobile} onChange={handleChange}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                            required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                            <input
                            type="date" name="dob" value={formData.dob} onChange={handleChange}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Aadhar Number</label>
                            <input
                            type="text" name="adharNumber" value={formData.adharNumber} onChange={handleChange}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Login Password</label>
                        <input
                            type="text" name="password" value={formData.password} onChange={handleChange}
                            placeholder="Set login password"
                            className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl font-mono text-indigo-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                        />
                    </div>

                    {/* Roles Section */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h6 className="text-sm font-bold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                             Role Assignment
                        </h6>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {roleOptions.map((opt) => (
                                <label key={opt} className={`cursor-pointer border rounded-lg p-2 flex items-center justify-center gap-2 transition-all ${
                                    formData.role.includes(opt) 
                                    ? "bg-violet-100 border-violet-300 text-violet-800 font-bold shadow-sm" 
                                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                }`}>
                                    <input
                                    type="checkbox"
                                    value={opt}
                                    checked={formData.role.includes(opt)}
                                    onChange={() => handleRoleCheckboxChange(opt)}
                                    className="hidden"
                                    />
                                    <span className="text-sm">{opt}</span>
                                </label>
                            ))}
                        </div>

                        {formData.role.includes("Other") && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Custom Role</label>
                                <input
                                    type="text" name="otherRoles" value={formData.otherRoles} onChange={handleChange}
                                    placeholder="e.g. Chef, Manager"
                                    className="w-full p-2 border-b-2 border-orange-200 focus:border-orange-500 outline-none bg-transparent text-gray-800 placeholder-gray-400"
                                />
                            </div>
                        )}
                    </div>

                </div>
            </div>

          </div>

          <div className="p-5 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeDetails = ({ staff, onImageClick }) => {
  if (!staff) return null;
  return (
    <div className="bg-indigo-50/50 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start border-l-4 border-violet-500 animate-in fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600"><FaPhoneAlt /></div>
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Mobile</p>
            <p className="text-gray-800 font-medium">{staff.mobile || "N/A"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600"><FaIdCard /></div>
        <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Aadhar No</p>
            <p className="text-gray-800 font-mono font-medium">{staff.adharNumber || "N/A"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm text-orange-500"><FaUsers /></div>
        <div>
             <p className="text-xs font-bold text-gray-500 uppercase">Custom Roles</p>
             <div className="flex flex-wrap gap-1 mt-0.5">
                 {staff.otherRoles && staff.otherRoles.length > 0 ? (
                     staff.otherRoles.map((r, i) => (
                        <span key={i} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200 font-bold">
                            {r}
                        </span>
                     ))
                 ) : (
                     <span className="text-gray-400 text-sm">-</span>
                 )}
             </div>
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-3 h-px bg-indigo-200 my-1"></div>

      <div className="flex gap-6 col-span-1 md:col-span-3">
        {staff.adharImageUrl && (
          <div className="shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Aadhar Card</p>
            <div className="relative group cursor-pointer" onClick={() => onImageClick(staff.adharImageUrl)}>
                <img
                src={staff.adharImageUrl}
                alt="Aadhar thumbnail"
                className="w-32 h-20 object-cover rounded-lg border-2 border-white shadow-md group-hover:shadow-lg transition-all"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-transparent transition-colors"></div>
            </div>
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Status History</p>
          <div className="bg-white rounded-xl border border-indigo-100 p-3 max-h-32 overflow-y-auto shadow-sm custom-scrollbar">
            {staff.statusHistory && staff.statusHistory.length > 0 ? (
                <ul className="space-y-2">
                {staff.statusHistory
                    .slice()
                    .reverse()
                    .map((history) => (
                    <li key={history._id} className="text-xs flex justify-between items-center border-b border-gray-50 last:border-0 pb-1">
                        <span
                        className={`font-bold px-2 py-0.5 rounded-md ${
                            history.status ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }`}
                        >
                        {history.status ? "Active" : "Inactive"}
                        </span>
                        <span className="text-gray-400 font-mono">
                        {new Date(history.changedAt).toLocaleString()}
                        </span>
                    </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-gray-400 italic">No status changes recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function ManageStaff() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewingAadharUrl, setViewingAadharUrl] = useState("");
  const [isAadharModalOpen, setIsAadharModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const rowsPerPage = 10;

  const fetchStaff = useCallback(async () => {
    if (staffList.length === 0) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/get-employees`);
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      setStaffList(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : []
      );
    } catch (err) {
      setError(err.message || "Failed to fetch staff data.");
    } finally {
      setLoading(false);
    }
  }, [staffList.length]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter((staff) => {
      const basicMatch =
        staff.name?.toLowerCase().includes(q) || staff.mobile?.includes(q);
      const eidMatch = staff.eid?.toLowerCase().includes(q);
      const roleMatch = Array.isArray(staff.role) 
         ? staff.role.some(r => r.toLowerCase().includes(q))
         : false;
      const otherRoleMatch = Array.isArray(staff.otherRoles)
         ? staff.otherRoles.some(r => r.toLowerCase().includes(q))
         : false;

      return basicMatch || eidMatch || roleMatch || otherRoleMatch;
    });
  }, [staffList, searchQuery]);

  const staffSummary = useMemo(() => {
    const roleCounts = {};
    staffList.forEach((staff) => {
      if (Array.isArray(staff.role)) {
        staff.role.forEach(r => {
             roleCounts[r] = (roleCounts[r] || 0) + 1;
        });
      }
    });
    return {
      totalStaff: staffList.length,
      roles: Object.keys(roleCounts).sort(),
      roleCounts,
    };
  }, [staffList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedStaff = useMemo(
    () =>
      filteredStaff.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      ),
    [filteredStaff, currentPage, rowsPerPage]
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredStaff.length / rowsPerPage),
    [filteredStaff.length, rowsPerPage]
  );

  const handleDelete = useCallback(
    async (staffId) => {
      if (!window.confirm("Are you sure you want to delete this staff member?")) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/delete-employees/${staffId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          toast.success("Staff member deleted successfully.");
          fetchStaff();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to delete.");
        }
      } catch (error) {
        toast.error("An error occurred.");
      }
    },
    [fetchStaff]
  );

  const handleToggleStatus = async () => {
    if (!selectedStaff) return;
    const newStatus = !(selectedStaff.status ?? false);
    handleCloseModals();
    const promise = fetch(
      `${API_BASE_URL}/employees/${selectedStaff._id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    ).then((res) => {
      if (!res.ok) throw new Error("API request failed");
      return res.json();
    });

    await toast.promise(promise, {
      loading: "Updating status...",
      success: (data) => {
        fetchStaff();
        return "Status updated successfully!";
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const handleOpenUpdateModal = (staff) => { setSelectedStaff(staff); setIsUpdateModalOpen(true); };
  const handleOpenAadharModal = (url) => { setViewingAadharUrl(url); setIsAadharModalOpen(true); };
  const handleOpenConfirmModal = (staff) => { setSelectedStaff(staff); setIsConfirmModalOpen(true); };
  const handleToggleDetailsRow = (staffId) => { setExpandedRowId((prevId) => (prevId === staffId ? null : staffId)); };
  const handleCloseModals = () => {
    setIsUpdateModalOpen(false); setIsAadharModalOpen(false); setIsConfirmModalOpen(false);
    setSelectedStaff(null); setViewingAadharUrl("");
  };
  const handleUpdateSuccess = () => { handleCloseModals(); fetchStaff(); };

  const handleExportToExcel = () => {
    const dataForExport = staffList.map((staff, index) => {
      let roleStr = "N/A";
      if(Array.isArray(staff.role) && staff.role.length > 0) roleStr = staff.role.join(", ");
      if(Array.isArray(staff.otherRoles) && staff.otherRoles.length > 0) roleStr += ` (${staff.otherRoles.join(", ")})`;

      return {
        "Sr. No.": index + 1,
        "Name": staff.name || "N/A",
        "Mobile": staff.mobile || "N/A",
        "Date of Birth": staff.dob ? new Date(staff.dob).toLocaleDateString() : "N/A",
        "Aadhar Number": staff.adharNumber || "N/A",
        "Aadhar Image URL": staff.adharImageUrl || "",
        "Profile Picture URL": staff.profilePic?.url || "",
        "Roles": roleStr,
        "EID": staff.eid || "N/A",
        "Password": staff.password || "N/A",
        "Status": (staff.status ?? false) ? "Active" : "Inactive",
        "Joined Date": staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "N/A",
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataForExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Data");
    XLSX.writeFile(wb, "Staff_Data.xlsx");
    toast.success("Staff data exported successfully!");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#6f42c1] via-violet-700 to-indigo-800 text-white shadow-xl">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
                        <FaUsers className="text-violet-200" /> Manage Staff
                    </h2>
                    <p className="text-violet-200 mt-2 text-sm opacity-90">Administrate employee roles, status, and details.</p>
                </div>
                <div className="flex gap-3">
                    <button
                    onClick={handleExportToExcel}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg border border-white/10 flex items-center gap-2 transition-all"
                    >
                    <FaDownload size={14} /> Export Excel
                    </button>
                    <button
                    onClick={() => navigate("/manager/add-staff")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                    <FaPlus size={14} /> Add Staff
                    </button>
                </div>
            </div>
          </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        
        {/* Search Bar Card */}
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 mb-8 max-w-2xl mx-auto">
            <FaSearch className="text-gray-400 ml-2" />
            <input
            type="text"
            placeholder="Search by name, role, EID, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 font-medium"
            />
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500 bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm mx-auto max-w-lg">
            <h4 className="font-bold mb-2">Error Loading Data</h4>
            {error}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-indigo-50/80 text-indigo-900 border-b border-indigo-100">
                      {["No.", "Profile", "Employee Name", "Assigned Roles", "EID", "Password", "Joined Date", "Actions"].map((h) => (
                        <th key={h} className="p-4 font-bold uppercase text-xs tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginatedStaff.map((staff, index) => (
                      <React.Fragment key={staff._id}>
                        <tr className={`hover:bg-violet-50/30 transition-colors ${expandedRowId === staff._id ? "bg-violet-50/40" : ""}`}>
                          <td className="p-4 text-gray-500 font-mono text-xs">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td className="p-4">
                            <div className="relative group w-fit">
                                <img
                                src={staff.profilePic?.url || `https://ui-avatars.com/api/?name=${staff.name}&background=6f42c1&color=fff`}
                                alt="DP"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => handleOpenAadharModal(staff.profilePic?.url || `https://ui-avatars.com/api/?name=${staff.name}`)}
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-gray-300" 
                                     style={{backgroundColor: staff.status ? '#10b981' : '#ef4444'}}></div>
                            </div>
                          </td>
                          <td className="p-4">
                              <p className="font-bold text-gray-800 text-sm">{staff.name || "-"}</p>
                              <p className="text-[10px] text-gray-400">{staff.mobile}</p>
                          </td>

                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {Array.isArray(staff.role) && staff.role.length > 0 ? (
                                  staff.role.map((r, i) => (
                                      <span key={i} className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-md font-bold uppercase border border-violet-200">
                                          {r}
                                      </span>
                                  ))
                              ) : <span className="text-gray-300">-</span>}
                              
                              {Array.isArray(staff.otherRoles) && staff.otherRoles.map((otherRole, i) => (
                                    <span key={`other-${i}`} className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-bold border border-orange-200">
                                    {otherRole}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-4 font-mono text-xs font-semibold text-gray-500">
                             {staff.eid || "N/A"}
                          </td>
                          
                          <td className="p-4 font-mono text-xs text-gray-400">
                             <span className="bg-gray-100 px-2 py-1 rounded">{staff.password || "N/A"}</span>
                          </td>

                          <td className="p-4 text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-300" />
                            {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "-"}
                          </td>
                          
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleToggleDetailsRow(staff._id)} className="text-gray-400 hover:text-violet-600 transition-colors bg-gray-50 p-2 rounded-lg hover:bg-violet-50">
                                {expandedRowId === staff._id ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                              </button>
                              
                              <div className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" checked={staff.status ?? false} onChange={() => handleOpenConfirmModal(staff)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                              </div>

                              <button onClick={() => handleOpenUpdateModal(staff)} className="text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 p-2 rounded-lg hover:bg-blue-100">
                                <FaPen size={14} />
                              </button>
                              
                              <button onClick={() => handleDelete(staff._id)} className="text-rose-500 hover:text-rose-700 transition-colors bg-rose-50 p-2 rounded-lg hover:bg-rose-100">
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedRowId === staff._id && (
                          <tr>
                            <td colSpan="8" className="p-0 border-b border-indigo-100">
                              <EmployeeDetails staff={staff} onImageClick={handleOpenAadharModal} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {/* Stats Cards */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-violet-500 flex items-center justify-between">
                 <div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Workforce</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">{staffSummary.totalStaff}</p>
                 </div>
                 <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 text-xl"><FaUsers /></div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-emerald-500 flex items-center justify-between">
                 <div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Active Roles</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">{staffSummary.roles.length}</p>
                 </div>
                 <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xl"><FaIdCard /></div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 md:col-span-1">
                 <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4">Distribution</p>
                 <div className="flex flex-wrap gap-2">
                    {staffSummary.roles.map(role => (
                        <div key={role} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <span className="text-xs font-bold text-gray-600">{role}</span>
                            <span className="bg-violet-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">{staffSummary.roleCounts[role]}</span>
                        </div>
                    ))}
                 </div>
              </div>
            </div>
          </>
        )}
      </div>

      <UpdateStaffModal
        isOpen={isUpdateModalOpen}
        onClose={handleCloseModals}
        onUpdateSuccess={handleUpdateSuccess}
        staff={selectedStaff}
      />
      <AadharImageModal
        isOpen={isAadharModalOpen}
        onClose={handleCloseModals}
        imageUrl={viewingAadharUrl}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleToggleStatus}
        message={`Are you sure you want to ${selectedStaff?.status ? "DEACTIVATE" : "ACTIVATE"} this employee?`}
      />
      
      {/* CSS for custom scrollbar in modals */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7c7c7; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a0a0a0; }
      `}</style>
    </div>
  );
}

export default ManageStaff;