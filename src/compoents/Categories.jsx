import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSortAmountDownAlt, FaSortAmountUpAlt } from "react-icons/fa"; // Changed sort icons for position
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import moment from 'moment-timezone'; // Use moment-timezone for IST

// Base URL for fetching all categories and deleting
const baseUrl = "https://threebapi-1067354145699.asia-south1.run.app/api/categories";
// Specific base URL for updating categories
const updateBaseUrl = "https://threebtest.onrender.com/api/categories";
// Base URL for deleting a specific image from a category
const deleteImageUrlBase = "https://threebapi-1067354145699.asia-south1.run.app/api/categories/delete";


// A full-screen loader overlay for image compression/upload
const LoaderOverlay = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        {message && <p className="mt-4 text-gray-700 font-semibold text-lg">{message}</p>}
      </div>
    </div>
  );
};


export default function Categories() {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    id: null,
    name: "",
    position: "",
    newImages: [],
    existingImages: [],
  });

  // State for Image Deletion Confirmation Modal
  const [showDeleteImageConfirmModal, setShowDeleteImageConfirmModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null); // Stores { categoryId, imageId }
  const [categoryIdForImageDelete, setCategoryIdForImageDelete] = useState(null);

  // New state for loading indicator during category update (covers API call)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for image compression progress
  const [compressionProgress, setCompressionProgress] = useState(null); // { current: 0, total: 0 }


  // State for Search, Pagination, and Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 entries per page
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc' for position sorting

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
      setCategories(categoriesArray); // Set raw categories, sorting will happen in useMemo

    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories.");
      setCategories([]);
    }
  }

  // --- IMAGE COMPRESSION HELPER ---
  const compressImages = async (files) => {
    const compressedFiles = [];
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCompressionProgress({ current: i + 1, total: files.length });
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error(`Failed to compress image ${i + 1}.`);
        throw error;
      }
    }
    setCompressionProgress(null); // Clear progress after completion
    return compressedFiles;
  };

  // --- SEARCH, PAGINATION & SORTING LOGIC ---
  const filteredAndSortedCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      return [];
    }

    let result = categories.filter(cat =>
      cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort based on 'position'
    result.sort((a, b) => {
      const posA = a.position !== undefined && a.position !== null ? Number(a.position) : Infinity; // Treat undefined/null position as last
      const posB = b.position !== undefined && b.position !== null ? Number(b.position) : Infinity;

      if (sortOrder === 'asc') {
        return posA - posB; // Ascending
      } else {
        return posB - posA; // Descending
      }
    });

    return result;
  }, [categories, searchTerm, sortOrder]);

  useEffect(() => {
    setCurrentPage(1); // Reset page when search or sort changes
  }, [searchTerm, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);

  // --- MODAL AND FORM HANDLERS ---

  const openEditModal = (category) => {
    setFormState({
      id: category._id,
      name: category.name,
      position: category.position !== undefined ? String(category.position) : "",
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

  const handleRemoveNewImage = (indexToRemove) => {
    setFormState(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, index) => index !== indexToRemove)
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input visually
    }
  };


  const openDeleteImageConfirm = (categoryId, imageId) => {
    setCategoryIdForImageDelete(categoryId);
    setImageToDelete(imageId);
    setShowDeleteImageConfirmModal(true);
  };

  const closeDeleteImageConfirm = () => {
    setCategoryIdForImageDelete(null);
    setImageToDelete(null);
    setShowDeleteImageConfirmModal(false);
  };

  // --- API OPERATIONS ---

  async function confirmDeleteImage() {
    if (!categoryIdForImageDelete || !imageToDelete) {
      toast.error("Image or Category ID missing for deletion.");
      return;
    }

    const deletePromise = fetch(`${deleteImageUrlBase}/${categoryIdForImageDelete}/images/${imageToDelete}`, {
      method: "DELETE",
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to delete image with status: ${res.status}`);
      }
      return res.json();
    });

    toast.promise(deletePromise, {
      loading: 'Deleting image...',
      success: () => {
        closeDeleteImageConfirm();
        setFormState(prev => ({
          ...prev,
          existingImages: prev.existingImages.filter(img => img._id !== imageToDelete)
        }));
        loadCategories(); // Refresh main category list
        return 'Image deleted successfully!';
      },
      error: (err) => `Error deleting image: ${err.message}`,
    });
  }


  async function handleUpdateSubmit(e) {
    e.preventDefault();
    if (!formState.id) {
      toast.error("Category ID is missing for update.");
      return;
    }

    setIsSubmitting(true);
    let compressedNewImages = [];
    let compressionToastId = null;

    try {
      if (formState.newImages.length > 0) {
        compressionToastId = toast.loading(`Compressing ${formState.newImages.length} new image(s)...`, {
          position: "top-center"
        });
        compressedNewImages = await compressImages(formState.newImages);
        toast.success(`Successfully compressed ${formState.newImages.length} image(s)!`, { id: compressionToastId });
      }

      const formData = new FormData();
      formData.append("name", formState.name);
      if (formState.position !== "") {
        formData.append("position", Number(formState.position));
      }

      compressedNewImages.forEach(file => {
        formData.append("images", file);
      });

      const updatePromise = fetch(`${updateBaseUrl}/update/${formState.id}`, {
        method: "PUT",
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Update failed with status: ${res.status}`);
        }
        return res.json();
      });

      await toast.promise(updatePromise, {
        loading: 'Updating category...',
        success: () => {
          closeModal();
          loadCategories();
          return 'Category updated successfully!';
        },
        error: (err) => `Error updating category: ${err.message}`,
      });

    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsSubmitting(false);
      setCompressionProgress(null);
      if (compressionToastId) toast.dismiss(compressionToastId);
    }
  }

  async function deleteCategory(id) {
    toast((t) => (
      <div className="flex flex-col">
        <p className="text-gray-800">Are you sure you want to delete this category?</p>
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              const deletePromise = fetch(`${baseUrl}/delete/${id}`, { method: "DELETE" })
                .then(async (res) => {
                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Deletion failed");
                  }
                  return res.json();
                });

              toast.promise(deletePromise, {
                loading: 'Deleting category...',
                success: () => {
                  loadCategories();
                  return 'Category deleted successfully!';
                },
                error: (err) => `Failed to delete category: ${err.message}`,
              });
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  }

  // Determine the loader message
  const loaderMessage = useMemo(() => {
    if (compressionProgress) {
      return `Compressing images: ${compressionProgress.current} of ${compressionProgress.total}`;
    }
    if (isSubmitting) {
      return 'Processing category...';
    }
    return '';
  }, [compressionProgress, isSubmitting]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-right" />
      <LoaderOverlay show={isSubmitting && (compressionProgress !== null)} message={loaderMessage} />

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

        <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search by category name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-gray-700">Sort by Position:</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-white border border-gray-300 rounded-md flex items-center gap-1 hover:bg-gray-100"
            >
              {sortOrder === 'asc' ? <><FaSortAmountDownAlt /> Asc</> : <><FaSortAmountUpAlt /> Desc</>}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Sr. No.</th>
                <th className="py-3 px-6 text-left">Position</th>
                <th className="py-3 px-6 text-left">Category Name</th>
                <th className="py-3 px-6 text-left">Images</th>
                <th className="py-3 px-6 text-left">Date Created (IST)</th>
                <th className="py-3 px-6 text-left">Last Modified (IST)</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {currentItems.length > 0 ? (
                currentItems.map((cat, index) => (
                  <tr key={cat._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left font-semibold">{indexOfFirstItem + index + 1}</td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">{cat.position !== undefined && cat.position !== null ? cat.position : 'N/A'}</td>
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
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {cat.createdAt ? moment.tz(cat.createdAt, 'Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A') : 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {cat.updatedAt ? moment.tz(cat.updatedAt, 'Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A') : 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center gap-4">
                        <button onClick={() => openEditModal(cat)} className="text-indigo-500 hover:text-indigo-700" title="Edit"><FaEdit size={20} /></button>
                        <button onClick={() => deleteCategory(cat._id)} className="text-red-500 hover:text-red-700" title="Delete"><FaTrash size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
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

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Position</label>
                <input
                  type="number"
                  value={formState.position}
                  onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                  className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="1"
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
                    disabled={isSubmitting}
                  />

                  <div className="space-y-4">
                    {formState.existingImages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">Existing Images</h4>
                        <div className="flex flex-wrap gap-4">
                          {formState.existingImages.map((img) => (
                            <div key={img._id} className="relative">
                              <img src={img.url} alt="Existing" className="w-24 h-24 object-cover rounded-md shadow" />
                              <button
                                type="button"
                                onClick={() => openDeleteImageConfirm(formState.id, img._id)}
                                className="absolute -top-2 -right-2 text-white bg-red-600 rounded-full p-1 z-10"
                                title="Delete Image"
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? "Saving..." : "Save Changes"}
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteImage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
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