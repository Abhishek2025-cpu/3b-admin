import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';


// --- Reusable Components ---

const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    // MODIFICATION: Added overflow-y-auto as a fallback for very small screens.
    // The pt-28 provides the margin from the top for your header.
    <div className="fixed inset-0 flex justify-center items-start pt-28 z-50 p-4 overflow-y-auto">
      {/* MODIFICATION: Removed 'my-8' and established a robust max-height. 
          The flexbox structure is key to the scrolling behavior. */}
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-8rem)]`}>
        {children}
      </div>
    </div>
  );
};

const ImageThumb = ({ file, onRemove }) => (
  <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
    <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-700 cursor-pointer hover:bg-gray-200">×</button>
  </div>
);

// --- Add Product Modal Component ---
const AddProductModal = ({ isOpen, onClose, onProductAdded, categories, dimensions, onDimensionAdded }) => {
  // ... (State and handlers are unchanged)
  const [formData, setFormData] = useState({ categoryId: '', about: '', quantity: 500, pricePerPiece: '', totalPiecesPerBox: '', discountPercentage: 0 });
  const [productNameParts, setProductNameParts] = useState(Array(4).fill(''));
  const nameInputRefs = useRef([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [newDimensionInput, setNewDimensionInput] = useState('');
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setFormData({ categoryId: '', about: '', quantity: 500, pricePerPiece: '', totalPiecesPerBox: '', discountPercentage: 0 });
        setProductNameParts(Array(4).fill(''));
        setSelectedDimensions([]);
        setColorImages([]);
        setProductImages([]);
        setIsCompressing(false);
    }
  }, [isOpen]);

  const handleNamePartChange = (e, index) => {
    const { value } = e.target;
    const newParts = [...productNameParts];
    newParts[index] = value.substring(0, 4).toUpperCase();
    setProductNameParts(newParts);
    if (value && index < 3) {
      nameInputRefs.current[index + 1]?.focus();
    }
  };

  const handleNamePartKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !productNameParts[index] && index > 0) {
      nameInputRefs.current[index - 1]?.focus();
    }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleFileChange = async (e, setFiles, currentFiles, limit) => {
    const filesToProcess = Array.from(e.target.files);
    e.target.value = null;

    if (limit && (filesToProcess.length + currentFiles.length > limit)) {
      toast.error(`You can only upload a maximum of ${limit} images in total.`);
      return;
    }

    setIsCompressing(true);
    const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);

    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFilesPromises = filesToProcess.map(file => 
        imageCompression(file, compressionOptions)
      );
      const compressedFiles = await Promise.all(compressedFilesPromises);

      compressedFiles.forEach((file, index) => {
          file.name = filesToProcess[index].name;
      });
      
      setFiles(prev => [...prev, ...compressedFiles]);
      toast.success('Compression complete!', { id: toastId });
    } catch (error) {
      console.error("Image compression error: ", error);
      toast.error('Failed to process images.', { id: toastId });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDimensionSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const dimensionToAdd = dimensions.find(d => d._id === selectedId);
    if (dimensionToAdd && !selectedDimensions.some(d => d._id === dimensionToAdd._id)) {
      setSelectedDimensions(prev => [...prev, dimensionToAdd]);
    }
    e.target.value = '';
  };
  
  const handleAddNewDimension = async () => {
    if (!newDimensionInput.trim()) return;
    const promise = fetch('https://node-api-1067354145699.asia-south1.run.app/api/dimensions/add-dimensions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newDimensionInput.trim() }),
    }).then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.message || 'Failed to add dimension'); });
        }
        return res.json();
    }).then(data => {
        if (data && data.dimension) {
            onDimensionAdded(data.dimension);
        }
        setNewDimensionInput('');
        return data;
    });

    toast.promise(promise, {
      loading: 'Adding dimension...',
      success: 'Dimension added successfully!',
      error: (err) => `Error: ${err.message}`,
    });
  };

const handleFormSubmit = async (e) => {
    e.preventDefault();
    const combinedName = productNameParts.join(' ').trim();
    if (!combinedName || productNameParts.some(p => p === '')) {
      return toast.error('Product Name is required. Please fill all four boxes.');
    }
    if (!formData.categoryId) return toast.error('Please select a category.');
    if (isCompressing) return toast.error('Please wait for images to finish processing.');

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        submissionData.append(key, value);
    });
    
    submissionData.append('name', combinedName);

    const dimensionString = selectedDimensions.map(d => d.value).join(',');
    submissionData.append('dimensions', dimensionString);

    colorImages.forEach(file => submissionData.append('colorImages', file, file.name));
    productImages.forEach(file => submissionData.append('images', file, file.name));
    
    const promise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/add', {
      method: 'POST',
      body: submissionData,
    }).then(async (res) => {
        if (!res.ok) {
          let errorBody;
          try { errorBody = await res.json(); } catch (jsonError) {
            errorBody = { message: await res.text(), error: 'Response was not valid JSON.' };
          }
          const errorMessage = errorBody.details ? Object.values(errorBody.details).map(e => e.message).join(' ') : (errorBody.message || `Request failed with status ${res.status}`);
          throw new Error(errorMessage);
        }
        return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding product...',
      success: () => {
        onProductAdded(); // Refreshes data
        onClose(); // Closes modal
        return 'Product added successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const inputClass = "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      {/* HEADER: flex-shrink-0 prevents this from shrinking */}
      <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
      </div>
      
      {/* CONTENT: This is the scrollable area. */}
      {/* KEY FIX: Added 'min-h-0' to fix flexbox overflow bug. */}
      <div className="overflow-y-auto px-6 py-6 flex-grow min-h-0">
        <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
          {/* Form content remains exactly the same */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-semibold text-gray-700">Category</label><select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={inputClass}><option value="">Select Category</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select></div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Product Name</label>
                <div className="flex items-center gap-3 mt-1">
                  {productNameParts.map((part, index) => (
                    <input key={index} ref={(el) => (nameInputRefs.current[index] = el)} type="text" value={part} onChange={(e) => handleNamePartChange(e, index)} onKeyDown={(e) => handleNamePartKeyDown(e, index)} className="w-full h-10 text-center text-lg font-mono border border-gray-300 rounded-lg focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition" maxLength="4" />
                  ))}
                </div>
              </div>
          </div>
          <div><label className="text-sm font-semibold text-gray-700">About</label><textarea name="about" value={formData.about} onChange={handleInputChange} rows="3" required placeholder="Product description" className={inputClass}></textarea></div>
          <div><label className="text-sm font-semibold text-gray-700">Upload Color Images</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setColorImages, colorImages)} className={`${fileInputClass} mt-1`} disabled={isCompressing} /><div className="flex flex-wrap mt-2 gap-4">{colorImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setColorImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Dimensions</label><select onChange={handleDimensionSelect} className={`${inputClass} mb-2`}><option value="">-- Select to add --</option>{dimensions.map(dim => <option key={dim._id} value={dim._id}>{dim.value}</option>)}</select>
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
          <div><label className="text-sm font-semibold text-gray-700">Product Images (max 10)</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setProductImages, productImages, 10)} className={`${fileInputClass} mt-1`} disabled={isCompressing}/><div className="flex flex-wrap mt-2 gap-4">{productImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setProductImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>
        </form>
      </div>

      {/* FOOTER: flex-shrink-0 prevents this from shrinking and keeps it visible */}
      <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t flex-shrink-0 rounded-b-2xl">
        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
        <button type="submit" form="add-product-form" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg" disabled={isCompressing}>
          {isCompressing ? 'Processing...' : 'Add Product'}
        </button>
      </div>
    </Modal>
  );
};


// --- Main Component ---
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [dimensionList, setDimensionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isQrOpen, setQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categoryMap = useMemo(() => {
    return categoryList.reduce((acc, cat) => ({ ...acc, [cat._id]: cat.name }), {});
  }, [categoryList]);

  const fetchData = useCallback(async () => {
    // Set loading to true only if it's the initial load.
    // This prevents the "Loading..." message on subsequent refetches.
    if (products.length === 0) setIsLoading(true);
    try {
      const [productRes, categoryRes, dimensionRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category'),
        fetch('https://node-api-1067354145699.asia-south1.run.app/api/dimensions/get-dimensions')
      ]);

      if (!productRes.ok) throw new Error('Failed to fetch products');
      if (!categoryRes.ok) throw new Error('Failed to fetch categories');
      if (!dimensionRes.ok) throw new Error('Failed to fetch dimensions');

      const productData = await productRes.json();
      const categoryData = await categoryRes.json();
      const dimensionData = await dimensionRes.json();
      
      setProducts(productData.products || []);
      setCategoryList(Array.isArray(categoryData) ? categoryData : []);
      setDimensionList(Array.isArray(dimensionData) ? dimensionData : []);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [products.length]); // Dependency added to manage initial load state

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDimensionAdded = (newDimension) => {
    setDimensionList(prevList => [...prevList, newDimension]);
  };

  // IMPROVEMENT: Refetches data instead of reloading the entire page for a better UX.
  const handleProductAdded = () => { fetchData(); };
  const showCarousel = (images) => { setCarouselImages(images.map(img => img.url)); setCarouselOpen(true); };
  const showQrCode = (url) => { setQrCodeUrl(url); setQrOpen(true); };
  const handleEdit = (product) => { setEditingId(product._id); setEditFormData({ ...product }); };
  const handleCancelEdit = () => setEditingId(null);
  const handleEditFormChange = (e) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSave = async (productId) => { /* Unchanged */ };
  const handleDelete = async (productId) => { /* Unchanged */ };

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
            {/* Table content is unchanged */}
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                {['Image', 'Frame', 'Dimensions', 'Price/Piece', 'Piece/Box', 'Box Price', 'Discount', 'Qty', 'Actions'].map(header => (
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
                    <td className="px-6 py-4"><input type="text" name="dimensions" value={editFormData.dimensions.join(', ')} onChange={handleEditFormChange} className={inputClasses} /></td>
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
                    <td className="px-6 py-4">{Array.isArray(product.dimensions) ? product.dimensions.join(', ') : '—'}</td>
                    <td className="px-6 py-4">₹{product.pricePerPiece}</td>
                    <td className="px-6 py-4">{product.totalPiecesPerBox}</td>
                    <td className="px-6 py-4">₹{product.finalPricePerBox || product.mrpPerBox}</td>
                    <td className="px-6 py-4">{product.discountPercentage || 0}%</td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => showQrCode(product.qrCodeUrl)} title="Show QR Code" className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faQrcode} /></button>
                      {/* <button onClick={() => handleEdit(product)} title="Edit" className="text-blue-600 hover:text-blue-800 p-2"><FontAwesomeIcon icon={faPenToSquare} /></button> */}
                      <button onClick={() => handleDelete(product._id)} title="Delete" className="text-red-600 hover:text-red-800 p-2"><FontAwesomeIcon icon={faTrash} /></button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Other Modals (Carousel, QR) are unchanged */}
      <Modal isOpen={isCarouselOpen} onClose={() => setCarouselOpen(false)}>
        {/* ... */}
      </Modal>
      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        {/* ... */}
      </Modal>
      
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
        categories={categoryList}
        dimensions={dimensionList}
        onDimensionAdded={handleDimensionAdded}
      />
    </div>
  );
}

export default ViewProducts;