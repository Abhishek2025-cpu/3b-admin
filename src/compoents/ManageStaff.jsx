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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

const API_BASE_URL =
  "https://threebapi-1067354145699.asia-south1.run.app/api/staff";

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
            currentPage === number
              ? "bg-[#4b2a82]"
              : "bg-[#6f42c1] hover:bg-[#59359a]"
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
  return (
    <div
      className="fixed inset-0 z-[70] flex justify-center items-center p-4 pointer-events-none"
      onClick={onClose}
    >
      <div
        className="relative pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Display Card"
          className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl border-4 border-white"
        />
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 bg-white text-black rounded-full w-10 h-10 font-bold text-2xl flex items-center justify-center leading-none shadow-lg hover:scale-110 transition-transform"
        >
          &times;
        </button>
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
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const UpdateStaffModal = ({ staff, isOpen, onClose, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    dob: "",
    adharNumber: "",
    adharImage: null,
    roles: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = ["Helper", "Operator", "Mixture", "Supervisor", "Driver", "Other"];

  useEffect(() => {
    if (staff) {
      let initialRoles = [];
      if (staff.roles && staff.roles.length > 0) {
        initialRoles = [...staff.roles];
      } else if (staff.role) {
        initialRoles = [
          {
            role: staff.role,
            eid: staff.eid || "",
            password: staff.password || "",
          },
        ];
      }

      setFormData({
        name: staff.name || "",
        mobile: staff.mobile || "",
        dob: staff.dob ? new Date(staff.dob).toISOString().split("T")[0] : "",
        adharNumber: staff.adharNumber || "",
        adharImage: null,
        roles: initialRoles,
      });
    }
  }, [staff]);

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) =>
    setFormData((prev) => ({ ...prev, adharImage: e.target.files[0] }));

  const handleAddRole = (e) => {
    const selectedRole = e.target.value;
    if (!selectedRole) return;

    if (formData.roles.find((r) => r.role === selectedRole)) {
      toast.error("This role is already added");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      roles: [...prev.roles, { role: selectedRole, eid: "", password: "" }],
    }));
    e.target.value = "";
  };

  const handleRemoveRole = (index) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index),
    }));
  };

  const handleRoleDataChange = (index, field, value) => {
    const updatedRoles = [...formData.roles];
    updatedRoles[index][field] = value;
    setFormData((prev) => ({ ...prev, roles: updatedRoles }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.roles.length === 0) {
      toast.error("Please add at least one role");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();

    data.append("name", formData.name);
    data.append("mobile", formData.mobile);
    data.append("dob", formData.dob);
    data.append("adharNumber", formData.adharNumber);

    data.append("roles", JSON.stringify(formData.roles));

    if (formData.adharImage) {
      data.append("adharImage", formData.adharImage);
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/update-employees/${staff._id}`,
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
    <div className="fixed inset-0 flex justify-center items-center z-50 p-4 pointer-events-none bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col pointer-events-auto overflow-hidden">
        <div className="bg-[#6f42c1] p-4 flex justify-between items-center">
          <h5 className="text-xl font-bold text-white">Update Employee Details</h5>
          <button onClick={onClose} className="text-white hover:rotate-90 transition-transform">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
              <h6 className="font-bold text-[#6f42c1] mb-3 flex items-center gap-2 border-b border-purple-200 pb-2">
                Manage Roles & Credentials
              </h6>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Role to Add</label>
                <select
                  onChange={handleAddRole}
                  className="w-full md:w-1/3 p-2 border rounded bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">+ Add a Role</option>
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1 italic">
                  You can add multiple roles for a single employee
                </p>
              </div>

              <div className="space-y-3">
                {formData.roles.map((roleObj, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-end gap-3 bg-white p-3 rounded shadow-sm border border-gray-200 relative group"
                  >
                    <div className="flex-1 min-w-[120px]">
                      <span className="text-[10px] font-black text-purple-600 uppercase block mb-1">
                        Role {index + 1}
                      </span>
                      <div className="font-bold text-gray-800 bg-gray-100 px-3 py-1.5 rounded">
                        {roleObj.role}
                      </div>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">EID</label>
                      <input
                        type="text"
                        placeholder="Assign EID"
                        value={roleObj.eid}
                        onChange={(e) => handleRoleDataChange(index, "eid", e.target.value)}
                        className="w-full p-1.5 border-b focus:border-purple-500 outline-none font-mono text-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Password</label>
                      <input
                        type="text"
                        placeholder="Assign Password"
                        value={roleObj.password}
                        onChange={(e) => handleRoleDataChange(index, "password", e.target.value)}
                        className="w-full p-1.5 border-b focus:border-purple-500 outline-none font-mono text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove Role"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
                {formData.roles.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm italic">
                    No roles assigned. Please select a role from the dropdown above.
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Aadhar Number</label>
                <input
                  type="text"
                  name="adharNumber"
                  value={formData.adharNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Update Aadhar Image</label>
                <input
                  type="file"
                  name="adharImage"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white border border-gray-300 rounded shadow-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-[#6f42c1] text-white rounded shadow-md font-bold hover:bg-[#59359a] disabled:opacity-50"
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
    <div className="bg-slate-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-start border-l-4 border-[#6f42c1]">
      <div>
        <p className="font-semibold text-gray-600">Mobile:</p>
        <p className="text-gray-800">{staff.mobile || "N/A"}</p>
      </div>
      <div>
        <p className="font-semibold text-gray-600">Aadhar Number:</p>
        <p className="text-gray-800 font-mono">{staff.adharNumber || "N/A"}</p>
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
              {staff.statusHistory
                .slice()
                .reverse()
                .map((history) => (
                  <li key={history._id}>
                    <span
                      className={`font-bold ${
                        history.status ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {history.status ? "Active" : "Inactive"}
                    </span>
                    {" on "}
                    <span className="text-gray-700">
                      {new Date(history.changedAt).toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No history.</p>
          )}
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
      const oldFieldMatch =
        staff.role?.toLowerCase().includes(q) ||
        staff.eid?.toLowerCase().includes(q);
      const newRolesMatch = staff.roles?.some(
        (r) => r.role?.toLowerCase().includes(q) || r.eid?.toLowerCase().includes(q)
      );
      return basicMatch || oldFieldMatch || newRolesMatch;
    });
  }, [staffList, searchQuery]);

  const staffSummary = useMemo(() => {
    const roleCounts = {};
    staffList.forEach((staff) => {
      if (staff.role) {
        roleCounts[staff.role] = (roleCounts[staff.role] || 0) + 1;
      }
      staff.roles?.forEach((r) => {
        if (r.role) roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
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
      if (
        !window.confirm(
          "Are you sure you want to delete this staff member? This action cannot be undone."
        )
      ) {
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/delete-employees/${staffId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          toast.success("Staff member deleted successfully.");
          fetchStaff();
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to delete staff member.");
        }
      } catch (error) {
        toast.error(
          "An error occurred. Please check your network and try again."
        );
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
      if (!res.ok) {
        return res.json().then((err) => {
          throw new Error(err.message || "API request failed");
        });
      }
      return res.json();
    });

    await toast.promise(promise, {
      loading: "Updating status...",
      success: (data) => {
        fetchStaff();
        return data.message || "Status updated successfully!";
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const handleOpenUpdateModal = (staff) => {
    setSelectedStaff(staff);
    setIsUpdateModalOpen(true);
  };
  const handleOpenAadharModal = (url) => {
    setViewingAadharUrl(url);
    setIsAadharModalOpen(true);
  };
  const handleOpenConfirmModal = (staff) => {
    setSelectedStaff(staff);
    setIsConfirmModalOpen(true);
  };
  const handleToggleDetailsRow = (staffId) => {
    setExpandedRowId((prevId) => (prevId === staffId ? null : staffId));
  };

  const handleCloseModals = () => {
    setIsUpdateModalOpen(false);
    setIsAadharModalOpen(false);
    setIsConfirmModalOpen(false);
    setSelectedStaff(null);
    setViewingAadharUrl("");
  };

  const handleUpdateSuccess = () => {
    handleCloseModals();
    fetchStaff();
  };

  const handleExportToExcel = () => {
    const dataForExport = staffList.map((staff, index) => {
      const roles = staff.roles && staff.roles.length > 0
        ? staff.roles.map(r => r.role).join(", ")
        : (staff.role || "N/A");
      const eids = staff.roles && staff.roles.length > 0
        ? staff.roles.map(r => r.eid || "N/A").join(", ")
        : (staff.eid || "N/A");
      const passwords = staff.roles && staff.roles.length > 0
        ? staff.roles.map(r => r.password || "N/A").join(", ")
        : (staff.password || "N/A");

      return {
        "Sr. No.": index + 1,
        "Name": staff.name || "N/A",
        "Mobile": staff.mobile || "N/A",
        "Date of Birth": staff.dob ? new Date(staff.dob).toLocaleDateString() : "N/A",
        "Aadhar Number": staff.adharNumber || "N/A",
        "Aadhar Image URL": staff.adharImageUrl || "",
        "Profile Picture URL": staff.profilePic?.url || "",
        "Roles": roles,
        "EIDs": eids,
        "Passwords": passwords,
        "Status": (staff.status ?? false) ? "Active" : "Inactive",
        "Joined Date": staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "N/A",
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataForExport);

    const colAadharImage = "F";
    const colProfilePic = "G";

    dataForExport.forEach((item, index) => {
      const rowNum = index + 2;
      if (item["Aadhar Image URL"]) {
        const cellRef = colAadharImage + rowNum;
        ws[cellRef] = ws[cellRef] || {};
        ws[cellRef].l = { Target: item["Aadhar Image URL"], Tooltip: "View Aadhar Image" };
        ws[cellRef].t = "s";
        ws[cellRef].v = "View Aadhar Image";
      }
      if (item["Profile Picture URL"]) {
        const cellRef = colProfilePic + rowNum;
        ws[cellRef] = ws[cellRef] || {};
        ws[cellRef].l = { Target: item["Profile Picture URL"], Tooltip: "View Profile Picture" };
        ws[cellRef].t = "s";
        ws[cellRef].v = "View Profile Picture";
      }
    });

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "6F42C1" } },
      alignment: { horizontal: "center" },
    };

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_col(C) + "1";
      if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Data");
    XLSX.writeFile(wb, "Staff_Data.xlsx");
    toast.success("Staff data exported successfully!");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-[#6f42c1] flex items-center gap-3">
            <FaUsers /> Manage Staff
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleExportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow-md flex items-center gap-2 transition-colors"
            >
              <FaDownload /> Export to Excel
            </button>
            <button
              onClick={() => navigate("/manager/add-staff")}
              className="bg-[#6f42c1] hover:bg-[#59359a] text-white font-bold py-2 px-5 rounded-lg shadow-md flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Staff
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by any field..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg mb-6 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f42c1]"
        />

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-[#f3f0fa] text-[#6f42c1] border-b-2 border-purple-200">
                  <tr>
                    {[
                      "Sr.",
                      `DP`,
                      "Name",
                      "Roles",
                      "EIDs",
                      "Passwords",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="p-3 font-black">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map((staff, index) => (
                    <React.Fragment key={staff._id}>
                      <tr className="border-b hover:bg-purple-50/30 transition-colors">
                        <td className="p-3">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>
                        <td className="p-3">
                          <img
                            src={
                              staff.profilePic?.url ||
                              `https://ui-avatars.com/api/?name=${staff.name}&background=6f42c1&color=fff`
                            }
                            alt="DP"
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-100 cursor-pointer shadow-sm hover:scale-110 transition-transform"
                            onClick={() =>
                              handleOpenAadharModal(
                                staff.profilePic?.url ||
                                  `https://ui-avatars.com/api/?name=${staff.name}`
                              )
                            }
                          />
                        </td>
                        <td className="p-3 font-bold text-gray-800">
                          {staff.name || "-"}
                        </td>

                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {staff.roles && staff.roles.length > 0 ? (
                              staff.roles.map((r, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-black uppercase w-fit"
                                >
                                  {r.role}
                                </span>
                              ))
                            ) : staff.role ? (
                              <span className="text-[9px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-200 font-black uppercase w-fit">
                                {staff.role}
                              </span>
                            ) : (
                              "-"
                            )}
                          </div>
                        </td>

                        <td className="p-3 font-mono text-xs text-gray-600">
                          {staff.roles && staff.roles.length > 0
                            ? staff.roles.map((r, i) => (
                                <div key={i} className="mb-1">
                                  {r.eid || "N/A"}
                                </div>
                              ))
                            : staff.eid ? (
                                <div>{staff.eid || "-"}</div>
                            ) : "-"}
                        </td>

                        <td className="p-3 font-mono text-xs text-gray-600">
                          {staff.roles && staff.roles.length > 0
                            ? staff.roles.map((r, i) => (
                                <div key={i} className="mb-1">
                                  {r.password || "N/A"}
                                </div>
                              ))
                            : staff.password ? (
                                <div>{staff.password || "-"}</div>
                            ) : "-"}
                        </td>

                        <td className="p-3 text-xs">
                          {staff.createdAt
                            ? new Date(staff.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleToggleDetailsRow(staff._id)}
                              title="View Details"
                            >
                              {expandedRowId === staff._id ? (
                                <FaEyeSlash size={18} />
                              ) : (
                                <FaEye className="text-gray-500" size={18} />
                              )}
                            </button>
                            <label
                              className="relative inline-flex items-center cursor-pointer"
                              title="Toggle Status"
                            >
                              <input
                                type="checkbox"
                                checked={staff.status ?? false}
                                onChange={() => handleOpenConfirmModal(staff)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#6f42c1] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                            </label>
                            <FaPen
                              onClick={() => handleOpenUpdateModal(staff)}
                              className="text-blue-600 cursor-pointer hover:scale-125 transition-transform"
                              size={16}
                              title="Edit Staff"
                            />
                            <FaTrash
                              onClick={() => handleDelete(staff._id)}
                              className="text-red-600 cursor-pointer hover:scale-125 transition-transform"
                              size={16}
                              title="Delete Staff"
                            />
                          </div>
                        </td>
                      </tr>
                      {expandedRowId === staff._id && (
                        <tr>
                          <td
                            colSpan="8"
                            className="p-0 animate-in slide-in-from-top duration-300"
                          >
                            <EmployeeDetails
                              staff={staff}
                              onImageClick={handleOpenAadharModal}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-bold text-[#6f42c1] mb-4 flex items-center gap-2">
                <FaUsers /> Staff Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-500 font-bold uppercase">
                    Total Staff
                  </p>
                  <p className="text-3xl font-black text-purple-700">
                    {staffSummary.totalStaff}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-500 font-bold uppercase">
                    Active Roles
                  </p>
                  <p className="text-3xl font-black text-blue-700">
                    {staffSummary.roles.length}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-1 md:col-span-2 lg:col-span-1 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-2 font-bold uppercase">
                    Role Breakdown
                  </p>
                  <div className="space-y-1 text-sm">
                    {staffSummary.roles.map((role) => (
                      <div
                        key={role}
                        className="flex justify-between items-center border-b border-gray-100 last:border-0 py-1"
                      >
                        <span className="text-gray-600 font-medium">{role}</span>
                        <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {staffSummary.roleCounts[role]}
                        </span>
                      </div>
                    ))}
                  </div>
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
        message={`Are you sure you want to ${
          selectedStaff?.status ? "DEACTIVATE" : "ACTIVATE"
        } this employee?`}
      />
    </div>
  );
}

export default ManageStaff;