import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaTimes, FaCloudUploadAlt, FaFolderPlus, FaHashtag, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

// --- Animated Loader Component ---
const LoaderOverlay = ({ show, message }) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]"
      >
        <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
            <FaFolderPlus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 text-2xl animate-pulse" />
          </div>
          <p className="mt-6 text-gray-800 font-bold text-xl text-center leading-tight">
            {message}
          </p>
          <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-600"
              animate={{ width: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Premium Image Uploader ---
const ImageUploader = ({ files, onFilesChange }) => {
  const previewUrls = useMemo(() => files.map(file => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const validImages = newFiles.filter(file => file.type.startsWith('image/'));
    if (validImages.length !== newFiles.length) {
      toast.error("Sirf images allow hain!");
    }
    onFilesChange([...files, ...validImages]);
  };

  return (
    <div className="space-y-4">
      <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-2xl cursor-pointer bg-purple-50/50 hover:bg-purple-50 transition-all hover:border-purple-500 overflow-hidden">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <motion.div whileHover={{ y: -5 }} className="bg-purple-600 p-3 rounded-full shadow-lg mb-3">
            <FaCloudUploadAlt className="text-white text-2xl" />
          </motion.div>
          <p className="text-sm text-gray-600 font-medium">Click or Drag to upload images</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP (Max 10MB)</p>
        </div>
        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        <AnimatePresence>
          {previewUrls.map((url, index) => (
            <motion.div 
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative group aspect-square"
            >
              <img src={url} alt="preview" className="w-full h-full object-cover rounded-xl border-2 border-white shadow-md transition-transform group-hover:scale-105" />
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors border-2 border-white"
              >
                <FaTimes size={10} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function AddCategoryForm() {
  const [formData, setFormData] = useState({ name: '', position: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = name === 'position' ? value.replace(/[^0-9]/g, '') : value;
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name.length < 3) return toast.error('Name bhot chota hai!');
    if (!formData.position) return toast.error('Position bharna zaroori hai!');
    if (imageFiles.length === 0) return toast.error('Kam se kam ek image select karein!');

    setIsSubmitting(true);
    try {
      // Compression Logic
      const compressedImages = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setCompressionProgress({ current: i + 1, total: imageFiles.length });
        const compressed = await imageCompression(imageFiles[i], { maxSizeMB: 1, maxWidthOrHeight: 1920 });
        compressedImages.push(compressed);
      }

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('position', formData.position);
      compressedImages.forEach(file => data.append('images', file));

      const apiPromise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/add-category', {
        method: 'POST',
        body: data,
      }).then(res => {
        if (!res.ok) throw new Error('Failed to save');
        return res.json();
      });

      await toast.promise(apiPromise, {
        loading: 'Database mein save ho raha hai...',
        success: 'Category successfully add ho gayi! 🎉',
        error: 'Oops! Kuch gadbad ho gayi.',
      });

      setFormData({ name: '', position: '' });
      setImageFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setCompressionProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px] opacity-50" />

      <LoaderOverlay 
        show={isSubmitting} 
        message={compressionProgress ? `Compressing: ${compressionProgress.current}/${compressionProgress.total}` : 'Finalizing Category...'} 
      />
      <Toaster position="top-center" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="inline-block p-4 bg-purple-600 rounded-3xl shadow-lg shadow-purple-200 mb-4"
            >
              <FaFolderPlus className="text-white text-3xl" />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Create Category</h2>
            <p className="text-gray-500 mt-2 font-medium">Add a new section to your marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              {/* Name Input */}
              <div className="relative group">
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                  <FaImage className="mr-2 text-purple-500" /> Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Luxury Watches"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              {/* Position Input */}
              <div className="relative group">
                <label className="flex items-center text-sm font-bold text-gray-700 mb-2 ml-1">
                  <FaHashtag className="mr-2 text-purple-500" /> Display Position
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="position"
                  placeholder="e.g. 1"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium placeholder:text-gray-400"
                />
              </div>

              {/* Image Section */}
              <div>
                <label className="flex items-center text-sm font-bold text-gray-700 mb-3 ml-1">
                  <FaImage className="mr-2 text-purple-500" /> Media Assets
                </label>
                <ImageUploader files={imageFiles} onFilesChange={setImageFiles} />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              type="submit"
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center space-x-2 ${
                isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-200'
              }`}
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>Publish Category</span>
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    🚀
                  </motion.span>
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}