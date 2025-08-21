// src/pages/Categories.jsx

import React, { useEffect, useState, useMemo } from "react";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const baseUrl = "https://threebapi-1067354145699.asia-south1.run.app/api/categories";

export default function Categories() {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    newImages: [],
    existingImages: [],
    imagesToDelete: [],
  });
  
  // State for Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // --- DATA FETCHING ---
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${baseUrl}/all-category`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      alert("Failed to fetch categories.");
    }
  }

  // --- SEARCH & PAGINATION LOGIC ---

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    return categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate items for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);


  // --- MODAL AND FORM HANDLERS ---
  
  const openEditModal = (category) => {
    setFormState({
      id: category._id,
      name: category.name,
      newImages: [],
      existingImages: category.images || [],
      imagesToDelete: [],
    });
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setFormState({
      id: null, name: "", newImages: [], existingImages: [], imagesToDelete: [],
    });
  };

  function handleFileChange(e) {
    setFormState((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...Array.from(e.target.files)],
    }));
    e.target.value = null;
  }

  // --- API OPERATIONS ---
  async function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!formState.id) return;

    const formData = new FormData();
    formData.append("name", formState.name);
    formState.newImages.forEach(file => formData.append("images", file));
    if (formState.imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(formState.imagesToDelete));
    }
    
    try {
      const res = await fetch(`${baseUrl}/update/${formState.id}`, {
        method: "PUT", body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }
      
      closeModal();
      loadCategories();
      alert("Category updated successfully!");

    } catch (error) {
      console.error("Failed to update category:", error);
      alert(`Error: ${error.message}`);
    }
  }

  async function deleteCategory(id) {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`${baseUrl}/delete/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Deletion failed");
        loadCategories();
        alert("Category deleted successfully.");
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Failed to delete category.");
      }
    }
  }
  
  // --- RENDER COMPONENT ---
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          {/* <button
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            onClick={() => navigate('/add-category')}
          >
            <FaPlus /> Add Category
          </button> */}
        </div>

        {/* Search and Controls */}
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Sr. No.</th>
                <th className="py-3 px-6 text-left">Category Name</th>
                <th className="py-3 px-6 text-left">Images</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {currentItems.map((cat, index) => (
                <tr key={cat._id} className="border-b border-gray-200 hover:bg-gray-50">
                   <td className="py-3 px-6 text-left font-semibold">{indexOfFirstItem + index + 1}</td>
                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{cat.name}</td>
                  <td className="py-3 px-6 text-left">
                    {cat.images && cat.images.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        {cat.images.slice(0, 5).map((img) => (
                          <img
                            key={img.public_id || img.url}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                            src={img.url}
                            alt={cat.name}
                          />
                        ))}
                        {cat.images.length > 5 && (
                           <span className="text-xs font-bold text-gray-500">+{cat.images.length - 5}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No images</span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => openEditModal(cat)} className="text-indigo-500 hover:text-indigo-700" title="Edit"><FaEdit size={20} /></button>
                      <button onClick={() => deleteCategory(cat._id)} className="text-red-500 hover:text-red-700" title="Delete"><FaTrash size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && (
             <p className="text-center text-gray-500 py-10">No categories found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-end items-center mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 mx-1 rounded bg-white border disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 mx-1 rounded bg-white border disabled:opacity-50">Next</button>
            </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
            <button type="button" className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={closeModal}><FaTimes size={20} /></button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Category</h2>
            
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
                <input type="text" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Manage Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <input type="file" multiple onChange={handleFileChange} className="mb-4" accept="image/*" />
                  
                  {/* Image Preview Area */}
                  <div className="space-y-4">
                    {/* Existing Images */}
                    {formState.existingImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Existing Images</h4>
                            <div className="flex flex-wrap gap-4">
                                {formState.existingImages.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img.url} alt="Existing" className="w-24 h-24 object-cover rounded-md shadow" />
                                    <button type="button" onClick={() => setFormState(prev => ({...prev, existingImages: prev.existingImages.filter((_, i) => i !== idx), imagesToDelete: [...prev.imagesToDelete, img]}))} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1"><FaTimes size={10} /></button>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* New Images Preview */}
                    {formState.newImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Newly Added Images</h4>
                            <div className="flex flex-wrap gap-4">
                            {formState.newImages.map((file, idx) => (
                                <div key={idx} className="relative">
                                <img src={URL.createObjectURL(file)} alt="New" className="w-24 h-24 object-cover rounded-md shadow" />
                                <button type="button" onClick={() => setFormState(prev => ({...prev, newImages: prev.newImages.filter((_, i) => i !== idx)}))} className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1"><FaTimes size={10} /></button>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}