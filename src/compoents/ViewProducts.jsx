import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQrcode, 
  faPenToSquare, 
  faTrash, 
  faTimes, 
  faChevronLeft, 
  faChevronRight, 
  faFilter, 
  faExclamationTriangle,
  faDownload,
  faPrint 
} from '@fortawesome/free-solid-svg-icons';
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

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} size="xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
        <p className="text-gray-500 mt-2 text-sm">
          Are you sure you want to delete <span className="font-bold text-gray-800">"{productName || 'this product'}"</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6 justify-center">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium shadow-lg shadow-red-200 transition">Delete Now</button>
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
    
    const dimIds = selectedDimensions.map(d => d._id || d).filter(Boolean);
    submissionData.append("dimensions", dimIds.join(","));

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
              <select name="categoryId" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className={inputClass}>
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
                <input key={i} value={p} onChange={e => { const np = [...descriptionParts]; np[i] = e.target.value.slice(0, 20); setDescriptionParts(np); }} className="w-full h-9 text-center border rounded-lg text-sm" />
              ))}
            </div>
            {visibleBoxes < 20 && <button type="button" onClick={() => setVisibleBoxes(v => Math.min(v + 4, 20))} className="text-blue-600 text-xs mt-2">+ Add More</button>}
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
              <select onChange={e => { const d = dimensions.find(x => x._id === e.target.value); if(d && !selectedDimensions.find(s => (s._id || s) === d._id)) { setSelectedDimensions([...selectedDimensions, d]); } e.target.value=""; }} className={inputClass}>
                <option value="">Select Dimension</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="New..." />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 text-white px-4 rounded-lg">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedDimensions.map(d => (
                <span key={d._id || d} className="bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {d.value || d}
                  <button type="button" onClick={() => setSelectedDimensions(selectedDimensions.filter(item => (item._id || item) !== (d._id || d)))} className="ml-1 hover:text-red-200">×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold">COLOR IMAGES</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setColorImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-2 mt-2">{colorImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setColorImages(p => p.filter((_, idx) => idx !== i))} />)}</div>
            </div>
            <div>
              <label className="text-xs font-bold">PRODUCT IMAGES *</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setProductImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-2 mt-2">{productImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setProductImages(p => p.filter((_, idx) => idx !== i))} />)}</div>
            </div>
          </div>
        </form>
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg">Cancel</button>
        <button type="submit" form="add-form" disabled={isCompressing} className={`px-6 py-2 bg-[#6A3E9D] text-white rounded-lg flex items-center gap-2 ${isCompressing ? 'opacity-70' : ''}`}>
          {isCompressing ? "Saving..." : "Save Product"}
        </button>
      </div>
    </Modal>
  );
}

// --- Update Product Modal ---
const UpdateProductModal = ({ isOpen, onClose, onUpdateSuccess, product, categories = [], dimensions = [], handleAddNewDimension, newDimensionInput, setNewDimensionInput }) => {
  const [formData, setFormData] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [existingColorImages, setExistingColorImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newColorImages, setNewColorImages] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
  const [visibleBoxes, setVisibleBoxes] = useState(4);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({ 
        categoryId: product.categoryId?._id || product.categoryId || "", 
        name: product.name || "", 
        about: product.about || "", 
        pricePerPiece: product.pricePerPiece || "", 
        totalPiecesPerBox: product.totalPiecesPerBox || "", 
        discountPercentage: product.discountPercentage || 0, 
        quantity: product.quantity || "", 
        position: product.position || 0 
      });

      setExistingImages(product.images || []);
      const colorImgs = product.colorImageMap ? Object.values(product.colorImageMap) : [];
      setExistingColorImages(colorImgs);

      setNewImages([]);
      setNewColorImages([]);
      
      setSelectedDimensions(product.dimensions || []);
      
      const parts = Array(20).fill("");
      const descStr = product.description || "";
      descStr.split(" ").forEach((word, i) => { if(i < 20) parts[i] = word; });
      setDescriptionParts(parts);
      
      const filledCount = parts.filter(p => p !== "").length;
      setVisibleBoxes(Math.max(4, Math.ceil(filledCount / 4) * 4));
    }
  }, [product, isOpen]);

  const handleFileChange = async (e, setter) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 0.7, maxWidthOrHeight: 1280, useWebWorker: true };
      const compressed = await Promise.all(files.map(f => imageCompression(f, options)));
      setter(prev => [...prev, ...compressed]);
      toast.success("Compressed!");
    } catch (err) {
        toast.error("Compression failed");
    } finally { setIsCompressing(false); }
  };

  const deleteExistingImage = async (img, isColor = false) => {
    if (!window.confirm("Remove this image?")) return;
    const cleanId = img.id?.includes("/") ? img.id.split("/").pop() : img.id;
    if(!cleanId) return toast.error("Invalid Image ID");

    try {
      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/products/${product._id}/images/${cleanId}`, { method: "DELETE" });
      if (res.ok) {
        if (isColor) setExistingColorImages(prev => prev.filter(i => i.id !== img.id));
        else setExistingImages(prev => prev.filter(i => i.id !== img.id));
        toast.success("Image deleted");
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("description", descriptionParts.filter(p => p?.trim()).join(" ").trim());
    
    const dimIds = selectedDimensions
        .map(d => (typeof d === 'object' && d !== null ? d._id : d))
        .filter(id => id && id !== "undefined");
    
    data.append("dimensions", dimIds.join(","));

    Object.entries(formData).forEach(([k, v]) => {
        if(v !== null && v !== undefined) data.append(k, v);
    });

    newImages.forEach(f => data.append("images", f, f.name));
    newColorImages.forEach(f => data.append("colorImages", f, f.name));

    const tid = toast.loading("Updating product...");
    try {
      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${product._id}`, { method: "PUT", body: data });
      if (res.ok) { 
        toast.success("Updated Successfully!", { id: tid });
        onUpdateSuccess(); 
        onClose(); 
      } else {
        toast.error("Update failed", { id: tid });
      }
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
              <select onChange={e => { 
                const d = dimensions.find(x => x._id === e.target.value); 
                if(d && !selectedDimensions.find(s => (s._id || s) === d._id)) {
                   setSelectedDimensions([...selectedDimensions, d]);
                }
                e.target.value=""; 
              }} className={inputClass}>
                <option value="">Select Existing</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="New..." />
              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 text-white px-4 rounded-lg">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedDimensions.map((d, i) => (
                <span key={d?._id || i} className="bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    {d?.value || d}
                    <button type="button" onClick={() => setSelectedDimensions(selectedDimensions.filter((_, idx) => idx !== i))} className="hover:text-red-200 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Product Images (Existing)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {existingImages.map((img, i) => <ImageThumb key={i} file={img.url} isUrl={true} onRemove={() => deleteExistingImage(img)} />)}
                    {newImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} />)}
                </div>
                <input type="file" multiple onChange={e => handleFileChange(e, setNewImages)} className="mt-3 block text-xs" />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Color Images (Existing)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {existingColorImages.map((img, i) => <ImageThumb key={i} file={img.url} isUrl={true} onRemove={() => deleteExistingImage(img, true)} />)}
                    {newColorImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setNewColorImages(prev => prev.filter((_, idx) => idx !== i))} />)}
                </div>
                <input type="file" multiple onChange={e => handleFileChange(e, setNewColorImages)} className="mt-3 block text-xs" />
            </div>
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
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductCount, setTotalProductCount] = useState(0); 

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [sliderImages, setSliderImages] = useState([]);
  
  // --- QR State ---
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrProductName, setQrProductName] = useState('');
  const [qrPcsPerBox, setQrPcsPerBox] = useState('');
  const [isQrOpen, setQrOpen] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDimInput, setNewDimInput] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const PRODUCTS_API = 'https://threebapi-1067354145699.asia-south1.run.app/api/products';
  const DIMENSIONS_API = 'https://threebappbackend.onrender.com/api/dimensions';


  const fetchData = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const [catRes, dimRes] = await Promise.all([
          fetch(`${PRODUCTS_API.replace('/api/products', '/api/categories')}/all-category`).then(r => r.json().catch(() => ({categories: []}))),
          fetch(`${DIMENSIONS_API}/get-dimensions`).then(r => r.json().catch(() => []))
      ]);

      setCategoryList(catRes.categories || []);
      setDimensionList(Array.isArray(dimRes) ? dimRes : []);

      const paginatedUrl = `${PRODUCTS_API}/all?page=${page}`;
      const prodRes = await fetch(paginatedUrl);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProductCount(data.totalProducts  || 0); 
        setCurrentPage(page);
      } else {
        const errorData = await prodRes.json().catch(() => ({}));
        toast.error(`Failed to load products: ${errorData.message || 'Unknown error'}`);
        setProducts([]);
        setTotalPages(1);
        setTotalProductCount(0);
      }

    } catch (e) { 
      toast.error("Fetch failed or API is down"); 
      console.error(e);
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchData(currentPage); 
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, filterCategory]);

  const handleAddNewDim = async () => {
    if (!newDimInput.trim()) return;
    try {
      const res = await fetch(`${DIMENSIONS_API}/add-dimensions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newDimInput })
      });
      if(res.ok) {
        setNewDimInput(''); 
        const dRes = await fetch(`${DIMENSIONS_API}/get-dimensions`);
        if(dRes.ok) setDimensionList(await dRes.json());
        toast.success("Dimension Added");
      }
    } catch (e) { toast.error("Failed to add dimension"); }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const tid = toast.loading("Deleting product...");
    try {
      const res = await fetch(`${PRODUCTS_API}/delete/${productToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Product deleted successfully", { id: tid });
        fetchData(currentPage); 
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

  // --- UPDATED HORIZONTAL PRINT LOGIC (100mm x 50mm) ---
  const handlePrintSticker = () => {
    if (!qrCodeUrl) return toast.error("QR not found");
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Sticker - ${qrProductName}</title>
          <style>
            @page {
              size: 100mm 50mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100mm;
              height: 50mm;
              box-sizing: border-box;
              background-color: #fff;
            }
            .container {
              display: flex;
              width: 100%;
              height: 100%;
              align-items: center;
              padding: 5mm;
              gap: 8mm;
            }
            .qr-side {
              flex: 0 0 40mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code {
              width: 40mm;
              height: 40mm;
              object-fit: contain;
            }
            .info-side {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              text-align: left;
            }
            .label {
              font-size: 10pt;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 2mm;
            }
            .model-name {
              font-size: 38pt;
              font-weight: 900;
              color: #000;
              margin: 0;
              line-height: 1;
            }
            .pcs {
              font-size: 14pt;
              font-weight: bold;
              color: #333;
              margin-top: 3mm;
            }
            .website {
              font-size: 8pt;
              font-weight: bold;
              color: #6A3E9D;
              margin-top: 4mm;
              border-top: 0.2mm solid #eee;
              padding-top: 2mm;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="qr-side">
              <img src="${qrCodeUrl}" class="qr-code" />
            </div>
            <div class="info-side">
              <div class="label">MODEL NO.</div>
              <div class="model-name">${qrProductName}</div>
              <div class="pcs">${qrPcsPerBox || '0'} pcs/box</div>
              <div class="website">www.3bprofilespvtltd.com</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadQr = async () => {
    if (!qrCodeUrl) return;
    const toastId = toast.loading("Processing download...");
    try {
      const response = await fetch(qrCodeUrl, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrProductName.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded!", { id: toastId });
    } catch (error) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.target = '_blank';
      link.download = `${qrProductName.replace(/\s+/g, '_')}_QR.png`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Opened in new tab", { id: toastId });
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products
      .filter(p => {
        const matchesSearch = term === '' || p.name?.toLowerCase().includes(term) || (p.about || "").toLowerCase().includes(term);
        const matchesCat = filterCategory === '' || p.categoryId?._id === filterCategory || p.categoryId === filterCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  }, [products, searchTerm, filterCategory]);

  const paginated = filteredProducts; 

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
        fetchData(page);
    }
  };
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2);
      if (currentPage > 3) pages.push('...');
      if (currentPage > 2 && currentPage < totalPages - 1) pages.push(currentPage);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages - 1, totalPages);
    }
    return [...new Set(pages)].filter(p => p !== 0); 
  };

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
          <h2 className="text-2xl font-bold">Product Warehouse ({totalProductCount})</h2>
          <button onClick={() => setIsAddOpen(true)} className="bg-[#6A3E9D] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#5a3486] transition">+ Add Product</button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input type="text" placeholder="Search frame, model or details..." className="w-full pl-10 pr-4 py-2 border rounded-xl" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); }} />
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select className="p-2 border rounded-xl text-sm" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); }}>
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
                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/50'} onClick={() => { if(product.images?.length) { setSliderImages(product.images.map(i => i.url)); setIsSliderOpen(true); } }} className="w-12 h-12 object-cover rounded shadow-sm cursor-pointer" alt="p" />
                  </td>
                  <td className="px-4 py-4 font-bold">{product.name}</td>
                  <td className="px-4 py-4 text-center text-purple-600 font-bold">{product.position ?? "—"}</td>
                  <td className="px-4 py-4">
                    {product.dimensions?.filter(Boolean).map(d => d.value || d).join(', ') || "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold">₹{product.pricePerPiece}</td>
                  <td className="px-4 py-4">{product.quantity}</td>
                  <td className="px-4 py-4 text-center space-x-3 whitespace-nowrap">
                    <button title="View QR" onClick={() => { setQrCodeUrl(product.qrCodeUrl); setQrProductName(product.name); setQrPcsPerBox(product.totalPiecesPerBox); setQrOpen(true); }} className="p-2 hover:bg-gray-100 rounded-full transition"><FontAwesomeIcon icon={faQrcode} className="text-gray-400 hover:text-black" /></button>
                    <button title="Edit" onClick={() => { setSelectedProduct(product); setIsUpdateOpen(true); }} className="p-2 hover:bg-blue-50 rounded-full transition"><FontAwesomeIcon icon={faPenToSquare} className="text-blue-500 hover:text-blue-700" /></button>
                    <button title="Delete" onClick={() => { setProductToDelete(product); setIsDeleteOpen(true); }} className="p-2 hover:bg-red-50 rounded-full transition"><FontAwesomeIcon icon={faTrash} className="text-red-500" /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-10 text-center text-gray-400">No products found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-3 py-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`px-4 py-2 border rounded-xl transition flex items-center gap-2 font-medium ${currentPage === 1 ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 text-[#6A3E9D]'}`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="sm" /> Prev
                </button>
                <div className="flex gap-2">
                {getPageNumbers().map((page, i) => (
                    <button 
                      key={i} 
                      disabled={page === '...'}
                      onClick={() => handlePageChange(page)} 
                      className={`w-10 h-10 border rounded-xl transition font-bold flex items-center justify-center 
                        ${page === '...' ? 'border-none bg-transparent cursor-default' : 
                          currentPage === page ? 'bg-[#6A3E9D] text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
                    >
                      {page}
                    </button>
                ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`px-4 py-2 border rounded-xl transition flex items-center gap-2 font-medium ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 text-[#6A3E9D]'}`}
                >
                  Next <FontAwesomeIcon icon={faChevronRight} size="sm" />
                </button>
            </div>
        )}
      </div>

      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setProductToDelete(null); }} onConfirm={handleConfirmDelete} productName={productToDelete?.name || ""} />
      <ImageSliderModal isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)} images={sliderImages} />
      
      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        <div className="p-8 flex flex-col items-center text-center">
            <h3 className="font-bold text-xl mb-2 text-gray-800">Product QR Code</h3>
            
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-4 shadow-sm">
                {qrCodeUrl ? (
                    <img src={qrCodeUrl} className="w-56 h-56 object-contain" alt="QR" />
                ) : (
                    <div className="w-56 h-56 bg-gray-50 flex items-center justify-center rounded-lg">
                        <span className="text-gray-400 text-sm">No QR Available</span>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Model / Frame</p>
                <h2 className="text-2xl font-black text-[#6A3E9D] tracking-tight leading-none">
                    {qrProductName || "Unknown Product"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">{qrPcsPerBox ? `${qrPcsPerBox} Pcs/Box` : ''}</p>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <div className="flex gap-2 w-full">
                    <button 
                        onClick={handlePrintSticker} 
                        disabled={!qrCodeUrl}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faPrint} /> Print Sticker
                    </button>
                    <button 
                        onClick={handleDownloadQr} 
                        disabled={!qrCodeUrl}
                        className="flex-1 py-3 bg-[#6A3E9D] hover:bg-[#5a3486] text-white rounded-xl font-bold shadow-lg shadow-purple-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faDownload} /> Download
                    </button>
                </div>
                <button 
                    onClick={() => setQrOpen(false)} 
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                >
                    Close
                </button>
            </div>
        </div>
      </Modal>

      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onProductAdded={() => fetchData(1)} categories={categoryList} dimensions={dimensionList} handleAddNewDimension={handleAddNewDim} newDimensionInput={newDimInput} setNewDimensionInput={setNewDimInput} />
      
      {selectedProduct && (
        <UpdateProductModal 
            isOpen={isUpdateOpen} 
            onClose={() => {setIsUpdateOpen(false); setSelectedProduct(null);}} 
            onUpdateSuccess={() => fetchData(currentPage)} 
            product={selectedProduct} 
            categories={categoryList} 
            dimensions={dimensionList} 
            handleAddNewDimension={handleAddNewDim} 
            newDimensionInput={newDimInput} 
            setNewDimensionInput={setNewDimInput} 
        />
      )}
    </div>
  );
}

// --- Slider Component ---
const ImageSliderModal = ({ isOpen, onClose, images }) => {
  const [idx, setIdx] = useState(0); 
  useEffect(() => { 
    if (isOpen) {
      setIdx(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen || !images?.length) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-all">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>
      <button onClick={onClose} className="absolute top-8 right-8 z-[100000] bg-black/10 hover:bg-red-500 hover:rotate-90 text-black w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xl border border-black/5 shadow-lg">
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      <div className="relative w-full max-w-5xl px-4 flex items-center justify-center">
        <button onClick={() => setIdx(i => i === 0 ? images.length-1 : i-1)} className="absolute left-0 md:left-5 text-gray-800/20 hover:text-[#6A3E9D] hover:scale-125 transition-all z-50 p-4">
          <FontAwesomeIcon icon={faChevronLeft} size="2xl" />
        </button>
        <div className="relative flex items-center justify-center">
          <img key={idx} src={images[idx]} className="max-w-full max-h-[82vh] object-contain rounded-2xl drop-shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-500 ease-out" alt="Product" />
          <div className="absolute -z-10 w-full h-full bg-black/5 blur-3xl rounded-full"></div>
        </div>
        <button onClick={() => setIdx(i => i === images.length-1 ? 0 : i+1)} className="absolute right-0 md:right-5 text-gray-800/20 hover:text-[#6A3E9D] hover:scale-125 transition-all z-50 p-4">
          <FontAwesomeIcon icon={faChevronRight} size="2xl" />
        </button>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-5 duration-700">
        <div className="flex gap-2 items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-sm">
           {images.map((_, i) => (
             <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === idx ? 'w-8 bg-[#6A3E9D]' : 'w-2 bg-gray-400'}`} />
           ))}
        </div>
        <span className="text-[#6A3E9D] font-black text-[10px] tracking-[0.3em] uppercase opacity-60">{idx + 1} <span className="mx-1 text-gray-300">/</span> {images.length}</span>
      </div>
    </div>
  );
};

export default ViewProducts;