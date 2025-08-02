// src/components/ViewProducts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- Reusable Components ---

// Reusable Modal Component (FIXED: Centered layout with overlay and optimized for scrolling)
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full my-8 border flex flex-col max-h-[90vh]`}>
        {/* Children will now provide the full structure: header, body, footer */}
        {children}
      </div>
    </div>
  );
};

// Reusable Image Thumbnail component for previews
const ImageThumb = ({ file, onRemove }) => (
  <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
    <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 cursor-pointer hover:bg-gray-200">×</button>
  </div>
);

// --- Add Product Modal Component (FIXED) ---
const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({ categoryId: '', name: '', about: '', quantity: 500, pricePerPiece: '', totalPiecesPerBox: '', discountPercentage: 0 });
  const [categories, setCategories] = useState([]);
  const [allDimensions, setAllDimensions] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [newDimensionInput, setNewDimensionInput] = useState('');
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchModalData = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      // FIXED: Using the correct and consistent API endpoints for this project
      const [catRes, dimRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category'),
        fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions') // Assuming this one is correct as per user
      ]);
      if (!catRes.ok) throw new Error('Failed to fetch categories');
      if (!dimRes.ok) throw new Error('Failed to fetch dimensions');
      const catData = await catRes.json();
      const dimData = await dimRes.json();
      setCategories(Array.isArray(catData) ? catData : []);
      setAllDimensions(Array.isArray(dimData) ? dimData.sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true })) : []);
    } catch (error) {
      toast.error(`Could not load form data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchModalData();
  }, [fetchModalData]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e, setFiles, limit) => { /* ... no changes ... */ };
  const handleDimensionSelect = (e) => { /* ... no changes ... */ };
  const handleAddNewDimension = async () => { /* ... no changes ... */ };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error('Please select a category.');
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submissionData.append(key, value));
    submissionData.append('dimensions', JSON.stringify(selectedDimensions.map(d => d._id)));
    colorImages.forEach(file => submissionData.append('colorImages', file));
    productImages.forEach(file => submissionData.append('images', file));
    
    // FIXED: Using a consistent API endpoint for adding products
    const promise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/add', {
      method: 'POST',
      body: submissionData,
    }).then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || "Submission failed") });
        return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding product...',
      success: () => {
        onClose();
        setTimeout(() => onProductAdded(), 1000); // Trigger refresh
        return 'Product added successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const inputClass = "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
      </div>
      <div className="overflow-y-auto px-6 py-4 flex-grow">
        {isLoading ? <div className="text-center p-8 text-gray-500">Loading form data...</div> : (
          <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Category</label><select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={inputClass}><option value="">Select Category</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div>
              <div><label className="text-sm font-semibold text-gray-700">Product Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter product name" className={inputClass} /></div>
            </div>
            <div><label className="text-sm font-semibold text-gray-700">About</label><textarea name="about" value={formData.about} onChange={handleInputChange} rows="3" required placeholder="Product description" className={inputClass}></textarea></div>
            <div><label className="text-sm font-semibold text-gray-700">Upload Color Images</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setColorImages)} className={`${fileInputClass} mt-1`} /><div className="flex flex-wrap mt-2 gap-4">{colorImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setColorImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Dimensions</label><select onChange={handleDimensionSelect} className={`${inputClass} mb-2`}><option value="">-- Select to add --</option>{allDimensions.map(dim => <option key={dim._id} value={dim._id}>{dim.value}</option>)}</select>
              <div className="mt-1 min-h-[2rem] p-2 bg-gray-50 rounded-lg">{selectedDimensions.length > 0 ? selectedDimensions.map(dim => (<span key={dim._id} className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full">{dim.value}<button type="button" onClick={() => setSelectedDimensions(prev => prev.filter(d => d._id !== dim._id))} className="ml-2 font-bold hover:text-gray-200">×</button></span>)) : <span className="text-gray-400 text-sm">No dimensions selected.</span>}</div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Add New Dimension</label>
              <div className="flex items-center gap-2 mt-1"><input type="text" value={newDimensionInput} onChange={(e) => setNewDimensionInput(e.target.value)} placeholder="Eg: 20x40" className="flex-grow p-2 border border-gray-300 rounded-xl" /><button type="button" onClick={handleAddNewDimension} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">Add</button></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="500" required className={inputClass} /></div>
              <div><label className="text-sm font-semibold text-gray-700">Price/Piece</label><input type="number" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} min="0" step="0.01" required className={inputClass} /></div>
              <div><label className="text-sm font-semibold text-gray-700">Pieces/Box</label><input type="number" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} min="1" required className={inputClass} /></div>
              <div><label className="text-sm font-semibold text-gray-700">Discount %</label><input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} min="0" step="0.01" className={inputClass} /></div>
            </div>
            <div><label className="text-sm font-semibold text-gray-700">Product Images (max 10)</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setProductImages, 10)} className={`${fileInputClass} mt-1`} /><div className="flex flex-wrap mt-2 gap-4">{productImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setProductImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>
          </form>
        )}
      </div>
      <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0">
        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
        <button type="submit" form="add-product-form" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg">Add Product</button>
      </div>
    </Modal>
  );
};

// --- Main Component ---
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isQrOpen, setQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category')
      ]);
      const productData = await productRes.json();
      const categoryData = await categoryRes.json();
      if (!productData.success) throw new Error('Failed to fetch products');
      if (!Array.isArray(categoryData)) throw new Error('Failed to fetch categories');
      const categoryMap = categoryData.reduce((acc, cat) => ({ ...acc, [cat._id]: cat.name }), {});
      setProducts(productData.products || []);
      setCategories(categoryMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // All handlers below this are unchanged
  const handleProductAdded = () => { window.location.reload(); };
  const showCarousel = (images) => { setCarouselImages(images.map(img => img.url)); setCarouselOpen(true); };
  const showQrCode = (url) => { setQrCodeUrl(url); setQrOpen(true); };
  const handleEdit = (product) => { setEditingId(product._id); setEditFormData({ ...product }); };
  const handleCancelEdit = () => setEditingId(null);
  const handleEditFormChange = (e) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSave = async (productId) => { /* ... */ };
  const handleDelete = async (productId) => { /* ... */ };

  if (isLoading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  const inputClasses = "w-full p-2 border rounded-lg bg-yellow-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">View All Products</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">
            + Add Product
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {['Image', 'Frame', 'Dimensions', 'Category', 'Price/Piece', 'Piece/Box', 'Box Price', 'Discount', 'Qty', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                editingId === product._id ? (
                  <tr key={product._id} className="bg-yellow-50 align-middle">
                    <td className="px-6 py-4"><img src={product.images[0]?.url} className="w-16 h-16 object-cover mx-auto rounded-md" alt={product.name} /></td>
                    <td className="px-6 py-4"><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4"><input type="text" name="dimensions" value={editFormData.dimensions} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4">{categories[product.categoryId] || 'N/A'}</td>
                    <td className="px-6 py-4"><input type="number" name="pricePerPiece" value={editFormData.pricePerPiece} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4"><input type="number" name="totalPiecesPerBox" value={editFormData.totalPiecesPerBox} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4 text-gray-400 text-xs">Auto-Calc</td>
                    <td className="px-6 py-4"><input type="number" name="discountPercentage" value={editFormData.discountPercentage} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4"><input type="number" name="quantity" value={editFormData.quantity} onChange={handleEditFormChange} className={inputClasses} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => handleSave(product._id)} title="Save" className="text-green-600 hover:text-green-800 p-2"><FontAwesomeIcon icon={faSave} size="lg" /></button>
                      <button onClick={handleCancelEdit} title="Cancel" className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                    </td>
                  </tr>
                ) : (
                  <tr key={product._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                    <td className="px-6 py-4"><img src={product.images[0]?.url} onClick={() => showCarousel(product.images)} className="w-16 h-16 object-cover rounded-md cursor-pointer" alt={product.name} /></td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4">{product.dimensions || '—'}</td>
                    <td className="px-6 py-4">{categories[product.categoryId] || 'N/A'}</td>
                    <td className="px-6 py-4">₹{product.pricePerPiece}</td>
                    <td className="px-6 py-4">{product.totalPiecesPerBox}</td>
                    <td className="px-6 py-4">₹{product.finalPricePerBox || product.mrpPerBox}</td>
                    <td className="px-6 py-4">{product.discountPercentage || 0}%</td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => showQrCode(product.qrCodeUrl)} title="Show QR Code" className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faQrcode} /></button>
                      <button onClick={() => handleEdit(product)} title="Edit" className="text-blue-600 hover:text-blue-800 p-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
                      <button onClick={() => handleDelete(product._id)} title="Delete" className="text-red-600 hover:text-red-800 p-2"><FontAwesomeIcon icon={faTrash} /></button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCarouselOpen} onClose={() => setCarouselOpen(false)}>
   
      </Modal>

      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        {/* Unchanged */}
      </Modal>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
}

export default ViewProducts;