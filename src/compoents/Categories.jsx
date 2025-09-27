import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Base URL for fetching all categories and deleting
const baseUrl = "https://threebapi-1067354145699.asia-south1.run.app/api/categories";
// Specific base URL for updating categories
const updateBaseUrl = "https://threebtest.onrender.com/api/categories";
// Base URL for deleting a specific image from a category
const deleteImageUrlBase = "https://threebapi-1067354145699.asia-south1.run.app/api/categories/delete";


export default function Categories() {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    position: "", // Added position field
    newImages: [],
    existingImages: [],
  });
  
  // State for Image Deletion Confirmation Modal
  const [showDeleteImageConfirmModal, setShowDeleteImageConfirmModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null); // Stores { categoryId, imageId }
  const [categoryIdForImageDelete, setCategoryIdForImageDelete] = useState(null);

  // New state for loading indicator during category update
  const [isLoading, setIsLoading] = useState(false);


  // State for Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${baseUrl}/all-category`);
      if (!res.ok) throw new Error("Failed to fetch categories.");
      const data = await res.json();
      
      const categoriesArray = Array.isArray(data.categories) ? data.categories : [];
      // Sort categories by position initially
      const sortedCategories = categoriesArray.sort((a, b) => (a.position || 0) - (b.position || 0));
      setCategories(sortedCategories);

    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories.");
      setCategories([]); 
    }
  }

  // --- SEARCH & PAGINATION LOGIC ---
  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
        return [];
    }
    const filtered = categories.filter(cat =>
      cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Ensure filtered results are also sorted by position
    return filtered.sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [categories, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);


  // --- MODAL AND FORM HANDLERS ---
  
  const openEditModal = (category) => {
    setFormState({
      id: category._id,
      name: category.name,
      position: category.position !== undefined ? String(category.position) : "", // Convert to string for input
      newImages: [],
      existingImages: category.images || [],
    });
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setFormState({
      id: null, name: "", position: "", newImages: [], existingImages: [],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setFormState((prev) => ({
      ...prev,
      newImages: [...prev.newImages, ...files],
    }));
  }

  // Opens the confirmation modal for image deletion
  const openDeleteImageConfirm = (categoryId, imageId) => {
    setCategoryIdForImageDelete(categoryId);
    setImageToDelete(imageId);
    setShowDeleteImageConfirmModal(true);
  };

  // Closes the confirmation modal for image deletion
  const closeDeleteImageConfirm = () => {
    setCategoryIdForImageDelete(null);
    setImageToDelete(null);
    setShowDeleteImageConfirmModal(false);
  };

  // --- API OPERATIONS ---

  // Function to handle the actual deletion of an image from a category
  async function confirmDeleteImage() {
    if (!categoryIdForImageDelete || !imageToDelete) {
      toast.error("Image or Category ID missing for deletion.");
      return;
    }

    try {
      // API call: DELETE /api/categories/delete/{categoryId}/images/{imageId}
      const res = await fetch(`${deleteImageUrlBase}/${categoryIdForImageDelete}/images/${imageToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete image with status: ${res.status}`);
      }

      toast.success("Image deleted successfully!");
      closeDeleteImageConfirm();
      // Update the formState's existingImages to reflect the deletion immediately
      setFormState(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter(img => img._id !== imageToDelete)
      }));
      // Also refresh the main category list to ensure consistency
      await loadCategories();
      
    } catch (error) {
      console.error("Failed to delete image:", error);
      toast.error(`Error deleting image: ${error.message}`);
    }
  }


  async function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!formState.id) {
        toast.error("Category ID is missing for update.");
        return;
    }

    setIsLoading(true); // Set loading to true when submission starts

    const formData = new FormData();
    formData.append("name", formState.name);
    // Append position, converting it to a number if it's not empty
    if (formState.position !== "") {
        formData.append("position", Number(formState.position));
    }
    
    formState.newImages.forEach(file => {
        formData.append("images", file);
    });
    
    try {
      const res = await fetch(`${updateBaseUrl}/update/${formState.id}`, {
        method: "PUT", 
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Update failed with status: ${res.status}`);
      }
      
      closeModal();
      await loadCategories(); // Await loadCategories to ensure state is updated before toast
      toast.success("Category updated successfully!");

    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error(`Error updating category: ${error.message}`);
    } finally {
      setIsLoading(false); // Reset loading to false when submission finishes (success or failure)
    }
  }

  async function deleteCategory(id) {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`${baseUrl}/delete/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Deletion failed");
        }
        await loadCategories();
        toast.success("Category deleted successfully.");
      } catch (error) {
        console.error("Failed to delete category:", error);
        toast.error(`Failed to delete category: ${error.message}`);
      }
    }
  }
  
  // --- RENDER COMPONENT ---
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          {/* Add Category button, uncomment if needed */}
          {/* <button
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
            onClick={() => navigate('/add-category')}
          >
            <FaPlus /> Add Category
          </button> */}
        </div>

        <div className="mb-4">
            <input
                type="text"
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Sr. No.</th>
                <th className="py-3 px-6 text-left">Position</th> {/* New Position column */}
                <th className="py-3 px-6 text-left">Category Name</th>
                <th className="py-3 px-6 text-left">Images</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {currentItems.map((cat, index) => (
                <tr key={cat._id} className="border-b border-gray-200 hover:bg-gray-50">
                   <td className="py-3 px-6 text-left font-semibold">{indexOfFirstItem + index + 1}</td>
                   <td className="py-3 px-6 text-left whitespace-nowrap">{cat.position || 'N/A'}</td> {/* Display position */}
                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{cat.name}</td>
                  <td className="py-3 px-6 text-left">
                    {cat.images && cat.images.length > 0 ? (
                      <div className="flex items-center space-x-2">
                        {cat.images.slice(0, 5).map((img) => (
                          <img
                            key={img._id || img.id}
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

        {totalPages > 1 && (
            <div className="flex justify-end items-center mt-4">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 mx-1 rounded bg-white border disabled:opacity-50">Prev</button>
                <span className="px-3 py-1 text-gray-700">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 mx-1 rounded bg-white border disabled:opacity-50">Next</button>
            </div>
        )}
      </div>

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

              {/* New Position Input Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Position</label>
                <input 
                  type="number" 
                  value={formState.position} 
                  onChange={(e) => setFormState({ ...formState, position: e.target.value })} 
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  min="0" // Assuming position should be non-negative
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Manage Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="mb-4" 
                    accept="image/*" 
                    ref={fileInputRef}
                  />
                  
                  <div className="space-y-4">
                    {formState.existingImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Existing Images</h4>
                            <div className="flex flex-wrap gap-4">
                                {formState.existingImages.map((img) => (
                                <div key={img._id} className="relative">
                                    <img src={img.url} alt="Existing" className="w-24 h-24 object-cover rounded-md shadow" />
                                    {/* On click, open confirmation modal */}
                                    <button 
                                      type="button" 
                                      onClick={() => openDeleteImageConfirm(formState.id, img._id)}
                                      className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1 z-10"
                                      title="Delete Image"
                                    >
                                      <FaTimes size={10} />
                                    </button>
                                </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {formState.newImages.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Newly Added Images</h4>
                            <div className="flex flex-wrap gap-4">
                            {formState.newImages.map((file, idx) => (
                                <div key={idx} className="relative">
                                <img src={URL.createObjectURL(file)} alt={`New ${file.name}`} className="w-24 h-24 object-cover rounded-md shadow" />
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveNewImage(idx)}
                                  className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1"
                                >
                                  <FaTimes size={10} />
                                </button>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isLoading} // Disable button when loading
              >
                {isLoading && (
                  // Simple SVG spinner for loading
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Deletion Confirmation Modal */}
      {showDeleteImageConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full relative">
            <button type="button" className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={closeDeleteImageConfirm}><FaTimes size={20} /></button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Image Deletion</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeDeleteImageConfirm} 
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteImage} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}