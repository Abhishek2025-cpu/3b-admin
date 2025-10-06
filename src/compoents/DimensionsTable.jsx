import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function DimensionTable() {
  const [dimensions, setDimensions] = useState([]);
  const [newDimensionInput, setNewDimensionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch dimensions
  const fetchDimensions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://threebappbackend.onrender.com/api/dimensions/get-dimensions"
      );
      const data = await res.json();
      setDimensions(data);
    } catch (error) {
      toast.error("Failed to fetch dimensions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDimensions();
  }, []);

  // Add new dimension
  const handleAddNewDimension = async () => {
    const value = newDimensionInput.trim();
    if (!value) {
      toast.error("Please enter a dimension value.");
      return;
    }

    const promise = fetch(
      "https://threebappbackend.onrender.com/api/dimensions/add-dimensions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      }
    ).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add dimension");
      }
      return res.json();
    });

    await toast.promise(promise, {
      loading: "Adding dimension...",
      success: "Dimension added successfully!",
      error: (err) => `Error: ${err.message}`,
    });

    setNewDimensionInput("");
    fetchDimensions();
  };

  // Delete dimension
  const handleDelete = async () => {
    setModalOpen(false);
    if (!selectedId) return;

    const promise = fetch(
      `https://threebappbackend.onrender.com/api/dimensions/delete-dimensions/${selectedId}`,
      {
        method: "DELETE",
      }
    ).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete dimension");
      }
      return res.json();
    });

    await toast.promise(promise, {
      loading: "Deleting dimension...",
      success: "Dimension deleted successfully!",
      error: (err) => `Error: ${err.message}`,
    });

    setSelectedId(null);
    fetchDimensions();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">
          Manage Dimensions
        </h2>

        {/* Add New Dimension */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Enter new dimension"
            value={newDimensionInput}
            onChange={(e) => setNewDimensionInput(e.target.value)}
            className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button
            onClick={handleAddNewDimension}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Add
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-purple-600 text-white text-left">
                <th className="p-3">Sr No</th>
                <th className="p-3">Dimension</th>
                <th className="p-3">Created Time</th>
                <th className="p-3">Last Modified</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              ) : dimensions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    No dimensions found.
                  </td>
                </tr>
              ) : (
                dimensions.map((dim, index) => (
                  <tr
                    key={dim._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {dim.value}
                    </td>
                    <td className="p-3">
                      {new Date(dim.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {new Date(dim.updatedAt).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedId(dim._id);
                          setModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        message="This action cannot be undone. Do you really want to delete this dimension?"
      />
    </div>
  );
}

export default DimensionTable;
