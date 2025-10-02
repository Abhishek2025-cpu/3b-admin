import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';


// --- Reusable Components ---
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start pt-28 z-50 p-4 overflow-y-auto pointer-events-none">
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-8rem)] pointer-events-auto`}>
        {children}
      </div>
    </div>
  );
};

const ImageThumb = ({ file, onRemove, isUrl = false }) => (
  <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
    <img src={isUrl ? file : URL.createObjectURL(file)} alt="product thumbnail" className="w-full h-full object-cover" />
    <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-red-600 cursor-pointer hover:bg-red-100">×</button>
  </div>
);

// --- Add Product Modal Component (MODIFIED) ---
const AddProductModal = ({ isOpen, onClose, onProductAdded, categories, dimensions, handleAddNewDimension, newDimensionInput, setNewDimensionInput }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    about: '',
    quantity: '',
    pricePerPiece: '',
    totalPiecesPerBox: '',
    discountPercentage: 0
  });
  const [descriptionParts, setDescriptionParts] = useState(Array(10).fill(''));
  const [showAllDescriptionBoxes, setShowAllDescriptionBoxes] = useState(false);

  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ categoryId: '', name: '', about: '', quantity: 500, pricePerPiece: '', totalPiecesPerBox: '', discountPercentage: 0 });
      setDescriptionParts(Array(10).fill(''));
      setShowAllDescriptionBoxes(false);
      setSelectedDimensions([]);
      // setNewDimensionInput(''); // This state is now managed by ViewProducts
      setColorImages([]);
      setProductImages([]);
      setIsCompressing(false);
    }
  }, [isOpen]);

  const handleDescriptionPartChange = (e, index) => {
    const newParts = [...descriptionParts];
    newParts[index] = e.target.value.substring(0, 20);
    setDescriptionParts(newParts);
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
    const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    try {
      const compressedFiles = await Promise.all(filesToProcess.map(file => imageCompression(file, compressionOptions)));
      compressedFiles.forEach((file, index) => { file.name = filesToProcess[index].name; });
      setFiles(prev => [...prev, ...compressedFiles]);
      toast.success('Compression complete!', { id: toastId });
    } catch (error) {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Model Number is required.');
    if (!formData.categoryId) return toast.error('Please select a category.');
    if (isCompressing) return toast.error('Please wait for images to finish processing.');

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => submissionData.append(key, value));

    const combinedDescription = descriptionParts.filter(p => p.trim()).join(' ').trim();
    submissionData.append('description', combinedDescription);

    submissionData.append('dimensions', selectedDimensions.map(d => d.value).join(','));
    colorImages.forEach(file => submissionData.append('colorImages', file, file.name));
    productImages.forEach(file => submissionData.append('images', file, file.name));

    const promise = fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/add', {
      method: 'POST', body: submissionData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add product');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding product...',
      success: () => {
        onProductAdded();
        onClose();
        console.log("Product added successfully!");
        return 'Product added successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const inputClass = "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";
  const visibleDescriptionBoxes = showAllDescriptionBoxes ? 10 : 4;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
      </div>
      <div className="overflow-y-auto px-6 py-6 flex-grow min-h-0">
        <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={inputClass}><option value="">Select Category</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Model Number</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Enter the product model number" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {descriptionParts.slice(0, visibleDescriptionBoxes).map((part, index) => (<input key={index} type="text" value={part} onChange={(e) => handleDescriptionPartChange(e, index)} className="w-full h-10 text-center border border-gray-300 rounded-lg focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition" maxLength="20" />))}
            </div>
            {!showAllDescriptionBoxes && (<div className="text-right mt-2"><button type="button" onClick={() => setShowAllDescriptionBoxes(true)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 justify-end"><FontAwesomeIcon icon={faPlus} size="xs" /> Add More Boxes</button></div>)}
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">About</label>
            <textarea name="about" value={formData.about} onChange={handleInputChange} rows="3" placeholder="More details about the product" className={inputClass}></textarea>
          </div>

          <div><label className="text-sm font-semibold text-gray-700">Upload Color Images</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setColorImages, colorImages)} className={`${fileInputClass} mt-1`} disabled={isCompressing} /><div className="flex flex-wrap mt-2 gap-4">{colorImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setColorImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Dimensions</label>
            <div className="flex items-center gap-2">
              <select onChange={handleDimensionSelect} className={inputClass + ' mt-0 flex-grow'}><option value="">-- Select to add --</option>{dimensions.map(dim => <option key={dim._id} value={dim._id}>{dim.value}</option>)}</select>
              <input type="text" placeholder="Add new dimension" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass + ' mt-0'} />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">Add</button>
            </div>
            <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">{selectedDimensions.length > 0 ? selectedDimensions.map(dim => (<span key={dim._id} className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full">{dim.value}<button type="button" onClick={() => setSelectedDimensions(prev => prev.filter(d => d._id !== dim._id))} className="ml-2 font-bold hover:text-gray-200">×</button></span>)) : <span className="text-gray-400 text-sm">No dimensions selected.</span>}</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold text-gray-700">Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className="text-sm font-semibold text-gray-700">Price/Piece</label><input type="number" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} min="0" step="0.01" required className={inputClass} /></div>
            <div><label className="text-sm font-semibold text-gray-700">Pieces/Box</label><input type="number" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} min="1" required className={inputClass} /></div>
            <div><label className="text-sm font-semibold text-gray-700">Discount %</label><input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} min="0" step="0.01" className={inputClass} /></div>
          </div>
          <div><label className="text-sm font-semibold text-gray-700">Product Images (max 10)</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileChange(e, setProductImages, productImages, 10)} className={`${fileInputClass} mt-1`} disabled={isCompressing} /><div className="flex flex-wrap mt-2 gap-4">{productImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => setProductImages(prev => prev.filter((_, i) => i !== index))} />)}</div></div>
        </form>
      </div>
      <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t flex-shrink-0 rounded-b-2xl">
        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
        <button type="submit" form="add-product-form" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg" disabled={isCompressing}>{isCompressing ? 'Processing...' : 'Add Product'}</button>
      </div>
    </Modal>
  );
};


// --- Update Product Modal (MODIFIED) ---
const UpdateProductModal = ({ isOpen, onClose, onUpdateSuccess, product, dimensions, handleAddNewDimension, newDimensionInput, setNewDimensionInput }) => {
  const [formData, setFormData] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState([]);


  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        pricePerPiece: product.pricePerPiece || '',
        totalPiecesPerBox: product.totalPiecesPerBox || '',
        discountPercentage: product.discountPercentage || 0,
        quantity: product.quantity || '',
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setImagesToDelete([]);

      const dims = Array.isArray(product.dimensions)
        ? product.dimensions.map(d => ({ _id: d._id || d, value: d.value || d }))
        : [];
      setSelectedDimensions(dims);
    }
  }, [product]);


  const handleFileChange = async (e) => {
    const filesToProcess = Array.from(e.target.files);
    e.target.value = null;
    const limit = 10;
    if (filesToProcess.length + existingImages.length + newImages.length > limit) {
      toast.error(`You can only have a maximum of ${limit} images in total.`);
      return;
    }
    setIsCompressing(true);
    const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);
    const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    try {
      const compressedFiles = await Promise.all(filesToProcess.map(file => imageCompression(file, compressionOptions)));
      compressedFiles.forEach((file, index) => { file.name = filesToProcess[index].name; });
      setNewImages(prev => [...prev, ...compressedFiles]);
      toast.success('Compression complete!', { id: toastId });
    } catch (error) {
      toast.error('Failed to process images.', { id: toastId });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveExistingImage = (imageToRemove) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageToRemove.id));
    setImagesToDelete(prev => [...prev, imageToRemove.id]);
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    // No need to split formData.dimensions, as selectedDimensions is now the source of truth
    data.append('dimensions', selectedDimensions.map(d => d.value).join(','));

    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    newImages.forEach(file => data.append('images', file, file.name));

    if (imagesToDelete.length > 0) {
      data.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    const promise = fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${product._id}`, {
      method: 'PUT',
      body: data,
    }).then(res => {
      if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Update failed') });
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Updating product...',
      success: () => { onUpdateSuccess(); onClose(); return 'Product updated successfully!'; },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const inputClass = "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Update Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
      </div>
      <div className="overflow-y-auto px-6 py-6 min-h-0">
        <form id="update-product-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div><label className="text-sm font-semibold text-gray-700">Name / Frame</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClass} /></div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Dimensions</label>
            <div className="flex items-center gap-2">
              <select onChange={(e) => {
                const dim = dimensions.find(d => d._id === e.target.value);
                if (dim && !selectedDimensions.some(d => d._id === dim._id)) {
                  setSelectedDimensions(prev => [...prev, dim]);
                }
                e.target.value = '';
              }} className={inputClass + ' mt-0 flex-grow'}>
                <option value="">-- Select to add --</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" placeholder="Add new dimension" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass + ' mt-0'} />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">Add</button>
            </div>

            <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">
              {selectedDimensions.length > 0
                ? selectedDimensions.map(dim => (
                  <span key={dim._id} className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full">
                    {dim.value}
                    <button type="button" onClick={() => setSelectedDimensions(prev => prev.filter(d => d._id !== dim._id))} className="ml-2 font-bold hover:text-gray-200">×</button>
                  </span>
                ))
                : <span className="text-gray-400 text-sm">No dimensions selected.</span>
              }
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold">Price/Piece</label><input type="number" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className="text-sm font-semibold">Pieces/Box</label><input type="number" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} required className={inputClass} /></div>
            <div><label className="text-sm font-semibold">Discount %</label><input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="text-sm font-semibold">Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className={inputClass} /></div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Manage Product Images</label>
            <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Existing Images</h4>
                {existingImages.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {existingImages.map((img) => <ImageThumb key={img.id} file={img.url} onRemove={() => handleRemoveExistingImage(img)} isUrl={true} />)}
                  </div>
                ) : <p className="text-sm text-gray-400">No existing images.</p>}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Add New Images</h4>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className={fileInputClass} disabled={isCompressing} />
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {newImages.map((file, index) => <ImageThumb key={index} file={file} onRemove={() => handleRemoveNewImage(index)} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t rounded-b-2xl">
        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
        <button type="submit" form="update-product-form" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg" disabled={isCompressing}>{isCompressing ? 'Processing...' : 'Update Product'}</button>
      </div>
    </Modal>
  );
};


// --- Main Component (MODIFIED) ---
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [dimensionList, setDimensionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isQrOpen, setQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDimensionInput, setNewDimensionInput] = useState(''); // State for new dimension input


  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [productsRes, categoriesRes, dimensionsRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category'),
        fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions')
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !dimensionsRes.ok) {
        throw new Error('Failed to fetch initial data.');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const dimensionsData = await dimensionsRes.json();

      setProducts(Array.isArray(productsData.products) ? productsData.products : []);
      setCategoryList(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
      setDimensionList(Array.isArray(dimensionsData) ? dimensionsData : []);

    } catch (err) {
      setError(err.message);
      toast.error("Could not fetch data.");
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Move handleAddNewDimension to ViewProducts
  const handleAddNewDimension = async () => {
    const value = newDimensionInput.trim();
    if (!value) {
      toast.error("Please enter a dimension value.");
      return;
    }

    const promise = fetch('https://threebappbackend.onrender.com/api/dimensions/add-dimensions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add dimension');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding dimension...',
      success: () => {
        setNewDimensionInput(''); // Clear the input after successful add
        fetchData(); // Re-fetch dimensions to update lists
        return 'Dimension added successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // onDimensionAdded now just calls fetchData, as the actual add logic is above
  const handleDimensionAdded = () => { fetchData(); };
  const handleProductAdded = () => { fetchData(); };
  const showCarousel = (images) => { setCarouselImages(images.map(img => img.url)); setCarouselOpen(true); };
  const showQrCode = (url) => { setQrCodeUrl(url); setQrOpen(true); };
  const handleEdit = (product) => { setSelectedProduct(product); setIsUpdateModalOpen(true); };
  const handleUpdateSuccess = () => { fetchData(); };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const promise = fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete/${productId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Delete failed') });
        return res.json();
      });

    toast.promise(promise, {
      loading: 'Deleting product...',
      success: () => { fetchData(); return 'Product deleted successfully!'; },
      error: (err) => `Error: ${err.message}`,
    });
  };

  if (isLoading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">View All Products</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">+ Add Product</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>{['Image', 'Frame', 'Dimensions', 'Price/Piece', 'Piece/Box', 'Box Price', 'Discount', 'Qty', 'Actions'].map(header => (<th key={header} className="px-6 py-3">{header}</th>))}</tr></thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                  <td className="px-6 py-4">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]?.url} onClick={() => showCarousel(product.images)} className="w-16 h-16 object-cover rounded-md cursor-pointer" alt={product.name} />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    {/* Ensure product.dimensions is an array before calling join */}
                    <td className="px-6 py-4">{Array.isArray(product.dimensions) ? product.dimensions.map(d => d.value || d).join(', ') : '—'}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCarouselOpen} onClose={() => setCarouselOpen(false)}>
        {/* You had two carousel modals, keeping one and adding a check for images */}
        {carouselImages.length > 0 && (
          <img src={carouselImages[0]} alt="Product Carousel" className="max-w-full max-h-[80vh] rounded-lg" />
        )}
      </Modal>
      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        {qrCodeUrl && <img src={qrCodeUrl} alt="Product QR Code" className="w-64 h-64 rounded-lg" />}
      </Modal>

      {/* Pass the new dimension states and handler to AddProductModal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
        categories={categoryList}
        dimensions={dimensionList}
        handleAddNewDimension={handleAddNewDimension}
        newDimensionInput={newDimensionInput}
        setNewDimensionInput={setNewDimensionInput}
      />

      {/* Pass the new dimension states and handler to UpdateProductModal */}
      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdateSuccess={handleUpdateSuccess}
        product={selectedProduct}
        dimensions={dimensionList}
        handleAddNewDimension={handleAddNewDimension}
        newDimensionInput={newDimensionInput}
        setNewDimensionInput={setNewDimensionInput}
      />
    </div>
  );
}

export default ViewProducts;