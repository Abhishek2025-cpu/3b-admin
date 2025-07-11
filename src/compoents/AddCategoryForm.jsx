import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

// --- Reusable Helper Components ---

// A generic Toast notification component
const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose}><FaTimes /></button>
    </div>
  );
};

// A full-screen loader overlay
const LoaderOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[9999]">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );
};

// Component for handling multiple image uploads and previews efficiently
const ImageUploader = ({ files, onFilesChange }) => {
    const previewUrls = useMemo(() => 
        files.map(file => URL.createObjectURL(file)),
    [files]);

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);
  
    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        onFilesChange([...files, ...newFiles]);
    };

    const handleRemove = (indexToRemove) => {
        onFilesChange(files.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                        <img src={url} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded-lg border"/>
                        <button 
                            type="button" 
                            onClick={() => handleRemove(index)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
                        >
                            <FaTimes size={12}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main Form Component ---

function AddCategoryForm() {
  const initialFormState = {
    name: '',
    position: '',
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setToast({ show: true, message: 'Please select at least one image.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('position', Number(formData.position));

    imageFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/add-category', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Server returned an unreadable error.' }));
        throw new Error(errData.message || 'Failed to add category. Please check your inputs.');
      }

      setToast({ show: true, message: 'Category added successfully!', type: 'success' });
      setFormData(initialFormState);
      setImageFiles([]);
    } catch (error) {
      setToast({ show: true, message: error.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Note: The original HTML had a custom font 'Dancing Script'. 
  // To replicate this exactly, you would need to import this font via a service like Google Fonts and configure it in your index.css or tailwind.config.js.
  // For simplicity, we are using the default sans-serif font here.

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <LoaderOverlay show={isSubmitting} />
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/manager_dashboard" className="text-gray-600 hover:text-black">
            <FaArrowLeft size={24} />
          </a>
          {/* H2 title was empty in the original, can be added here if needed */}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-6 text-[#6f42c1]">
            Add New Category
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="categoryName" className="block mb-1 font-medium text-gray-700">Category Name</label>
              <input 
                type="text" 
                name="name" 
                id="categoryName" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="categoryPosition" className="block mb-1 font-medium text-gray-700">Position</label>
              <input 
                type="number" 
                name="position" 
                id="categoryPosition" 
                value={formData.position} 
                onChange={handleChange} 
                required 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700">Category Images</label>
              <ImageUploader files={imageFiles} onFilesChange={setImageFiles} />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategoryForm;