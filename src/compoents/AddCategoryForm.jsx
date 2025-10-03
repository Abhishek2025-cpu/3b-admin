import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast and Toaster
import imageCompression from 'browser-image-compression'; // Import the image compression library

// --- Reusable Helper Components ---

// A full-screen loader overlay
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
            <img src={url} alt={`Preview ${index}`} className="w-20 h-20 object-cover rounded-lg border" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white"
            >
              <FaTimes size={12} />
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
  const [compressionProgress, setCompressionProgress] = useState(null); // { current: 0, total: 0 }
  const [uploadingCategory, setUploadingCategory] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressAndUpload = async (files) => {
    const compressedFiles = [];
    const compressionOptions = {
      maxSizeMB: 1,           // (default: Number.POSITIVE_INFINITY)
      maxWidthOrHeight: 1920, // compressed image's max width or height in pixels (default: undefined)
      useWebWorker: true,     // optional, use multi-thread web worker, default to false
      // onProgress: (p) => setCompressionProgress(p) // Callback for progress if needed
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCompressionProgress({ current: i + 1, total: files.length });
      toast.loading(`Compressing image ${i + 1} of ${files.length}...`, { id: 'image-compression' });
      try {
        const compressedFile = await imageCompression(file, compressionOptions);
        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error(`Failed to compress image ${i + 1}.`, { id: 'image-compression' });
        // Optionally, stop the whole process or push the original file
        throw error; // Propagate the error to stop submission
      }
    }
    toast.success(`Successfully compressed ${files.length} images!`, { id: 'image-compression' });
    setCompressionProgress(null);
    return compressedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }

    setIsSubmitting(true);
    setUploadingCategory(true); // Indicate that category submission is starting

    try {
      const compressedImages = await compressAndUpload(imageFiles);

      const data = new FormData();
      data.append('name', formData.name);
      data.append('position', Number(formData.position));

      compressedImages.forEach(file => {
        data.append('images', file);
      });

      // Show "Adding category..." toast for the fetch operation
      const responsePromise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/add-category', {
        method: 'POST',
        body: data,
      }).then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: 'Server returned an unreadable error.' }));
          throw new Error(errData.message || 'Failed to add category. Please check your inputs.');
        }
        return res.json();
      });

      await toast.promise(responsePromise, {
        loading: 'Adding category...',
        success: () => {
          setFormData(initialFormState);
          setImageFiles([]);
          return 'Category added successfully!';
        },
        error: (err) => `Error: ${err.message}`,
      });

    } catch (error) {
      console.error('Submission error:', error);
      // toast.error(`Submission failed: ${error.message}`); // Already handled by toast.promise error or compression error
    } finally {
      setIsSubmitting(false);
      setUploadingCategory(false);
    }
  };

  // Determine the loader message
  const loaderMessage = useMemo(() => {
    if (compressionProgress) {
      return `Compressing images: ${compressionProgress.current} of ${compressionProgress.total}`;
    }
    if (uploadingCategory) {
      return 'Adding category...';
    }
    return '';
  }, [compressionProgress, uploadingCategory]);


  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <LoaderOverlay show={isSubmitting} message={loaderMessage} />
      <Toaster position="top-right" />

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/manager_dashboard" className="text-gray-600 hover:text-black">
        
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
              className="w-full bg-[#6f42c1] text-white font-bold py-3 rounded-md hover:bg-[#6f42c1] disabled:bg-[#6f42c1] transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Processing...' : 'Add Category'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategoryForm;