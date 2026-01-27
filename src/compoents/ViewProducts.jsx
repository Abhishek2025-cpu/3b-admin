import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faPlus, faTimes, faChevronLeft, faChevronRight, faFilter, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';

// --- Shared Constants ---
const inputClass = "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition text-sm";
const fileInputClass = "block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";

// --- Reusable Components ---
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start pt-28 z-50 p-4 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-8rem)] animate-in fade-in zoom-in duration-200`}>
        {children}
      </div>
    </div>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} size="xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
        <p className="text-gray-500 mt-2 text-sm">
          Are you sure you want to delete <span className="font-bold text-gray-800">"{productName}"</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-200 transition"
          >
            Delete Now
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ImageThumb = memo(({ file, onRemove, isUrl = false }) => {
  const [preview, setPreview] = useState("");
  useEffect(() => {
    if (isUrl) { setPreview(file); return; }
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isUrl]);

  return (
    <div className="relative w-24 h-24 border border-gray-300 rounded-lg overflow-hidden shadow-sm group">
      {preview && <img src={preview} alt="thumb" className="w-full h-full object-cover" />}
      <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
    </div>
  );
});

// --- Add Product Modal ---
function AddProductModal({ isOpen, onClose, onProductAdded, categories = [], dimensions = [], handleAddNewDimension, newDimensionInput, setNewDimensionInput }) {
  const [formData, setFormData] = useState({ categoryId: "", name: "", about: "", quantity: 500, pricePerPiece: "", totalPiecesPerBox: "", discountPercentage: 0, position: 1 });
  const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
  const [visibleBoxes, setVisibleBoxes] = useState(4);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ categoryId: "", name: "", about: "", quantity: 500, pricePerPiece: "", totalPiecesPerBox: "", discountPercentage: 0, position: 1 });
      setDescriptionParts(Array(20).fill(""));
      setVisibleBoxes(4);
      setSelectedDimensions([]);
      setColorImages([]);
      setProductImages([]);
      setNewDimensionInput("");
    }
  }, [isOpen, setNewDimensionInput]);

  const handleFileChange = async (e, setter) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsCompressing(true);
    const toastId = toast.loading("Compressing images...");
    try {
      const options = { maxSizeMB: 0.7, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressed = await Promise.all(files.map(f => imageCompression(f, options)));
      setter(prev => [...prev, ...compressed]);
      toast.success("Ready!", { id: toastId });
    } catch (err) { toast.error("Failed", { id: toastId }); }
    finally { setIsCompressing(false); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const desc = descriptionParts.filter(p => p.trim()).join(" ").trim();
    if (!formData.name || !desc || selectedDimensions.length === 0) return toast.error("Fill required fields");

    const submissionData = new FormData();
    Object.entries(formData).forEach(([k, v]) => submissionData.append(k, v));
    submissionData.append("description", desc);
    submissionData.append("dimensions", selectedDimensions.map(d => d._id).join(","));
    colorImages.forEach(f => submissionData.append("colorImages", f, f.name));
    productImages.forEach(f => submissionData.append("images", f, f.name));

    try {
      const res = await fetch("https://threebapi-1067354145699.asia-south1.run.app/api/products/add", { method: "POST", body: submissionData });
      if (res.ok) { onProductAdded(); onClose(); toast.success("Added!"); }
    } catch (err) { toast.error("Error adding product"); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold">Add New Product</h3>
        <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
      </div>
      
      <div className="overflow-y-auto px-6 py-6 space-y-4">
        <form id="add-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500">CATEGORY</label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">MODEL NUMBER *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">POSITION</label>
              <input type="number" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">DESCRIPTION BOXES</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {descriptionParts.slice(0, visibleBoxes).map((p, i) => (
                <input 
                  key={i} 
                  value={p} 
                  onChange={e => { 
                    const np = [...descriptionParts]; 
                    np[i] = e.target.value.slice(0, 20); 
                    setDescriptionParts(np); 
                  }} 
                  className="w-full h-9 text-center border rounded-lg text-sm" 
                />
              ))}
            </div>
            {visibleBoxes < 20 && (
              <button type="button" onClick={() => setVisibleBoxes(v => Math.min(v + 4, 20))} className="text-blue-600 text-xs mt-2">+ Add More</button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-xs font-bold">STOCK QTY</label><input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold">PRICE/PC</label><input type="number" value={formData.pricePerPiece} onChange={e => setFormData({...formData, pricePerPiece: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold">PCS/BOX</label><input type="number" value={formData.totalPiecesPerBox} onChange={e => setFormData({...formData, totalPiecesPerBox: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold">DISCOUNT %</label><input type="number" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} className={inputClass} /></div>
          </div>

          <div>
            <label className="text-xs font-bold">DIMENSIONS *</label>
            <div className="flex gap-2">
              <select 
                onChange={e => { 
                  const d = dimensions.find(x => x._id === e.target.value); 
                  if(d && !selectedDimensions.find(s => s._id === d._id)) { setSelectedDimensions([...selectedDimensions, d]); }
                  e.target.value=""; 
                }} 
                className={inputClass}
              >
                <option value="">Select Dimension</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="New..." />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 text-white px-4 rounded-lg">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedDimensions.map(d => (
                <span key={d._id} className="bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {d.value}
                  <button type="button" onClick={() => setSelectedDimensions(selectedDimensions.filter(item => item._id !== d._id))} className="ml-1 hover:text-red-200">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold">COLOR IMAGES</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setColorImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-2 mt-2">
                {colorImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setColorImages(p => p.filter((_, idx) => idx !== i))} />)}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold">PRODUCT IMAGES *</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setProductImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-2 mt-2">
                {productImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setProductImages(p => p.filter((_, idx) => idx !== i))} />)}
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg" disabled={isCompressing}>Cancel</button>
        <button type="submit" form="add-form" disabled={isCompressing} className={`px-6 py-2 bg-[#6A3E9D] text-white rounded-lg flex items-center gap-2 ${isCompressing ? 'opacity-70' : ''}`}>
          {isCompressing ? "Saving..." : "Save Product"}
        </button>
      </div>
    </Modal>
  );
}

// --- Update Product Modal ---
const UpdateProductModal = ({ isOpen, onClose, onUpdateSuccess, product, categories, dimensions, handleAddNewDimension, newDimensionInput, setNewDimensionInput }) => {
  const [formData, setFormData] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
  const [visibleBoxes, setVisibleBoxes] = useState(4);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({ 
        categoryId: product.categoryId?._id || "", 
        name: product.name || "", 
        about: product.about || "", 
        pricePerPiece: product.pricePerPiece || "", 
        totalPiecesPerBox: product.totalPiecesPerBox || "", 
        discountPercentage: product.discountPercentage || 0, 
        quantity: product.quantity || "", 
        position: product.position || 0 
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setSelectedDimensions(product.dimensions || []);
      const parts = Array(20).fill("");
      (product.description || "").split(" ").forEach((word, i) => { if(i < 20) parts[i] = word; });
      setDescriptionParts(parts);
      const filledCount = parts.filter(p => p !== "").length;
      setVisibleBoxes(Math.max(4, Math.ceil(filledCount / 4) * 4));
    }
  }, [product, isOpen]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 0.7, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressed = await Promise.all(files.map(f => imageCompression(f, options)));
      setNewImages(prev => [...prev, ...compressed]);
      toast.success("Ready!");
    } finally { setIsCompressing(false); }
  };

  const deleteExistingImage = async (img) => {
    if (!window.confirm("Remove this image?")) return;
    const cleanId = img.id.includes("/") ? img.id.split("/").pop() : img.id;
    try {
      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/products/${product._id}/images/${cleanId}`, { method: "DELETE" });
      if (res.ok) {
        setExistingImages(prev => prev.filter(i => i.id !== img.id));
        toast.success("Image deleted");
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("description", descriptionParts.filter(p => p.trim()).join(" ").trim());
    data.append("dimensions", selectedDimensions.map(d => d._id || d).join(","));
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    newImages.forEach(f => data.append("images", f, f.name));

    const tid = toast.loading("Updating...");
    try {
      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${product._id}`, { method: "PUT", body: data });
      if (res.ok) { onUpdateSuccess(); onClose(); toast.success("Updated!", { id: tid }); }
    } catch (err) { toast.error("Update failed", { id: tid }); }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center font-bold text-xl">
        <span>Update Product</span>
        <button onClick={onClose} className="text-gray-400">×</button>
      </div>
      <div className="p-6 overflow-y-auto space-y-4">
        <form id="update-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className={inputClass}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Model</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Position</label><input type="number" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className={inputClass} /></div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {descriptionParts.slice(0, visibleBoxes).map((p, i) => (
                <input key={i} value={p} onChange={e => { const u = [...descriptionParts]; u[i] = e.target.value; setDescriptionParts(u); }} className="w-full h-9 border rounded-lg text-center text-sm" />
              ))}
            </div>
            {visibleBoxes < 20 && <button type="button" onClick={() => setVisibleBoxes(v => v + 4)} className="text-blue-600 text-xs mt-2">+ Add More</button>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="text-xs font-bold text-gray-500 uppercase">Stock</label><input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Price</label><input type="number" value={formData.pricePerPiece} onChange={e => setFormData({...formData, pricePerPiece: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Pcs/Box</label><input type="number" value={formData.totalPiecesPerBox} onChange={e => setFormData({...formData, totalPiecesPerBox: e.target.value})} className={inputClass} /></div>
            <div><label className="text-xs font-bold text-gray-500 uppercase">Discount%</label><input type="number" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: e.target.value})} className={inputClass} /></div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Dimensions</label>
            <div className="flex gap-2 mt-1">
              <select onChange={e => { const d = dimensions.find(x => x._id === e.target.value); if(d && !selectedDimensions.find(s => s._id === d._id)) setSelectedDimensions([...selectedDimensions, d]); e.target.value=""; }} className={inputClass}>
                <option value="">Select Existing</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="New..." />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 text-white px-4 rounded-lg">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedDimensions.map(d => <span key={d._id} className="bg-purple-600 text-white px-2 py-1 rounded text-xs">{d.value}</span>)}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Images</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingImages.map((img, i) => <ImageThumb key={i} file={img.url} isUrl={true} onRemove={() => deleteExistingImage(img)} />)}
              {newImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} />)}
            </div>
            <input type="file" multiple onChange={handleFileChange} className="mt-3 block text-xs" />
          </div>
        </form>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="submit" form="update-form" disabled={isCompressing} className="px-6 py-2 bg-[#6A3E9D] text-white rounded-lg">
           {isCompressing ? "Processing..." : "Update Changes"}
        </button>
      </div>
    </Modal>
  );
};

// --- Main View Products ---
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [dimensionList, setDimensionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isQrOpen, setQrOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDimInput, setNewDimInput] = useState('');

  // Delete Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // We fetch separately to avoid one slow API blocking everything
      const prodRes = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all').then(r => r.json()).catch(() => ({products: []}));
      const catRes = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category').then(r => r.json()).catch(() => ({categories: []}));
      
      // Render.com can be very slow, so we fetch it but don't let it crash the app
      let dimData = [];
      try {
        const dRes = await fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions');
        if (dRes.ok) dimData = await dRes.json();
      } catch (e) { console.error("Dimensions API down"); }

      setProducts(prodRes.products || []);
      setCategoryList(catRes.categories || []);
      setDimensionList(Array.isArray(dimData) ? dimData : []);
    } catch (e) { 
      toast.error("Fetch failed. Please check internet."); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddNewDim = async () => {
    if (!newDimInput.trim()) return;
    try {
      const res = await fetch('https://threebappbackend.onrender.com/api/dimensions/add-dimensions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDimInput })
      });
      if(res.ok) {
        setNewDimInput(''); fetchData(); toast.success("Added");
      }
    } catch (e) { toast.error("Failed"); }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const tid = toast.loading("Deleting product...");
    try {
      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete/${productToDelete._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Product deleted successfully", { id: tid });
        fetchData();
      } else {
        toast.error("Failed to delete", { id: tid });
      }
    } catch (error) {
      toast.error("Error occurred", { id: tid });
    } finally {
      setIsDeleteOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => {
        const matchesSearch = term === '' || p.name?.toLowerCase().includes(term) || (p.about || "").toLowerCase().includes(term);
        const matchesCat = filterCategory === '' || p.categoryId?._id === filterCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  }, [products, searchTerm, filterCategory]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  if (isLoading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[60]">
        <div className="w-12 h-12 border-4 border-[#6A3E9D] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-[#6A3E9D]">Loading Product Warehouse...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Product Warehouse ({products.length})</h2>
          <button onClick={() => setIsAddOpen(true)} className="bg-[#6A3E9D] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#5a3486] transition">+ Add Product</button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input type="text" placeholder="Search frame, model or details..." className="w-full pl-10 pr-4 py-2 border rounded-xl" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select 
            className="p-2 border rounded-xl text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categoryList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Sr.</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Frame</th>
                <th className="px-4 py-3 text-center">Pos</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((product, idx) => (
                <tr key={product._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">{((currentPage-1)*productsPerPage) + idx + 1}</td>
                  <td className="px-4 py-4">
                    <img src={product.images?.[0]?.url} onClick={() => { setSliderImages(product.images.map(i => i.url)); setIsSliderOpen(true); }} className="w-12 h-12 object-cover rounded shadow-sm cursor-pointer" alt="p" />
                  </td>
                  <td className="px-4 py-4 font-bold">{product.name}</td>
                  <td className="px-4 py-4 text-center text-purple-600 font-bold">{product.position ?? "—"}</td>
                  <td className="px-4 py-4">
                    {product.dimensions?.filter(Boolean).map(d => d.value || d).join(', ') || "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold">₹{product.pricePerPiece}</td>
                  <td className="px-4 py-4">{product.quantity}</td>
                  <td className="px-4 py-4 text-center space-x-3 whitespace-nowrap">
                    <button title="View QR" onClick={() => { setQrCodeUrl(product.qrCodeUrl); setQrOpen(true); }} className="p-2 hover:bg-gray-100 rounded-full transition"><FontAwesomeIcon icon={faQrcode} className="text-gray-400 hover:text-black" /></button>
                    <button title="Edit" onClick={() => { setSelectedProduct(product); setIsUpdateOpen(true); }} className="p-2 hover:bg-blue-50 rounded-full transition"><FontAwesomeIcon icon={faPenToSquare} className="text-blue-500 hover:text-blue-700" /></button>
                    <button title="Delete" onClick={() => { setProductToDelete(product); setIsDeleteOpen(true); }} className="p-2 hover:bg-red-50 rounded-full transition"><FontAwesomeIcon icon={faTrash} className="text-red-500" /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-10 text-center text-gray-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > productsPerPage && (
            <div className="mt-6 flex justify-center gap-2 overflow-x-auto py-2">
            {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i+1)} className={`px-4 py-2 border rounded-xl transition flex-shrink-0 ${currentPage === i+1 ? 'bg-[#6A3E9D] text-white shadow-md' : 'bg-white hover:bg-gray-50'}`}>{i+1}</button>
            ))}
            </div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => { setIsDeleteOpen(false); setProductToDelete(null); }} 
        onConfirm={handleConfirmDelete} 
        productName={productToDelete?.name || ""} 
      />

      <ImageSliderModal isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)} images={sliderImages} />
      
      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        <div className="p-10 flex flex-col items-center text-center">
            <h3 className="font-bold text-lg mb-4">Product QR Code</h3>
            <img src={qrCodeUrl} className="w-64 h-64 border rounded-2xl shadow-xl mb-4" alt="QR" />
            <p className="text-gray-500 text-sm mb-6">Scan to view product details online</p>
            <button onClick={() => setQrOpen(false)} className="px-8 py-2 bg-gray-800 text-white rounded-xl">Close</button>
        </div>
      </Modal>

      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onProductAdded={fetchData} categories={categoryList} dimensions={dimensionList} handleAddNewDimension={handleAddNewDim} newDimensionInput={newDimInput} setNewDimensionInput={setNewDimInput} />
      
      {selectedProduct && <UpdateProductModal isOpen={isUpdateOpen} onClose={() => {setIsUpdateOpen(false); setSelectedProduct(null);}} onUpdateSuccess={fetchData} product={selectedProduct} categories={categoryList} dimensions={dimensionList} handleAddNewDimension={handleAddNewDim} newDimensionInput={newDimInput} setNewDimensionInput={setNewDimInput} />}
    </div>
  );
}

// --- Slider Sub-Component ---
const ImageSliderModal = ({ isOpen, onClose, images }) => {
  const [idx, setIdx] = useState(0); 
  useEffect(() => { if (isOpen) setIdx(0); }, [isOpen]);
  if (!isOpen || !images.length) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4">
      <button onClick={onClose} className="absolute top-8 right-8 text-white text-3xl hover:scale-110 transition"><FontAwesomeIcon icon={faTimes} /></button>
      <button onClick={() => setIdx(i => i === 0 ? images.length-1 : i-1)} className="absolute left-5 text-white text-4xl p-4 hover:text-purple-400 transition"><FontAwesomeIcon icon={faChevronLeft} /></button>
      <img src={images[idx]} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" alt="view" />
      <button onClick={() => setIdx(i => i === images.length-1 ? 0 : i+1)} className="absolute right-5 text-white text-4xl p-4 hover:text-purple-400 transition"><FontAwesomeIcon icon={faChevronRight} /></button>
    </div>
  );
};

export default ViewProducts;

// import React, { useState, useEffect, useCallback } from 'react';
// import toast, { Toaster } from 'react-hot-toast';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faQrcode, faPenToSquare, faTrash, faPlus, faTimes, faChevronLeft, faChevronRight, faAngleDown, faFilter } from '@fortawesome/free-solid-svg-icons';
// import imageCompression from 'browser-image-compression';

// // --- Reusable Components ---
// const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 flex justify-center items-start pt-28 z-50 p-4 overflow-y-auto pointer-events-none">
//       <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-8rem)] pointer-events-auto`}>
//         {children}
//       </div>
//     </div>
//   );
// };

// const ImageThumb = ({ file, onRemove, isUrl = false }) => (
//   <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
//     <img src={isUrl ? file : URL.createObjectURL(file)} alt="product thumbnail" className="w-full h-full object-cover" />
//     <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-red-600 cursor-pointer hover:bg-red-100">×</button>
//   </div>
// );

// // --- Image Slider Modal Component (NEW) ---
// const ImageSliderModal = ({ isOpen, onClose, images }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     if (isOpen) {
//       setCurrentIndex(0);
//     }
//   }, [isOpen]);

//   const goToPrevious = () => {
//     setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
//   };

//   const goToNext = () => {
//     setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
//   };

//   if (!isOpen || images.length === 0) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
//       <button onClick={onClose} className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
//         <FontAwesomeIcon icon={faTimes} />
//       </button>
//       <div className="relative bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
//         <div className="flex-grow flex items-center justify-center relative p-4">
//           <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
//             <FontAwesomeIcon icon={faChevronLeft} />
//           </button>
//           <img
//             src={images[currentIndex]}
//             alt={`Product image ${currentIndex + 1}`}
//             className="max-w-full max-h-[75vh] object-contain rounded-lg"
//           />
//           <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
//             <FontAwesomeIcon icon={faChevronRight} />
//           </button>
//         </div>
//         <div className="text-center p-2 text-gray-700">
//           {currentIndex + 1} / {images.length}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- Add Product Modal Component (MODIFIED) ---

// function AddProductModal({
//   isOpen,
//   onClose,
//   onProductAdded,
//   categories = [],
//   dimensions = [],
//   handleAddNewDimension,
//   newDimensionInput,
//   setNewDimensionInput,
// }) {
//   const [formData, setFormData] = useState({
//     categoryId: "",
//     name: "",
//     about: "",
//     quantity: "",
//     pricePerPiece: "",
//     totalPiecesPerBox: "",
//     discountPercentage: 0,
//      position: 1,
//   });

//   const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
//   const [showAllDescriptionBoxes, setShowAllDescriptionBoxes] = useState(false);
//   const [visibleDescriptionBoxes, setVisibleDescriptionBoxes] = useState(4);


//   const [selectedDimensions, setSelectedDimensions] = useState([]);
//   const [colorImages, setColorImages] = useState([]);
//   const [productImages, setProductImages] = useState([]);
//   const [isCompressing, setIsCompressing] = useState(false);


// const handleAddMoreBox = () => {
//   setVisibleDescriptionBoxes((prev) => Math.min(prev + 1, 20)); // max 20 boxes

//   // Ensure array always has data
//   setDescriptionParts((prev) =>
//     prev.length < 20 ? [...prev, ""] : [...prev]
//   );
// };


//   // Reset when modal is closed
//   useEffect(() => {
//     if (!isOpen) {
//       setFormData({
//         categoryId: "",
//         name: "",
//         about: "",
//         quantity: 500,
//         pricePerPiece: "",
//         totalPiecesPerBox: "",
//         discountPercentage: 0,
//       });
//       setDescriptionParts(Array(20).fill(""));
//       setShowAllDescriptionBoxes(false);
//       setSelectedDimensions([]);
//       setColorImages([]);
//       setProductImages([]);
//       setIsCompressing(false);
//       setNewDimensionInput("");
//     }
//   }, [isOpen, setNewDimensionInput]);

//   const handleDescriptionPartChange = (e, index) => {
//     const newParts = [...descriptionParts];
//     newParts[index] = e.target.value.substring(0, 20);
//     setDescriptionParts(newParts);
//   };

//   const handleInputChange = (e) =>
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   // Handles file selection + compression. Accepts a setter (setColorImages / setProductImages)
//   const handleFileChange = async (e, setFiles, currentFiles = [], limit) => {
//     const filesToProcess = Array.from(e.target.files || []);
//     // clear input so same file can be selected again
//     e.target.value = null;

//     if (filesToProcess.length === 0) return;

//     if (limit && filesToProcess.length + (currentFiles?.length || 0) > limit) {
//       toast.error(`You can only upload a maximum of ${limit} images in total.`);
//       return;
//     }

//     setIsCompressing(true);
//     const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);

//     const compressionOptions = {
//       maxSizeMB: 1,
//       maxWidthOrHeight: 1920,
//       useWebWorker: true,
//     };

//     try {
//       const compressedFiles = await Promise.all(
//         filesToProcess.map((file) => imageCompression(file, compressionOptions))
//       );

//       // Keep original filenames (imageCompression may change name)
//       compressedFiles.forEach((file, i) => (file.name = filesToProcess[i].name));

//       // Use functional update to avoid stale state
//       setFiles((prev) => [...prev, ...compressedFiles]);

//       toast.success("Compression complete!", { id: toastId });
//     } catch (err) {
//       console.error("Image compression failed:", err);
//       toast.error("Failed to process images.", { id: toastId });
//     } finally {
//       setIsCompressing(false);
//     }
//   };

//   const handleDimensionSelect = (e) => {
//     const selectedId = e.target.value;
//     if (!selectedId) return;
//     const dimensionToAdd = dimensions.find((d) => d._id === selectedId);
//     if (dimensionToAdd && !selectedDimensions.some((d) => d._id === dimensionToAdd._id)) {
//       setSelectedDimensions((prev) => [...prev, dimensionToAdd]);
//     }
//     e.target.value = "";
//   };

//   // validateForm returns { ok: boolean, message?: string, combinedDescription?: string }
//   const validateForm = () => {
//     // Build combinedDescription BEFORE validation
//     const combinedDescription = descriptionParts
//       .filter((p) => p.trim())
//       .join(" ")
//       .trim();

//     if (!formData.name || !formData.name.trim()) {
//       return { ok: false, message: "Model Number is required." };
//     }

//     if (isCompressing) {
//       return { ok: false, message: "Please wait for images to finish processing." };
//     }

//     if (!combinedDescription) return { ok: false, message: "Description is required." };
//     if (selectedDimensions.length === 0) return { ok: false, message: "Please select at least one dimension." };

//     if (colorImages.length === 0)
//       return { ok: false, message: "Please upload at least one color image." };

//     if (productImages.length === 0)
//       return { ok: false, message: "Please upload at least one product image." };

//     if (!formData.pricePerPiece || isNaN(Number(formData.pricePerPiece)))
//       return { ok: false, message: "Price per piece is required and must be a number." };

//     if (!formData.totalPiecesPerBox || isNaN(Number(formData.totalPiecesPerBox)))
//       return { ok: false, message: "Total pieces per box is required and must be a number." };

//     return { ok: true, combinedDescription };
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     // Run all validations FIRST (before building FormData)
//     const check = validateForm();
//     if (!check.ok) {
//       toast.error(check.message);
//       return;
//     }

//     // Build FormData AFTER validation
//     const submissionData = new FormData();

//     // Append simple fields
//     Object.entries(formData).forEach(([key, value]) => {
//       // convert numeric-looking fields to numbers where appropriate
//       if (key === "pricePerPiece" || key === "totalPiecesPerBox" || key === "quantity" || key === "discountPercentage" || key === "position") {
//         submissionData.append(key, value === "" ? "0" : String(Number(value)));
//       } else {
//         submissionData.append(key, value);
//       }
//     });

//     // Description from validateForm()
//     submissionData.append("description", check.combinedDescription);
//     submissionData.append("position", formData.position);


//     // IMPORTANT: send **dimension IDs** (option B) as comma-separated string
//     submissionData.append("dimensions", selectedDimensions.map((d) => d._id).join(","));

//     // Append images
//     colorImages.forEach((file) => submissionData.append("colorImages", file, file.name));
//     productImages.forEach((file) => submissionData.append("images", file, file.name));

//     // Debug log (optional)
//     console.group("🧾 Product Submission Debug Log");
//     console.log("➡️ name:", formData.name);
//     console.log("➡️ categoryId:", formData.categoryId || "(none)");
//     console.log("➡️ description:", check.combinedDescription);
//     console.log("➡️ dimensions (IDs):", selectedDimensions.map((d) => d._id).join(","));
//     console.log("➡️ pricePerPiece:", formData.pricePerPiece);
//     console.log("➡️ totalPiecesPerBox:", formData.totalPiecesPerBox);
//     console.log("➡️ quantity:", formData.quantity);
//     console.log("➡️ discountPercentage:", formData.discountPercentage);
//     console.log("➡️ colorImages count:", colorImages.length);
//     console.log("➡️ productImages count:", productImages.length);
//     console.groupEnd();

//     // Submit
//     try {
//       const res = await fetch("https://threebapi-1067354145699.asia-south1.run.app/api/products/add", {
//         method: "POST",
//         body: submissionData,
//       });

//       if (!res.ok) {
//         const errJson = await res.json().catch(() => null);
//         const message = errJson?.message || `Server error: ${res.status}`;
//         throw new Error(message);
//       }

//       const data = await res.json();
//       toast.success("Product added successfully!");
//       onProductAdded && onProductAdded(data);
//       onClose && onClose();
//       console.log("✅ Product added successfully!", data);
//     } catch (err) {
//       console.error("❌ Error while adding product:", err);
//       toast.error(err.message || "Failed to add product");
//     }
//   };

//   const inputClass =
//     "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
//   const fileInputClass =
//     "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
//       <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
//         <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
//           ×
//         </button>
//       </div>

//       <div className="overflow-y-auto px-6 py-6 flex-grow min-h-0">
//         <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-semibold text-gray-700">Category (Optional)</label>
//               <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={inputClass}>
//                 <option value="">Select Category</option>
//                 {categories.map((cat) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700">Model Number</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 required
//                 placeholder="Enter the product model number"
//                 className={inputClass}
//               />
//             </div>

//               <div>
//     <label className="text-sm font-semibold text-gray-700">
//       Position <span className="text-blue-600 text-xs">(Auto-sort)</span>
//     </label>
//     <input
//       type="number"
//       name="position"
//       min={1}
//       value={formData.position}
//       onChange={handleInputChange}
//       placeholder="1"
//       className={inputClass}
//     />
//   </div>
//           </div>

//          <div>
//   <label className="text-sm font-semibold text-gray-700">Description</label>

//   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
//     {descriptionParts.slice(0, visibleDescriptionBoxes).map((part, index) => (
//       <input
//         key={index}
//         type="text"
//         value={part}
//         onChange={(e) => handleDescriptionPartChange(e, index)}
//         className="w-full h-10 text-center border border-gray-300 rounded-lg
//         focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D]
//         focus:outline-none transition"
//         maxLength={20}
//       />
//     ))}
//   </div>

//   {visibleDescriptionBoxes < 20 && (
//     <div className="text-right mt-2">
//       <button
//         type="button"
//         onClick={handleAddMoreBox}
//         className="text-sm text-blue-600 hover:text-blue-800 font-semibold
//           flex items-center gap-1 justify-end"
//       >
//         <FontAwesomeIcon icon={faPlus} size="xs" />

//         {visibleDescriptionBoxes <= 10
//           ? "Add More Boxes"
//           : `+${visibleDescriptionBoxes - 10}`}
//       </button>
//     </div>
//   )}
// </div>


//           <div>
//             <label className="text-sm font-semibold text-gray-700">About</label>
//             <textarea name="about" value={formData.about} onChange={handleInputChange} rows={3} placeholder="More details about the product" className={inputClass}></textarea>
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700">
//               Upload Color Images <span className="text-red-500">*</span>
//             </label>

//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={(e) => handleFileChange(e, setColorImages, colorImages)}
//               className={`${fileInputClass} mt-1`}
//               disabled={isCompressing}
//             />

//             {colorImages.length === 0 && <p className="text-red-500 text-xs mt-1">At least one color image is recommended.</p>}

//             <div className="flex flex-wrap mt-2 gap-4">
//               {colorImages.map((file, index) => (
//                 <ImageThumb key={index} file={file} onRemove={() => setColorImages((prev) => prev.filter((_, i) => i !== index))} />
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700 block mb-1">
//               Dimensions <span className="text-red-500">*</span>
//             </label>

//             <div className="flex items-center gap-2">
//               <select onChange={handleDimensionSelect} className={inputClass + " mt-0 flex-grow"}>
//                 <option value="">-- Select to add --</option>
//                 {dimensions.map((dim) => (
//                   <option key={dim._id} value={dim._id}>
//                     {dim.value}
//                   </option>
//                 ))}
//               </select>

//               <input type="text" placeholder="Add new dimension" value={newDimensionInput} onChange={(e) => setNewDimensionInput(e.target.value)} className={inputClass + " mt-0"} />

//               <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">
//                 Add
//               </button>
//             </div>

//             <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">
//               {selectedDimensions.length > 0 ? (
//                 selectedDimensions.map((dim) => (
//                   <span key={dim._id} className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full">
//                     {dim.value}
//                     <button type="button" onClick={() => setSelectedDimensions((prev) => prev.filter((d) => d._id !== dim._id))} className="ml-2 font-bold hover:text-gray-200">
//                       ×
//                     </button>
//                   </span>
//                 ))
//               ) : (
//                 <span className="text-gray-400 text-sm">No dimensions selected.</span>
//               )}
//             </div>

//             {selectedDimensions.length === 0 && <p className="text-red-500 text-xs mt-1">Please select or add at least one dimension.</p>}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div>
//               <label className="text-sm font-semibold text-gray-700">Quantity</label>
//               <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className={inputClass} />
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700">Price/Piece</label>
//               <input type="number" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} min={0} step="0.01" required className={inputClass} />
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700">Pieces/Box</label>
//               <input type="number" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} min={1} required className={inputClass} />
//             </div>

//             <div>
//               <label className="text-sm font-semibold text-gray-700">Discount %</label>
//               <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} min={0} step="0.01" className={inputClass} />
//             </div>
//           </div>

//           <div>
//             <label className="text-sm font-semibold text-gray-700">Product Images <span className="text-red-500">*</span></label>

//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={(e) => handleFileChange(e, setProductImages, productImages)}
//               className={`${fileInputClass} mt-1`}
//               disabled={isCompressing}
//             />

//             {productImages.length === 0 && <p className="text-red-500 text-xs mt-1">At least one product image is required.</p>}

//             <div className="flex flex-wrap mt-2 gap-4">
//               {productImages.map((file, index) => (
//                 <ImageThumb key={index} file={file} onRemove={() => setProductImages((prev) => prev.filter((_, i) => i !== index))} />
//               ))}
//             </div>
//           </div>
//         </form>
//       </div>

//       <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t flex-shrink-0 rounded-b-2xl">
//         <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
//           Cancel
//         </button>

//         <button
//           type="submit"
//           form="add-product-form"
//           className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg"
//           disabled={isCompressing}
//         >
//           {isCompressing ? "Processing..." : "Add Product"}
//         </button>
//       </div>
//     </Modal>
//   );
// }



// // --- Update Product Modal (MODIFIED) ---
// const UpdateProductModal = ({
//   isOpen,
//   onClose,
//   onUpdateSuccess,
//   product,
//   categories,
//   dimensions,
//   handleAddNewDimension,
//   newDimensionInput,
//   setNewDimensionInput,
// }) => {
//   const [formData, setFormData] = useState({});
//   const [existingImages, setExistingImages] = useState([]);
//   const [newImages, setNewImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [selectedDimensions, setSelectedDimensions] = useState([]);
//   const [showDeletePopup, setShowDeletePopup] = useState(false);
//   const [imagePendingDelete, setImagePendingDelete] = useState(null);

//   // New state for description
//   const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
//   const [showAllDescriptionBoxes, setShowAllDescriptionBoxes] = useState(false);

//   useEffect(() => {
//     if (product) {
//       setFormData({
//         categoryId: product.categoryId?._id || product.categoryId || "",
//         name: product.name || "",
//         about: product.about || "",
//         pricePerPiece: product.pricePerPiece || "",
//         totalPiecesPerBox: product.totalPiecesPerBox || "",
//         discountPercentage: product.discountPercentage || 0,
//         quantity: product.quantity || "",
//          position: product.position || 0,
//       });
//       setExistingImages(product.images || []);
//       setNewImages([]);
//       setImagesToDelete([]);

//       const desc = product.description || "";
//       const initialDescriptionParts = Array(20).fill("");
//       desc
//         .split(" ")
//         .filter((p) => p.trim())
//         .forEach((part, index) => {
//           if (index < 10) initialDescriptionParts[index] = part;
//         });
//       setDescriptionParts(initialDescriptionParts);
//       setShowAllDescriptionBoxes(
//         initialDescriptionParts.some((p) => p.trim() !== "") &&
//           initialDescriptionParts.slice(0, 4).every((p) => p.trim() !== "")
//       );

//       const dims = Array.isArray(product.dimensions)
//         ? product.dimensions.map((d) => ({ _id: d._id || d, value: d.value || d }))
//         : [];
//       setSelectedDimensions(dims);
//     } else if (!isOpen) {
//       setFormData({});
//       setExistingImages([]);
//       setNewImages([]);
//       setImagesToDelete([]);
//       setIsCompressing(false);
//       setSelectedDimensions([]);
//       setDescriptionParts(Array(10).fill(""));
//       setShowAllDescriptionBoxes(false);
//       setNewDimensionInput("");
//     }
//   }, [product, isOpen, setNewDimensionInput]);

//   const handleDescriptionPartChange = (e, index) => {
//     const newParts = [...descriptionParts];
//     newParts[index] = e.target.value.substring(0, 20);
//     setDescriptionParts(newParts);
//   };

//   const handleFileChange = async (e) => {
//     const filesToProcess = Array.from(e.target.files);
//     e.target.value = null;
//     const limit = 10;
//     if (filesToProcess.length + existingImages.length + newImages.length > limit) {
//       toast.error(`You can only have a maximum of ${limit} images in total.`);
//       return;
//     }
//     setIsCompressing(true);
//     const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);
//     const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
//     try {
//       const compressedFiles = await Promise.all(
//         filesToProcess.map((file) => imageCompression(file, compressionOptions))
//       );
//       compressedFiles.forEach((file, index) => {
//         file.name = filesToProcess[index].name;
//       });
//       setNewImages((prev) => [...prev, ...compressedFiles]);
//       toast.success("Compression complete!", { id: toastId });
//     } catch (error) {
//       toast.error("Failed to process images.", { id: toastId });
//     } finally {
//       setIsCompressing(false);
//     }
//   };

//   // 🟣 When user clicks delete icon — just open popup
// const handleRemoveExistingImage = (image) => {
//   setImagePendingDelete(image);
//   setShowDeletePopup(true);
// };

// const confirmDeleteImage = async () => {
//   if (!imagePendingDelete) return;

//   // 🧠 Clean ID: if it’s a path like "product-images/xyz.png", extract the filename
//   const cleanId = imagePendingDelete.id.includes("product-images/")
//     ? imagePendingDelete.id.split("product-images/")[1]
//     : imagePendingDelete.id;

//   const deleteUrl = `https://threebapi-1067354145699.asia-south1.run.app/api/products/products/${product._id}/images/${cleanId}`;
//   console.log("🧹 Deleting image with clean ID:", cleanId);

//   try {
//     const response = await fetch(deleteUrl, { method: "DELETE" });

//     let data;
//     try {
//       data = await response.json();
//     } catch {
//       console.error("Response not JSON, probably 404 HTML");
//       toast.error("Failed to delete image (404). Check image ID.");
//       return;
//     }

//     if (!response.ok) {
//       toast.error(data.message || "Failed to delete image.");
//       return;
//     }

//     toast.success("✅ Image deleted successfully!");
//     setExistingImages(data.remainingImages || []);
//   } catch (err) {
//     console.error("❌ Error deleting image:", err);
//     toast.error("An error occurred while deleting the image.");
//   } finally {
//     setShowDeletePopup(false);
//     setImagePendingDelete(null);
//   }
// };







//   const handleRemoveNewImage = (indexToRemove) => {
//     setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
//   };

//   const handleInputChange = (e) =>
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const validateForm = ({ combinedDescription, selectedDimensions, formData }) => {
//   if (!formData.name?.trim()) return "Product name is required.";
//   if (!combinedDescription.trim()) return "Description cannot be empty.";
//   if (selectedDimensions.length === 0) return "Please select at least one dimension.";
//   if (!formData.pricePerPiece) return "Price per piece is required.";
//   if (!formData.totalPiecesPerBox) return "Total pieces per box is required.";
//   if (!formData.quantity) return "Quantity is required.";
//   if (!formData.position && formData.position !== 0) return "Position is required.";

//   return null;
// };


//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     const data = new FormData();
//     data.append("dimensions", selectedDimensions.map((d) => d.value).join(","));
// const combinedDescription = descriptionParts
//   .filter(p => p.trim())
//   .join(" ")
//   .trim();

//  const error = validateForm({
//   combinedDescription,
//   selectedDimensions,
//   formData
// });


// if (error) return toast.error(error);
//     data.append("description", combinedDescription);

//     Object.entries(formData).forEach(([key, value]) => {
//       if (key === "categoryId" && !value) return;
//       data.append(key, value);
//     });

//     newImages.forEach((file) => data.append("images", file, file.name));
//     if (imagesToDelete.length > 0) {
//       data.append("imagesToDelete", JSON.stringify(imagesToDelete));
//     }

//     const promise = fetch(
//       `https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${product._id}`,
//       { method: "PUT", body: data }
//     ).then(async (res) => {
//       const responseData = await res.json();
//       if (!res.ok) throw new Error(responseData.message || "Update failed");
//       return responseData;
//     });

//     toast.promise(promise, {
//       loading: "Updating product...",
//       success: () => {
//         onUpdateSuccess();
//         onClose();
//         return "Product updated successfully!";
//       },
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   const inputClass =
//     "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
//   const fileInputClass =
//     "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";
//   const visibleDescriptionBoxes = showAllDescriptionBoxes ? 20 : 4;

//   if (!isOpen) return null;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
//       <div className="p-6 border-b flex justify-between items-center">
//         <h3 className="text-2xl font-bold text-gray-800">Update Product</h3>
//         <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
//           ×
//         </button>
//       </div>

//       <div className="overflow-y-auto px-6 py-6 min-h-0">
//         <form id="update-product-form" onSubmit={handleFormSubmit} className="space-y-4">
//           {/* CATEGORY + NAME */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-semibold text-gray-700">Category (Optional)</label>
//               <select
//                 name="categoryId"
//                 value={formData.categoryId}
//                 onChange={handleInputChange}
//                 className={inputClass}
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((cat) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="text-sm font-semibold text-gray-700">Name / Frame</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 required
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           <div>
//   <label className="text-sm font-semibold">Position</label>
//   <input
//     type="number"
//     name="position"
//     value={formData.position}
//     onChange={handleInputChange}
//     required
//     className={inputClass}
//   />
// </div>


//           {/* DESCRIPTION */}
//           <div>
//             <label className="text-sm font-semibold text-gray-700">Description</label>
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
//               {descriptionParts.slice(0, visibleDescriptionBoxes).map((part, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   value={part}
//                   onChange={(e) => handleDescriptionPartChange(e, index)}
//                   className="w-full h-10 text-center border border-gray-300 rounded-lg focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition"
//                   maxLength="20"
//                 />
//               ))}
//             </div>
//             {!showAllDescriptionBoxes && (
//               <div className="text-right mt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowAllDescriptionBoxes(true)}
//                   className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 justify-end"
//                 >
//                   <FontAwesomeIcon icon={faPlus} size="xs" /> Add More Boxes
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* ABOUT */}
//           <div>
//             <label className="text-sm font-semibold text-gray-700">About</label>
//             <textarea
//               name="about"
//               value={formData.about}
//               onChange={handleInputChange}
//               rows="3"
//               placeholder="More details about the product"
//               className={inputClass}
//             ></textarea>
//           </div>

//           {/* DIMENSIONS */}
//           <div>
//             <label className="text-sm font-semibold text-gray-700 block mb-1">Dimensions</label>
//             <div className="flex items-center gap-2">
//               <select
//                 onChange={(e) => {
//                   const dim = dimensions.find((d) => d._id === e.target.value);
//                   if (dim && !selectedDimensions.some((d) => d._id === dim._id)) {
//                     setSelectedDimensions((prev) => [...prev, dim]);
//                   }
//                   e.target.value = "";
//                 }}
//                 className={inputClass + " mt-0 flex-grow"}
//               >
//                 <option value="">-- Select to add --</option>
//                 {dimensions.map((d) => (
//                   <option key={d._id} value={d._id}>
//                     {d.value}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="text"
//                 placeholder="Add new dimension"
//                 value={newDimensionInput}
//                 onChange={(e) => setNewDimensionInput(e.target.value)}
//                 className={inputClass + " mt-0"}
//               />
//               <button
//                 type="button"
//                 onClick={handleAddNewDimension}
//                 className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0"
//               >
//                 Add
//               </button>
//             </div>

//             <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">
//               {selectedDimensions.length > 0
//                 ? selectedDimensions.map((dim) => (
//                     <span
//                       key={dim._id}
//                       className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full"
//                     >
//                       {dim.value}
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setSelectedDimensions((prev) =>
//                             prev.filter((d) => d._id !== dim._id)
//                           )
//                         }
//                         className="ml-2 font-bold hover:text-gray-200"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))
//                 : (
//                   <span className="text-gray-400 text-sm">No dimensions selected.</span>
//                 )}
//             </div>
//           </div>

//           {/* PRICE, PIECES, DISCOUNT, QTY */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div>
//               <label className="text-sm font-semibold">Price/Piece</label>
//               <input
//                 type="number"
//                 name="pricePerPiece"
//                 value={formData.pricePerPiece}
//                 onChange={handleInputChange}
//                 required
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-semibold">Pieces/Box</label>
//               <input
//                 type="number"
//                 name="totalPiecesPerBox"
//                 value={formData.totalPiecesPerBox}
//                 onChange={handleInputChange}
//                 required
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-semibold">Discount %</label>
//               <input
//                 type="number"
//                 name="discountPercentage"
//                 value={formData.discountPercentage}
//                 onChange={handleInputChange}
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="text-sm font-semibold">Quantity</label>
//               <input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleInputChange}
//                 required
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* IMAGES */}
//           <div>
//             <label className="text-sm font-semibold text-gray-700">
//               Manage Product Images
//             </label>
//             <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-3">
//               <div>
//                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
//                   Existing Images
//                 </h4>
//                 {existingImages.length > 0 ? (
//                   <div className="flex flex-wrap gap-4">
//                     {existingImages.map((img) => (
// <ImageThumb
//   key={img.id}
//   file={img.url}
//   onRemove={() => handleRemoveExistingImage(img)}
//   isUrl={true}
// />

// ))}

//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-400">No existing images.</p>
//                 )}
//               </div>

//               <div>
//                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
//                   Add New Images
//                 </h4>
//                 <input
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className={fileInputClass}
//                   disabled={isCompressing}
//                 />
//                 {newImages.length > 0 && (
//                   <div className="flex flex-wrap gap-4 mt-4">
//                     {newImages.map((file, index) => (
//                       <ImageThumb
//                         key={index}
//                         file={file}
//                         onRemove={() => handleRemoveNewImage(index)}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>

//       <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t rounded-b-2xl">
//         <button
//           type="button"
//           onClick={onClose}
//           className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           form="update-product-form"
//           className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg"
//           disabled={isCompressing}
//         >
//           {isCompressing ? "Processing..." : "Update Product"}
//         </button>
//       </div>

//       {/* DELETE CONFIRMATION POPUP */}
//       {showDeletePopup && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
//             <h3 className="text-lg font-semibold text-gray-800 mb-3">Delete Image?</h3>
//             <p className="text-gray-600 text-sm mb-6">
//               Are you sure you want to remove this image? This action cannot be undone.
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={() => {
//                   setShowDeletePopup(false);
//                   setImagePendingDelete(null);
//                 }}
//                 className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDeleteImage}
//                 className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// };





// // --- Main Component (MODIFIED) ---
// function ViewProducts() {
//   const [products, setProducts] = useState([]);
//   const [categoryList, setCategoryList] = useState([]);
//   const [dimensionList, setDimensionList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Modals
//   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isCarouselOpen, setCarouselOpen] = useState(false);
//   const [carouselImages, setCarouselImages] = useState([]);
//   const [isQrOpen, setQrOpen] = useState(false);
//   const [qrCodeUrl, setQrCodeUrl] = useState('');
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newDimensionInput, setNewDimensionInput] = useState(''); // State for new dimension input

//   // Filtering & Pagination
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [productsPerPage] = useState(10); // Number of products per page


//   const fetchData = useCallback(async () => {
//     setError(null);
//     try {
//       const [productsRes, categoriesRes, dimensionsRes] = await Promise.all([
//         fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
//         fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category'),
//        fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions')
//       ]);

//       if (!productsRes.ok || !categoriesRes.ok || !dimensionsRes.ok) {
//         throw new Error('Failed to fetch initial data.');
//       }

//       const productsData = await productsRes.json();
//       const categoriesData = await categoriesRes.json();
//       const dimensionsData = await dimensionsRes.json();

//       setProducts(Array.isArray(productsData.products) ? productsData.products : []);
//       setCategoryList(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
//       setDimensionList(Array.isArray(dimensionsData) ? dimensionsData : []);

//     } catch (err) {
//       setError(err.message);
//       toast.error("Could not fetch data.");
//       console.error("Fetch Data Error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Move handleAddNewDimension to ViewProducts
//   const handleAddNewDimension = async () => {
//     const value = newDimensionInput.trim();
//     if (!value) {
//       toast.error("Please enter a dimension value.");
//       return;
//     }

//     const promise = fetch('https://threebappbackend.onrender.com/api/dimensions/add-dimensions', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ value })
//     }).then(async (res) => {
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || 'Failed to add dimension');
//       }
//       return res.json();
//     });

//     toast.promise(promise, {
//       loading: 'Adding dimension...',
//       success: () => {
//         setNewDimensionInput(''); // Clear the input after successful add
//         fetchData(); // Re-fetch dimensions to update lists
//         return 'Dimension added successfully!';
//       },
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // onDimensionAdded now just calls fetchData, as the actual add logic is above
//   // const handleDimensionAdded = () => { fetchData(); }; // No longer needed as handleAddNewDimension does this
//   const handleProductAdded = () => { fetchData(); };
// const showCarousel = (images) => { setCarouselImages(images.map(img => img.url)); setCarouselOpen(true); };
//   const showQrCode = (url) => { setQrCodeUrl(url); setQrOpen(true); };
//   const handleEdit = (product) => { setSelectedProduct(product); setIsUpdateModalOpen(true); };
//   const handleUpdateSuccess = () => { fetchData(); };

//   const handleDelete = async (productId) => {
//     if (!window.confirm('Are you sure you want to delete this product?')) return;
//     const promise = fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete/${productId}`, { method: 'DELETE' })
//       .then(res => {
//         if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Delete failed') });
//         return res.json();
//       });

//     toast.promise(promise, {
//       loading: 'Deleting product...',
//       success: () => { fetchData(); return 'Product deleted successfully!'; },
//       error: (err) => `Error: ${err.message}`,
//     });
//   };

//   // Filtering Logic
// const filteredProducts = products
//   .filter(product => {
//     const matchesSearchTerm = searchTerm.toLowerCase() === ''
//       ? true
//       : product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         product.about.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesCategory = filterCategory === ''
//       ? true
//       : product.categoryId && product.categoryId._id === filterCategory;

//     return matchesSearchTerm && matchesCategory;
//   })
//   .sort((a, b) => {
//     // If position missing, push them to bottom
//     const posA = a.position ?? Infinity;
//     const posB = b.position ?? Infinity;
//     return posA - posB;
//   });


//   // Pagination Logic
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const formatDateTime = (isoString) => {
//     if (!isoString) return 'N/A';
//     const date = new Date(isoString);
//     return date.toLocaleString(); // Formats to a human-readable date and time
//   };


//   if (isLoading) return <div className="text-center p-8 text-lg">Loading...</div>;
//   if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

//   return (
//     <div className="p-4 md:p-8 space-y-6 mt-8">
//       <Toaster position="top-right" />
//       <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//           <h2 className="text-2xl font-bold text-gray-800">View All Products</h2>
//           <button onClick={() => setIsAddModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">+ Add Product</button>
//         </div>

//         {/* Filter and Search Section */}
//         <div className="mb-6 flex flex-col sm:flex-row gap-4">
//           <div className="relative flex-grow">
//             <input
//               type="text"
//               placeholder="Search by product name or description..."
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#6A3E9D] focus:border-[#6A3E9D] outline-none transition"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1); // Reset to first page on search
//               }}
//             />
//             <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           </div>
//           <div className="relative">
//             {/* <select
//               value={filterCategory}
//               onChange={(e) => {
//                 setFilterCategory(e.target.value);
//                 setCurrentPage(1); // Reset to first page on category filter
//               }}
//               className="appearance-none w-full sm:w-auto pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-[#6A3E9D] focus:border-[#6A3E9D] outline-none bg-white"
//             >
//               <option value="">All Categories</option>
//               {categoryList.map(cat => (
//                 <option key={cat._id} value={cat._id}>{cat.name}</option>
//               ))}
//             </select> */}
//             {/* <FontAwesomeIcon icon={faAngleDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> */}
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left text-gray-600">
//             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3">Sr No.</th>
//                 <th className="px-6 py-3">Image</th>
//                 <th className="px-6 py-3">Frame</th>
//                 <th className="px-6 py-3">Position</th>

//                 <th className="px-6 py-3">Dimensions</th>
//                 <th className="px-6 py-3">Price/Piece</th>
//                 <th className="px-6 py-3">Piece/Box</th>
//                 <th className="px-6 py-3">Box Price</th>
//                 <th className="px-6 py-3">Discount</th>
//                 <th className="px-6 py-3">Qty</th>
//                 <th className="px-6 py-3">Description</th>
//                 <th className="px-6 py-3">Last Modify</th>
//                 <th className="px-6 py-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentProducts.length > 0 ? (
//                 currentProducts.map((product, index) => (
//                   <tr key={product._id} className="bg-white border-b hover:bg-gray-50 align-middle">
//                     <td className="px-6 py-4">{(indexOfFirstProduct + index) + 1}</td>
//                     <td className="px-6 py-4">
//                       {product.images && product.images.length > 0 ? (
//                         <img
//                           src={product.images[0]?.url}
//                           onClick={() => showCarousel(product.images)}
//                           className="w-16 h-16 object-cover rounded-md cursor-pointer"
//                           alt={product.name}
//                         />
//                       ) : (
//                         <div className="w-16 h-16  rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>


//                           {/* ⭐ Position */}
//                      <td className="px-6 py-4 font-semibold text-purple-600">
//                           {product.position ?? "—"}
//                      </td>

//                     <td className="px-6 py-4">{Array.isArray(product.dimensions) ? product.dimensions.map(d => d.value || d).join(', ') : '—'}</td>
//                     <td className="px-6 py-4">₹{product.pricePerPiece}</td>
//                     <td className="px-6 py-4">{product.totalPiecesPerBox}</td>
//                     <td className="px-6 py-4">₹{product.finalPricePerBox || product.mrpPerBox}</td>
//                     <td className="px-6 py-4">{product.discountPercentage || 0}%</td>
//                     <td className="px-6 py-4">{product.quantity}</td>
//                     <td className="px-6 py-4 text-xs text-gray-500">{product.description}</td>
//                     <td className="px-6 py-4 text-xs text-gray-500">{formatDateTime(product.updatedAt)}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-center">
//                       <button onClick={() => showQrCode(product.qrCodeUrl)} title="Show QR Code" className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faQrcode} /></button>
//                       <button onClick={() => handleEdit(product)} title="Edit" className="text-blue-600 hover:text-blue-800 p-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
//                       <button onClick={() => handleDelete(product._id)} title="Delete" className="text-red-600 hover:text-red-800 p-2"><FontAwesomeIcon icon={faTrash} /></button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="12" className="px-6 py-4 text-center text-gray-500">No products found.</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         <div className="mt-6 flex justify-center items-center gap-2">
//           <button
//             onClick={() => paginate(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           {[...Array(totalPages)].map((_, i) => (
//             <button
//               key={i + 1}
//               onClick={() => paginate(i + 1)}
//               className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? 'bg-[#6A3E9D] text-white border-[#6A3E9D]' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
//             >
//               {i + 1}
//             </button>
//           ))}
//           <button
//             onClick={() => paginate(currentPage + 1)}
//             disabled={currentPage === totalPages || totalPages === 0}
//             className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       <ImageSliderModal
//         isOpen={isCarouselOpen}
//         onClose={() => setCarouselOpen(false)}
//         images={carouselImages}
//       />

//       <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
//         <div className="p-6 flex flex-col items-center">
//           <h3 className="text-xl font-bold mb-4">Product QR Code</h3>
//           {qrCodeUrl ? (
//             <img src={qrCodeUrl} alt="Product QR Code" className="w-64 h-64 rounded-lg border p-2" />
//           ) : (
//             <p className="text-gray-500">QR Code not available.</p>
//           )}
//           <button onClick={() => setQrOpen(false)} className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Close</button>
//         </div>
//       </Modal>

//       {/* Pass the new dimension states and handler to AddProductModal */}
//       <AddProductModal
//         isOpen={isAddModalOpen}
//         onClose={() => setIsAddModalOpen(false)}
//         onProductAdded={handleProductAdded}
//         categories={categoryList}
//         dimensions={dimensionList}
//         handleAddNewDimension={handleAddNewDimension}
//         newDimensionInput={newDimensionInput}
//         setNewDimensionInput={setNewDimensionInput}
//       />

//       {/* Pass the new dimension states and handler to UpdateProductModal */}
//       <UpdateProductModal
//         isOpen={isUpdateModalOpen}
//         onClose={() => setIsUpdateModalOpen(false)}
//         onUpdateSuccess={handleUpdateSuccess}
//         product={selectedProduct}
//         categories={categoryList}
//         dimensions={dimensionList}
//         handleAddNewDimension={handleAddNewDimension}
//         newDimensionInput={newDimensionInput}
//         setNewDimensionInput={setNewDimensionInput}
//       />
//     </div>
//   );
// }

// export default ViewProducts;













