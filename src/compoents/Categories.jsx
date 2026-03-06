import React, { useEffect, useState, useMemo, useRef } from "react";
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, 
  FaSortAmountDownAlt, FaSortAmountUpAlt, 
  FaSearch, FaImage, FaCalendarAlt, FaHashtag 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import moment from 'moment-timezone';
import { motion, AnimatePresence } from "framer-motion";

// API Configs
const baseUrl = "https://threebapi-1067354145699.asia-south1.run.app/api/categories";
const updateBaseUrl = "https://threebtest.onrender.com/api/categories";
const deleteImageUrlBase = "https://threebapi-1067354145699.asia-south1.run.app/api/categories/delete";

// --- Loader Component with Animation ---
const LoaderOverlay = ({ show, message }) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      >
        <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-50 rounded-full animate-pulse"></div>
            </div>
          </div>
          {message && (
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 text-slate-700 font-medium text-lg"
            >
              {message}
            </motion.p>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDeleteImageConfirmModal, setShowDeleteImageConfirmModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [categoryIdForImageDelete, setCategoryIdForImageDelete] = useState(null);

  const [formState, setFormState] = useState({
    id: null, name: "", position: "", newImages: [], existingImages: [],
  });

  const itemsPerPage = 6;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${baseUrl}/all-category`);
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      toast.error("Failed to load categories.");
    }
  }

  const compressImages = async (files) => {
    const compressedFiles = [];
    for (let i = 0; i < files.length; i++) {
      setCompressionProgress({ current: i + 1, total: files.length });
      try {
        const compressed = await imageCompression(files[i], { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
        compressedFiles.push(compressed);
      } catch (err) { throw err; }
    }
    setCompressionProgress(null);
    return compressedFiles;
  };

  const filteredAndSortedCategories = useMemo(() => {
    let result = categories.filter(cat => cat.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    result.sort((a, b) => {
      const posA = Number(a.position) || 999;
      const posB = Number(b.position) || 999;
      return sortOrder === 'asc' ? posA - posB : posB - posA;
    });
    return result;
  }, [categories, searchTerm, sortOrder]);

  const currentItems = filteredAndSortedCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAndSortedCategories.length / itemsPerPage);

  const openEditModal = (category) => {
    setFormState({
      id: category._id,
      name: category.name,
      position: category.position ?? "",
      newImages: [],
      existingImages: category.images || [],
    });
    setShowModal(true);
  };

  async function handleUpdateSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", formState.name);
      formData.append("position", formState.position);
      
      if (formState.newImages.length > 0) {
        const compressed = await compressImages(formState.newImages);
        compressed.forEach(img => formData.append("images", img));
      }

      const res = await fetch(`${updateBaseUrl}/update/${formState.id}`, { method: "PUT", body: formData });
      if (!res.ok) throw new Error("Update failed");
      
      toast.success("Category updated successfully!");
      setShowModal(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const deleteCategory = (id) => {
    toast((t) => (
      <div className="p-1">
        <p className="font-medium text-slate-800">Delete this category?</p>
        <div className="flex gap-2 mt-3">
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-xs bg-slate-100 rounded-md">Cancel</button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              await fetch(`${baseUrl}/delete/${id}`, { method: "DELETE" });
              loadCategories();
              toast.success("Deleted!");
            }} 
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    ));
  };

  const loaderMessage = compressionProgress 
    ? `Compressing: ${compressionProgress.current}/${compressionProgress.total}`
    : "Updating Category...";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-900 font-sans">
      <Toaster position="top-right" />
      <LoaderOverlay show={isSubmitting} message={loaderMessage} />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Categories</h1>
            <p className="text-slate-500 mt-1">Manage your shop categories and their display order.</p>
          </motion.div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-category')}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all"
          >
            <FaPlus /> Add New Category
          </motion.button>
        </div>

        {/* Filters Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-medium w-full"
            >
              {sortOrder === 'asc' ? <FaSortAmountDownAlt className="text-indigo-600"/> : <FaSortAmountUpAlt className="text-indigo-600"/>}
              Sort: {sortOrder.toUpperCase()}
            </button>
          </div>
        </motion.div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Sr.</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Category Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Gallery</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {currentItems.map((cat, idx) => (
                  <motion.tr 
                    key={cat._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    className="group"
                  >
                    <td className="px-6 py-5 text-slate-400 font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                        #{cat.position || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-lg uppercase tracking-tight">{cat.name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <FaCalendarAlt size={10}/> {moment(cat.createdAt).format('DD MMM YYYY')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-3 overflow-hidden">
                        {cat.images?.slice(0, 4).map((img, i) => (
                          <motion.img 
                            key={i}
                            whileHover={{ y: -5, zIndex: 10 }}
                            src={img.url} 
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                          />
                        ))}
                        {cat.images?.length > 4 && (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                            +{cat.images.length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => deleteCategory(cat._id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {currentItems.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <FaImage size={40} className="mx-auto mb-3 opacity-20" />
              <p>No categories found match your search.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-slate-500">Showing page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 bg-white border rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 bg-white border rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden relative z-10"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Edit Category</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                    <input 
                      type="text" 
                      value={formState.name} 
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                      required 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Position</label>
                    <input 
                      type="number" 
                      value={formState.position} 
                      onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 text-center uppercase tracking-widest">Image Gallery</label>
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <input 
                      type="file" multiple accept="image/*"
                      onChange={(e) => setFormState(p => ({ ...p, newImages: [...p.newImages, ...Array.from(e.target.files)] }))}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    
                    {/* Image Previews */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {formState.existingImages.map((img) => (
                        <div key={img._id} className="relative group">
                          <img src={img.url} className="w-20 h-20 rounded-xl object-cover ring-2 ring-white shadow-md" />
                          <button 
                            type="button"
                            onClick={() => {
                              setCategoryIdForImageDelete(formState.id);
                              setImageToDelete(img._id);
                              setShowDeleteImageConfirmModal(true);
                            }}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ))}
                      {formState.newImages.map((file, idx) => (
                        <div key={idx} className="relative ring-2 ring-indigo-400 rounded-xl overflow-hidden">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 bg-indigo-50/30 uppercase">New</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Update Category"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Small Delete Confirmation for Images */}
      <AnimatePresence>
        {showDeleteImageConfirmModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDeleteImageConfirmModal(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Remove Image?</h3>
              <p className="text-slate-500 mb-6 text-sm">This will permanently delete this image from the cloud storage.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteImageConfirmModal(false)} className="flex-1 px-4 py-3 bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button 
                  onClick={async () => {
                    await fetch(`${deleteImageUrlBase}/${categoryIdForImageDelete}/images/${imageToDelete}`, { method: "DELETE" });
                    setFormState(p => ({ ...p, existingImages: p.existingImages.filter(i => i._id !== imageToDelete) }));
                    setShowDeleteImageConfirmModal(false);
                    toast.success("Image removed");
                  }}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}