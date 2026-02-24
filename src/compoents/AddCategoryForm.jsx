import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

// --- Reusable Helper Components ---

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

const ImageUploader = ({ files, onFilesChange }) => {
  const previewUrls = useMemo(() =>
    files.map(file => URL.createObjectURL(file)),
    [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    // Extra Validation: Sirf images allow karein
    const validImages = newFiles.filter(file => file.type.startsWith('image/'));
    if (validImages.length !== newFiles.length) {
      toast.error("Only image files are allowed!");
    }
    onFilesChange([...files, ...validImages]);
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
  const [compressionProgress, setCompressionProgress] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(false);

  // Input change handler with number validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'position') {
      // Validation: Sirf numbers allow karein (No decimals, no alphabets, no symbols)
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const compressAndUpload = async (files) => {
    const compressedFiles = [];
    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
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
        throw error;
      }
    }
    toast.success(`Successfully compressed ${files.length} images!`, { id: 'image-compression' });
    setCompressionProgress(null);
    return compressedFiles;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Frontend Validations ---
    if (!formData.name.trim() || formData.name.length < 3) {
      toast.error('Category name must be at least 3 characters long.');
      return;
    }

    if (!formData.position) {
      toast.error('Please enter a valid position number.');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }

    setIsSubmitting(true);
    setUploadingCategory(true);

    try {
      const compressedImages = await compressAndUpload(imageFiles);

      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('position', Number(formData.position));

      compressedImages.forEach(file => {
        data.append('images', file);
      });

      const responsePromise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/add-category', {
        method: 'POST',
        body: data,
      }).then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ message: 'Server error' }));
          throw new Error(errData.message || 'Failed to add category.');
        }
        return res.json();
      });

      await toast.promise(responsePromise, {
        loading: 'Adding category to database...',
        success: () => {
          setFormData(initialFormState);
          setImageFiles([]);
          return 'Category added successfully!';
        },
        error: (err) => `${err.message}`,
      });

    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
      setUploadingCategory(false);
    }
  };

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
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-md mx-auto">
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
                placeholder="Enter category name (min 3 chars)"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="categoryPosition" className="block mb-1 font-medium text-gray-700">Position (Number only)</label>
              <input
                type="text" // 'text' used with regex to prevent symbols like 'e', '+', '-'
                inputMode="numeric"
                name="position"
                id="categoryPosition"
                placeholder="e.g. 1"
                value={formData.position}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Category Images</label>
              <ImageUploader files={imageFiles} onFilesChange={setImageFiles} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-3 rounded-md transition-all ${
                isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-[#6f42c1] hover:bg-purple-700'
              }`}
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