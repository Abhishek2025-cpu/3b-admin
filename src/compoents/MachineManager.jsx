import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "https://threebtest.onrender.com/api/machines";

export default function MachineManager() {
  const [machines, setMachines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for loader
  const [showDeleteModal, setShowDeleteModal] = useState(false); // New state for delete modal
  const [machineToDeleteId, setMachineToDeleteId] = useState(null); // New state to store ID for deletion

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    dateOfManufacturing: "",
    type: "",
    image: null,
  });

  // Fetch machines
  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_URL}/get`);
      setMachines(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch machines");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.companyName || !formData.dateOfManufacturing || !formData.type) {
      toast.error("Please fill all fields!");
      return;
    }

    setIsSubmitting(true); // Start loader

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) { // Ensure null image isn't appended as "null" string
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.post(`${API_URL}/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Machine added successfully!");
      setFormData({ name: "", companyName: "", dateOfManufacturing: "", type: "", image: null });
      setIsModalOpen(false);
      fetchMachines();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add machine");
    } finally {
      setIsSubmitting(false); // Stop loader
    }
  };

  // Function to open delete confirmation modal
  const confirmDelete = (id) => {
    setMachineToDeleteId(id);
    setShowDeleteModal(true);
  };

  // Function to handle actual deletion
  const executeDelete = async () => {
    setShowDeleteModal(false); // Close modal immediately
    if (!machineToDeleteId) return;

    try {
      await axios.delete(`${API_URL}/delete/${machineToDeleteId}`);
      toast.success("Machine deleted!");
      fetchMachines();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete machine");
    } finally {
      setMachineToDeleteId(null); // Reset ID
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6f42c1]">Machines</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#6f42c1] text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-[#5931a3] transition-all duration-200 border border-purple-700"
        >
          Add Machine
        </button>
      </div>

      {/* Add Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50  pointer-events-none">
          <div className="bg-white pointer-events-auto rounded-xl shadow-xl w-96 p-6 border border-gray-200 relative">
            <h2 className="text-xl font-bold text-[#6f42c1] mb-4">Add New Machine</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
            >
              ×
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
              <input
                type="text"
                name="name"
                placeholder="Machine Name"
                value={formData.name}
                onChange={handleChange}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-[#6f42c1]"
                required
              />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-[#6f42c1]"
                required
              />
              <input
                type="date"
                name="dateOfManufacturing"
                value={formData.dateOfManufacturing}
                onChange={handleChange}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-[#6f42c1]"
                required
              />
              <input
                type="text"
                name="type"
                placeholder="Type"
                value={formData.type}
                onChange={handleChange}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-[#6f42c1]"
                required
              />
              <input type="file" name="image" onChange={handleChange} className="border rounded-lg p-2" />
              <button
                type="submit"
                className="bg-[#6f42c1] text-white py-2 rounded-full shadow-md hover:shadow-lg hover:bg-[#5931a3] transition-all duration-200 border border-purple-700 mt-2 flex items-center justify-center"
                disabled={isSubmitting} // Disable button when submitting
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50  pointer-events-none">
          <div className="bg-white pointer-events-auto rounded-xl shadow-xl w-96 p-6 border border-gray-200 relative text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this machine? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2 rounded-full shadow hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-full shadow hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl p-4 border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
          <thead className="bg-[#6f42c1] text-white">
            <tr>
              {["Name", "Company", "Date", "Type", "Image", "Actions"].map((th) => (
                <th key={th} className="px-4 py-2 text-left text-sm font-semibold">
                  {th}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {machines.length > 0 ? (
              machines.map((m, idx) => (
                <tr
                  key={m._id}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-purple-50 transition-colors`}
                >
                  <td className="px-4 py-2">{m.name}</td>
                  <td className="px-4 py-2">{m.companyName}</td>
                  <td className="px-4 py-2">{new Date(m.dateOfManufacturing).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{m.type}</td>
                  <td className="px-4 py-2">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => confirmDelete(m._id)} // Call confirmDelete
                      className="bg-red-600 text-white px-3 py-1 rounded-full shadow hover:bg-red-700 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  No machines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}