import React, { useState, useEffect } from 'react';

// A reusable Loader component
// const Loader = () => (
//   <div className="fixed inset-0 bg-white/80 flex justify-center items-center z-50">
//     <div className="border-8 border-gray-200 border-t-blue-500 rounded-full w-16 h-16 animate-spin"></div>
//   </div>
// );

// A reusable Image Thumbnail component for previews
const ImageThumb = ({ file, onRemove }) => {
  return (
    <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-md">
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className="w-full h-full object-cover"
        // Clean up the object URL when the component unmounts
        onLoad={e => URL.revokeObjectURL(e.target.src)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 cursor-pointer hover:bg-gray-200"
      >
        ×
      </button>
    </div>
  );
};

const AddProductForm = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    about: '',
    quantity: 500,
    pricePerPiece: '',
    totalPiecesPerBox: '',
    discountPercentage: 0,
  });
  
  // State for lists and selections
  const [categories, setCategories] = useState([]);
  const [allDimensions, setAllDimensions] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [newDimensionInput, setNewDimensionInput] = useState('');

  // State for file uploads
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);

  // State for UI feedback
  const [status, setStatus] = useState({ message: '', type: '' }); // type: 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const catRes = await fetch('https://threebappbackend.onrender.com/api/categories/get-categories');
        if (!catRes.ok) throw new Error('Failed to fetch categories');
        const catData = await catRes.json();
        setCategories(catData);

        // Fetch dimensions
        await fetchDimensions();

      } catch (error) {
        console.error("Initialization Error:", error);
        setStatus({ message: `Could not load initial data: ${error.message}`, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setFiles, limit) => {
    const files = Array.from(e.target.files);
    if (limit && files.length + setFiles.length > limit) {
      alert(`You can only upload a maximum of ${limit} images.`);
      return;
    }
    setFiles(prev => [...prev, ...files]);
    e.target.value = null; // Reset file input
  };
  
  const handleDimensionSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const dimensionToAdd = allDimensions.find(d => d._id === selectedId);
    if (dimensionToAdd && !selectedDimensions.some(d => d._id === dimensionToAdd._id)) {
      setSelectedDimensions(prev => [...prev, dimensionToAdd]);
    }
    e.target.value = ''; // Reset select dropdown
  };

  const handleAddNewDimension = async () => {
    if (!newDimensionInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('https://threebappbackend.onrender.com/api/dimensions/add-dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDimensionInput.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      alert(`${data.added.length} dimension(s) added successfully.`);
      setNewDimensionInput('');
      await fetchDimensions(); // Refresh the dimensions list
    } catch (error) {
      console.error('Error adding dimension:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDimensions = async () => {
    const dimRes = await fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions');
    if (!dimRes.ok) throw new Error('Failed to fetch dimensions');
    const dimData = await dimRes.json();
    const sorted = dimData.sort((a, b) => {
      const [aW, aH] = a.value.replace('mm', '').split('*').map(Number);
      const [bW, bH] = b.value.replace('mm', '').split('*').map(Number);
      return aW - bW || aH - bH;
    });
    setAllDimensions(sorted);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Please select a category.');
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Uploading product... Please wait.', type: 'info' });

    const submissionData = new FormData();
    submissionData.append('categoryId', formData.categoryId);
    submissionData.append('name', formData.name);
    submissionData.append('about', formData.about);
    submissionData.append('quantity', formData.quantity);
    submissionData.append('pricePerPiece', formData.pricePerPiece);
    submissionData.append('totalPiecesPerBox', formData.totalPiecesPerBox);
    submissionData.append('discountPercentage', formData.discountPercentage);
    submissionData.append('dimensions', JSON.stringify(selectedDimensions.map(d => d._id)));

    colorImages.forEach(file => submissionData.append('colorImages', file));
    productImages.forEach(file => submissionData.append('images', file));

    try {
      const res = await fetch('https://threebtest.onrender.com/api/products/add', {
        method: 'POST',
        body: submissionData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product.');
      }

      setStatus({ message: 'Product added successfully! Form will reset.', type: 'success' });
      setTimeout(() => {
        // A full reload might be desired, but resetting the form is more "React-like"
        window.location.reload(); 
      }, 2000);

    } catch (error) {
      console.error(error);
      setStatus({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-100 to-gray-200 min-h-screen w-full flex flex-col items-center p-4 sm:p-8 font-sans">
      
      {isLoading && <Loader />}
      
      <button 
        type="button" 
        onClick={() => window.history.back()} 
        className="self-start mb-5 px-5 py-2 text-base font-semibold bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
      >
        ← Back
      </button>

      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-3xl"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">Add Product</h2>

        {/* --- Form Fields --- */}
        {/* Category */}
        <label htmlFor="categorySelect" className="block mt-4 text-sm font-semibold text-gray-700">Category</label>
        <select id="categorySelect" name="categoryId" value={formData.categoryId} onChange={handleInputChange} required
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        
        {/* Product Name */}
        <label htmlFor="name" className="block mt-4 text-sm font-semibold text-gray-700">Product Name</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter product name"
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          
        {/* About */}
        <label htmlFor="about" className="block mt-4 text-sm font-semibold text-gray-700">About</label>
        <textarea id="about" name="about" value={formData.about} onChange={handleInputChange} rows="3" required placeholder="Product description"
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"></textarea>

        {/* Color Images */}
        <label htmlFor="colorImages" className="block mt-4 text-sm font-semibold text-gray-700">Upload Color Images</label>
        <input type="file" id="colorImages" multiple accept="image/*" onChange={(e) => handleFileChange(e, setColorImages)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <div className="flex flex-wrap mt-2 gap-4">
          {colorImages.map((file, index) => (
            <ImageThumb key={index} file={file} onRemove={() => setColorImages(prev => prev.filter((_, i) => i !== index))} />
          ))}
        </div>

        {/* Dimensions */}
        <label htmlFor="existingDimensionsSelect" className="block mt-4 text-sm font-semibold text-gray-700">Select Existing Dimension</label>
        <select id="existingDimensionsSelect" onChange={handleDimensionSelect}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition">
          <option value="">-- Select --</option>
          {allDimensions.map(dim => (
            <option key={dim._id} value={dim._id}>{dim.value}</option>
          ))}
        </select>
        <div className="mt-2 min-h-[2rem]">
          {selectedDimensions.map(dim => (
            <span key={dim._id} className="inline-flex items-center bg-blue-500 text-white text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
              {dim.value}
              <button type="button" onClick={() => setSelectedDimensions(prev => prev.filter(d => d._id !== dim._id))}
                className="ml-2 text-white font-bold hover:text-gray-200">×</button>
            </span>
          ))}
        </div>

        {/* Add New Dimension */}
        <label htmlFor="newDimensionInput" className="block mt-4 text-sm font-semibold text-gray-700">Add New Dimension</label>
        <div className="flex items-center gap-2 mt-1">
          <input type="text" id="newDimensionInput" value={newDimensionInput} onChange={(e) => setNewDimensionInput(e.target.value)} placeholder="Eg: 20x40 or 20x40, 30x60"
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          <button type="button" onClick={handleAddNewDimension}
            className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap">
            Add
          </button>
        </div>

        {/* Numerical Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <label htmlFor="quantity" className="block mt-4 text-sm font-semibold text-gray-700">Quantity (min 500)</label>
            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} min="500" required
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          </div>
          <div>
            <label htmlFor="pricePerPiece" className="block mt-4 text-sm font-semibold text-gray-700">Price Per Piece</label>
            <input type="number" id="pricePerPiece" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} min="0" step="0.01" required
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          </div>
          <div>
            <label htmlFor="totalPiecesPerBox" className="block mt-4 text-sm font-semibold text-gray-700">Total Pieces Per Box</label>
            <input type="number" id="totalPiecesPerBox" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} min="1" required
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          </div>
          <div>
            <label htmlFor="discountPercentage" className="block mt-4 text-sm font-semibold text-gray-700">Discount Percentage (%)</label>
            <input type="number" id="discountPercentage" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} min="0" step="0.01"
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition" />
          </div>
        </div>

        {/* Product Images */}
        <label htmlFor="images" className="block mt-4 text-sm font-semibold text-gray-700">Product Images (max 10)</label>
        <input type="file" id="images" multiple accept="image/*" onChange={(e) => handleFileChange(e, setProductImages, 10)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        <div className="flex flex-wrap mt-2 gap-4">
          {productImages.map((file, index) => (
            <ImageThumb key={index} file={file} onRemove={() => setProductImages(prev => prev.filter((_, i) => i !== index))} />
          ))}
        </div>
        
        {/* --- Submission --- */}
        <button type="submit"
          className="w-full mt-8 py-3 px-6 text-lg font-semibold bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Add Product'}
        </button>

        {/* Status Message */}
        {status.message && (
          <div className={`text-center mt-4 p-2 rounded-md font-semibold text-sm
            ${status.type === 'success' ? 'bg-green-100 text-green-700' : ''}
            ${status.type === 'error' ? 'bg-red-100 text-red-700' : ''}
            ${status.type === 'info' ? 'bg-blue-100 text-blue-700' : ''}
          `}>
            {status.message}
          </div>
        )}

      </form>
    </div>
  );
};

export default AddProductForm;