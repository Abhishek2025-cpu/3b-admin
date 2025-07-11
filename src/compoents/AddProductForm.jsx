import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

// --- FIX: Define the two separate base URLs for clarity and easy maintenance ---
const PRODUCT_API_BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app/api';
const DIMENSION_API_BASE_URL = 'https://node-api-1067354145699.asia-south1.run.app/api';


// --- Reusable UI Components (No changes needed here) ---

const Toast = ({ message, type, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
  };

  return (
    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg flex items-center gap-4 ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose}><FaTimes /></button>
    </div>
  );
};

// --- Specialized Input Components ---

const DimensionsInput = ({ value, onChange }) => {
  const [availableDims, setAvailableDims] = useState([]);
  const [newDimValue, setNewDimValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // This function will handle fetching the dimensions
  const fetchDimensions = useCallback(async () => {
    try {
      // *** FIX: Uses DIMENSION_API_BASE_URL for getting dimensions ***
      const res = await fetch(`${DIMENSION_API_BASE_URL}/dimensions/get-dimensions`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setAvailableDims(data);
    } catch (err) {
      console.error('Failed to load dimensions:', err);
    }
  }, []);

  useEffect(() => {
    fetchDimensions();
  }, [fetchDimensions]);

  const handleSelect = (dimValue) => {
    if (!value.includes(dimValue)) {
      onChange([...value, dimValue]);
    }
    setIsOpen(false);
  };

  const handleRemove = (dimToRemove) => {
    onChange(value.filter(dim => dim !== dimToRemove));
  };
  
  const handleAddNew = async () => {
    if (!newDimValue.trim()) return;
    try {
        // *** FIX: Uses DIMENSION_API_BASE_URL for adding dimensions ***
        const res = await fetch(`${DIMENSION_API_BASE_URL}/dimensions/add-dimensions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: newDimValue.trim() })
        });
        if (!res.ok) throw new Error('Failed to add dimension');
        
        fetchDimensions(); 
        setNewDimValue('');
    } catch (err) {
        console.error('Failed to add dimension:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-2 border rounded-md text-left bg-white flex justify-between items-center">
          <span>Select Dimensions ({value.length})</span>
          <span>▾</span>
        </button>
        {isOpen && (
          <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md max-h-48 overflow-y-auto">
            {availableDims.map(dim => (
              <li key={dim._id} onClick={() => handleSelect(dim.value)} className="p-2 hover:bg-purple-100 cursor-pointer">
                {dim.value}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-2 border rounded-md min-h-[40px] bg-gray-50 flex flex-wrap gap-2">
        {value.map(dim => (
          <span key={dim} className="bg-purple-600 text-white px-3 py-1 text-sm rounded-full flex items-center gap-2">
            {dim}
            <button type="button" onClick={() => handleRemove(dim)}><FaTimes size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newDimValue}
          onChange={(e) => setNewDimValue(e.target.value)}
          placeholder="Add new dimension(s)..." 
          className="w-full p-2 border rounded-md"
        />
        <button type="button" onClick={handleAddNew} className="px-4 py-2 bg-purple-600 text-white rounded-md whitespace-nowrap">Add</button>
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
                accept="image/*,.obj" 
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-3">
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

function AddProductForm() {
  const initialFormState = {
    categoryId: '',
    productId: '',
    name: '',
    description: '',
    modelNumbers: '',
    dimensions: [],
    colors: '',
    price: '',
    discount: '0',
    position: '0',
    quantity: '1',
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // *** FIX: Uses PRODUCT_API_BASE_URL for getting categories ***
        const res = await fetch(`${PRODUCT_API_BASE_URL}/categories/all-category`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

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
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      data.append(key, Array.isArray(value) ? value.join(',') : value);
    });

    imageFiles.forEach(file => {
      data.append('images', file);
    });

    try {
      // *** FIX: Uses PRODUCT_API_BASE_URL for adding the product ***
      const res = await fetch(`${PRODUCT_API_BASE_URL}/products/add-products`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Server responded with an error');
      }

      setToast({ show: true, message: 'Product added successfully!', type: 'success' });
      setFormData(initialFormState);
      setImageFiles([]);
    } catch (error) {
      setToast({ show: true, message: error.message || 'Failed to add product.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDimensionsChange = useCallback((newDims) => {
    setFormData(prev => ({...prev, dimensions: newDims}));
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, show: false }))} />

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <a href="/manager_dashboard" className="text-gray-600 hover:text-black">
            <FaArrowLeft size={24} />
          </a>
          <h2 className="text-3xl font-bold text-[#6f42c1]">Add New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-lg space-y-4">
          
          <div>
            <label htmlFor="categoryId" className="block mb-1 font-medium">Category</label>
            <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full p-2 border rounded-md bg-white">
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.categoryId}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="productId" className="block mb-1 font-medium">Product ID</label>
            <input type="text" name="productId" id="productId" value={formData.productId} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          </div>

          <div>
            <label htmlFor="name" className="block mb-1 font-medium">Product Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded-md" />
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium">Description</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full p-2 border rounded-md"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modelNumbers" className="block mb-1 font-medium">Model Numbers</label>
              <input type="text" name="modelNumbers" id="modelNumbers" placeholder="Comma separated" value={formData.modelNumbers} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="colors" className="block mb-1 font-medium">Colors</label>
              <input type="text" name="colors" id="colors" placeholder="Comma separated" value={formData.colors} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Dimensions</label>
            <DimensionsInput value={formData.dimensions} onChange={handleDimensionsChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block mb-1 font-medium">Price</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="discount" className="block mb-1 font-medium">Discount (%)</label>
              <input type="number" name="discount" id="discount" value={formData.discount} onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block mb-1 font-medium">Position</label>
              <input type="number" name="position" id="position" value={formData.position} onChange={handleChange} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="quantity" className="block mb-1 font-medium">Quantity</label>
              <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required className="w-full p-2 border rounded-md" />
            </div>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Product Images & 3D Models</label>
            <ImageUploader files={imageFiles} onFilesChange={setImageFiles} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white font-bold py-3 rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors">
            {isSubmitting ? 'Submitting...' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductForm;