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
  faPrint,
  faPlus,
  faSearch,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';

// --- Shared Premium Constants ---
const inputClass = "w-full p-3 mt-1 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#6A3E9D] focus:bg-white focus:ring-4 focus:ring-[#6A3E9D]/15 focus:outline-none transition-all duration-300 text-sm font-medium text-gray-700 shadow-sm";
const fileInputClass = "block w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-[#6A3E9D] hover:file:bg-[#6A3E9D] hover:file:text-white file:transition-all file:duration-300 file:cursor-pointer cursor-pointer";

// --- Reusable Components ---
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-center z-[100] p-4 bg-black/40 backdrop-blur-md transition-opacity duration-300">
      <div className={`bg-white rounded-3xl shadow-2xl relative ${maxWidth} w-full border border-white/20 flex flex-col max-h-[90vh] transform scale-100 opacity-100 transition-all duration-300 overflow-hidden`}>
        {children}
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, productName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner border border-red-100">
          <FontAwesomeIcon icon={faExclamationTriangle} size="2xl" className="animate-pulse" />
        </div>
        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Confirm Deletion</h3>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed">
          Are you completely sure you want to delete <br/>
          <span className="font-bold text-[#6A3E9D] bg-purple-50 px-2 py-1 rounded-md inline-block mt-1">"{productName || 'this product'}"</span>? <br/>
          This action is permanent and cannot be undone.
        </p>
        <div className="flex gap-4 mt-8 justify-center">
          <button onClick={onClose} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-300 w-full">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 transition-all duration-300 w-full">Delete Now</button>
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
    <div className="relative w-24 h-24 border-2 border-gray-100 rounded-xl overflow-hidden shadow-sm group hover:shadow-md hover:border-purple-200 transition-all duration-300">
      {preview && <img src={preview} alt="thumb" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
      <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-md">
        <FontAwesomeIcon icon={faTimes} />
      </button>
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

    const toastId = toast.loading("Saving Product...");
    try {
      const res = await fetch("https://threebapi-1067354145699.asia-south1.run.app/api/products/add", { method: "POST", body: submissionData });
      if (res.ok) { onProductAdded(); onClose(); toast.success("Product Added Successfully!", { id: toastId }); }
      else { toast.error("Failed to add product", { id: toastId }); }
    } catch (err) { toast.error("Error adding product", { id: toastId }); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b flex justify-between items-center">
        <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <div className="bg-[#6A3E9D] text-white p-2 rounded-lg text-sm shadow-md"><FontAwesomeIcon icon={faPlus} /></div>
          Add New Product
        </h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 text-gray-500">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">
        <form id="add-form" onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className={inputClass}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase">Model Number *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="e.g. F-101" required />
            </div>
            <div>
              <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Position</label>
              <input type="number" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
            <label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase mb-2 block">Description Boxes</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {descriptionParts.slice(0, visibleBoxes).map((p, i) => (
                <input key={i} value={p} onChange={e => { const np = [...descriptionParts]; np[i] = e.target.value.slice(0, 20); setDescriptionParts(np); }} className="w-full h-10 text-center border-gray-200 rounded-xl text-sm focus:border-[#6A3E9D] focus:ring-2 focus:ring-[#6A3E9D]/20 transition-all outline-none" placeholder={`Box ${i+1}`} />
              ))}
            </div>
            {visibleBoxes < 20 && <button type="button" onClick={() => setVisibleBoxes(v => Math.min(v + 5, 20))} className="mt-4 px-4 py-2 bg-white border border-purple-200 text-[#6A3E9D] rounded-lg text-xs font-bold hover:bg-[#6A3E9D] hover:text-white transition-all duration-300 shadow-sm">+ Add More Boxes</button>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Stock Qty</label><input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Price / PC</label><input type="number" value={formData.pricePerPiece} onChange={e => setFormData({ ...formData, pricePerPiece: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">PCS / Box</label><input type="number" value={formData.totalPiecesPerBox} onChange={e => setFormData({ ...formData, totalPiecesPerBox: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Discount %</label><input type="number" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className={inputClass} /></div>
          </div>

          <div>
            <label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase block mb-1">Dimensions *</label>
            <div className="flex gap-3">
              <select onChange={e => { const d = dimensions.find(x => x._id === e.target.value); if (d && !selectedDimensions.find(s => (s._id || s) === d._id)) { setSelectedDimensions([...selectedDimensions, d]); } e.target.value = ""; }} className={inputClass}>
                <option value="">Select Existing</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="Or type new..." />
              <button type="button" onClick={handleAddNewDimension} className="mt-1 bg-gray-800 hover:bg-black text-white px-6 rounded-xl font-bold transition-all shadow-md">Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDimensions.map(d => (
                <span key={d._id || d} className="bg-gradient-to-r from-[#6A3E9D] to-[#8B5CF6] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-300">
                  {d.value || d}
                  <button type="button" onClick={() => setSelectedDimensions(selectedDimensions.filter(item => (item._id || item) !== (d._id || d)))} className="hover:text-red-300 bg-black/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Color Images</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setColorImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-3 mt-3">{colorImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setColorImages(p => p.filter((_, idx) => idx !== i))} />)}</div>
            </div>
            <div className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
              <label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase">Product Images *</label>
              <input type="file" multiple onChange={e => handleFileChange(e, setProductImages)} className={fileInputClass} />
              <div className="flex flex-wrap gap-3 mt-3">{productImages.map((f, i) => <ImageThumb key={i} file={f} onRemove={() => setProductImages(p => p.filter((_, idx) => idx !== i))} />)}</div>
            </div>
          </div>
        </form>
      </div>
      <div className="p-5 bg-gray-50 border-t flex justify-end gap-3 rounded-b-3xl">
        <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300">Cancel</button>
        <button type="submit" form="add-form" disabled={isCompressing} className={`px-8 py-2.5 bg-gradient-to-r from-[#6A3E9D] to-[#8B5CF6] text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 ${isCompressing ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}>
          {isCompressing ? "Processing..." : "Save Product"}
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
      descStr.split(" ").forEach((word, i) => { if (i < 20) parts[i] = word; });
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
    if (!cleanId) return toast.error("Invalid Image ID");

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
      if (v !== null && v !== undefined) data.append(k, v);
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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b flex justify-between items-center">
         <h3 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg text-sm shadow-md"><FontAwesomeIcon icon={faPenToSquare} /></div>
          Update Product
        </h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 text-gray-500">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="p-8 overflow-y-auto space-y-6 max-h-[75vh] custom-scrollbar">
        <form id="update-form" onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className={inputClass}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase">Model Number</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Position</label><input type="number" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className={inputClass} /></div>
          </div>
          
          <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
            <label className="text-[11px] tracking-wider font-bold text-blue-600 uppercase mb-2 block">Description Boxes</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {descriptionParts.slice(0, visibleBoxes).map((p, i) => (
                <input key={i} value={p} onChange={e => { const u = [...descriptionParts]; u[i] = e.target.value; setDescriptionParts(u); }} className="w-full h-10 border-gray-200 rounded-xl text-center text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
              ))}
            </div>
            {visibleBoxes < 20 && <button type="button" onClick={() => setVisibleBoxes(v => v + 5)} className="mt-4 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm">+ Add More</button>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Stock Qty</label><input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Price</label><input type="number" value={formData.pricePerPiece} onChange={e => setFormData({ ...formData, pricePerPiece: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Pcs/Box</label><input type="number" value={formData.totalPiecesPerBox} onChange={e => setFormData({ ...formData, totalPiecesPerBox: e.target.value })} className={inputClass} /></div>
            <div><label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase">Discount %</label><input type="number" value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })} className={inputClass} /></div>
          </div>

          <div>
            <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase block mb-1">Dimensions</label>
            <div className="flex gap-3">
              <select onChange={e => {
                const d = dimensions.find(x => x._id === e.target.value);
                if (d && !selectedDimensions.find(s => (s._id || s) === d._id)) {
                  setSelectedDimensions([...selectedDimensions, d]);
                }
                e.target.value = "";
              }} className={inputClass}>
                <option value="">Select Existing</option>
                {dimensions.map(d => <option key={d._id} value={d._id}>{d.value}</option>)}
              </select>
              <input type="text" value={newDimensionInput} onChange={e => setNewDimensionInput(e.target.value)} className={inputClass} placeholder="New..." />
              <button type="button" onClick={handleAddNewDimension} className="mt-1 bg-gray-800 hover:bg-black text-white px-6 rounded-xl font-bold transition-all shadow-md">Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDimensions.map((d, i) => (
                <span key={d?._id || i} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in">
                  {d?.value || d}
                  <button type="button" onClick={() => setSelectedDimensions(selectedDimensions.filter((_, idx) => idx !== i))} className="hover:text-red-200 bg-black/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6 border-t pt-6">
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="text-[11px] tracking-wider font-bold text-[#6A3E9D] uppercase block mb-3">Product Images (Existing & New)</label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => <ImageThumb key={`ex-${i}`} file={img.url} isUrl={true} onRemove={() => deleteExistingImage(img)} />)}
                {newImages.map((f, i) => <ImageThumb key={`new-${i}`} file={f} onRemove={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} />)}
              </div>
              <input type="file" multiple onChange={e => handleFileChange(e, setNewImages)} className={`${fileInputClass} mt-4`} />
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <label className="text-[11px] tracking-wider font-bold text-gray-500 uppercase block mb-3">Color Images (Existing & New)</label>
              <div className="flex flex-wrap gap-3">
                {existingColorImages.map((img, i) => <ImageThumb key={`exc-${i}`} file={img.url} isUrl={true} onRemove={() => deleteExistingImage(img, true)} />)}
                {newColorImages.map((f, i) => <ImageThumb key={`newc-${i}`} file={f} onRemove={() => setNewColorImages(prev => prev.filter((_, idx) => idx !== i))} />)}
              </div>
              <input type="file" multiple onChange={e => handleFileChange(e, setNewColorImages)} className={`${fileInputClass} mt-4`} />
            </div>
          </div>
        </form>
      </div>
      <div className="p-5 bg-gray-50 border-t flex justify-end gap-3 rounded-b-3xl">
        <button onClick={onClose} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300">Cancel</button>
        <button type="submit" form="update-form" disabled={isCompressing} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2">
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
        fetch(`${PRODUCTS_API.replace('/api/products', '/api/categories')}/all-category`).then(r => r.json().catch(() => ({ categories: [] }))),
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
        setTotalProductCount(data.totalProducts || 0);
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
      if (res.ok) {
        setNewDimInput('');
        const dRes = await fetch(`${DIMENSIONS_API}/get-dimensions`);
        if (dRes.ok) setDimensionList(await dRes.json());
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

  // --- HORIZONTAL PRINT LOGIC (100mm x 50mm) ---
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
              width: 100mm;
              height: 50mm;
              overflow: hidden; 
            }
            .container {
              display: flex;
              width: 100mm;
              height: 50mm;
              align-items: center;
              padding: 4mm;
              box-sizing: border-box;
              gap: 5mm;
            }
            .qr-side {
              flex: 0 0 38mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-code {
              width: 38mm;
              height: 38mm;
              object-fit: contain;
            }
            .info-side {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .label {
              font-size: 8pt;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 0mm;
            }
            .model-name {
              font-size: 32pt; 
              font-weight: 900;
              color: #000;
              margin: 0;
              line-height: 1.1;
            }
            .pcs {
              font-size: 13pt;
              font-weight: bold;
              color: #333;
              margin-top: 1mm;
            }
            .website {
              font-size: 7.5pt;
              font-weight: bold;
              color: #6A3E9D;
              margin-top: 2mm;
              border-top: 0.1mm solid #eee;
              padding-top: 1mm;
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
      <div className="w-16 h-16 border-4 border-gray-100 border-t-[#6A3E9D] rounded-full animate-spin shadow-lg"></div>
      <p className="mt-5 font-black text-xl text-[#6A3E9D] tracking-widest animate-pulse">LOADING WAREHOUSE...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 mt-8 bg-gray-50/50 min-h-screen">
      <Toaster position="top-right" toastOptions={{ className: 'font-bold rounded-xl shadow-lg' }} />
      
      {/* KHATARNAK HEADING BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#4A1D7A] via-[#6A3E9D] to-[#8B5CF6] p-8 md:p-10 rounded-3xl shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10 group-hover:scale-150 transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
            <FontAwesomeIcon icon={faBoxOpen} size="2xl" className="text-white drop-shadow-md" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-lg">
              Product Vault
            </h2>
            <p className="text-purple-100 mt-2 font-medium tracking-wide flex items-center gap-2 text-sm md:text-base">
              <span className="bg-white/20 px-3 py-1 rounded-full text-white shadow-sm border border-white/10">{totalProductCount} Items</span>
              Managing your premium inventory
            </p>
          </div>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="relative z-10 bg-white text-[#6A3E9D] py-3.5 px-8 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95 flex items-center gap-3 group/btn">
          <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center group-hover/btn:rotate-90 transition-transform duration-300 text-[#6A3E9D]">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          Add New Product
        </button>
      </div>

      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 border border-gray-100">
        
        {/* Filters & Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-5">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A3E9D] transition-colors">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input type="text" placeholder="Search by model, frame, or description..." className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#6A3E9D] focus:bg-white focus:ring-4 focus:ring-[#6A3E9D]/10 focus:outline-none transition-all duration-300 font-medium text-gray-700 placeholder-gray-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative min-w-[200px] group">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#6A3E9D] transition-colors z-10">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            <select className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#6A3E9D] focus:bg-white focus:ring-4 focus:ring-[#6A3E9D]/10 focus:outline-none transition-all duration-300 font-bold text-gray-700 appearance-none cursor-pointer" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categoryList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Premium Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 text-xs tracking-wider uppercase font-black border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 rounded-tl-2xl">#</th>
                <th className="px-6 py-5">Product Preview</th>
                <th className="px-6 py-5">Frame Details</th>
                <th className="px-6 py-5 text-center">Pos</th>
                <th className="px-6 py-5">Dimensions</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Stock</th>
                <th className="px-6 py-5 text-center rounded-tr-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length > 0 ? paginated.map((product, idx) => (
                <tr key={product._id} className="group hover:bg-purple-50/40 transition-colors duration-300 bg-white">
                  <td className="px-6 py-4 font-bold text-gray-400">{((currentPage - 1) * productsPerPage) + idx + 1}</td>
                  <td className="px-6 py-4">
                    {/* BADA IMAGE WITH ANIMATION */}
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm border-2 border-transparent group-hover:border-[#6A3E9D]/30 group-hover:shadow-md transition-all duration-300">
                      <img
                        src={product.images?.[1]?.url || product.images?.[0]?.url || 'https://via.placeholder.com/100'}
                        onClick={() => { if (product.images?.length) { setSliderImages(product.images.map(i => i.url)); setIsSliderOpen(true); } }}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                        alt="product"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-lg text-gray-800 tracking-tight">{product.name}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{product.categoryId?.name || 'Uncategorized'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-purple-100 text-[#6A3E9D] py-1 px-3 rounded-lg font-black text-xs">{product.position ?? "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.dimensions?.filter(Boolean).map((d, i) => (
                         <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider">{d.value || d}</span>
                      )) || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-800 text-base">₹{product.pricePerPiece}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg font-bold text-xs ${product.quantity > 50 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {product.quantity} In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-3">
                        <button title="View QR" onClick={() => { setQrCodeUrl(product.qrCodeUrl); setQrProductName(product.name); setQrPcsPerBox(product.totalPiecesPerBox); setQrOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-[#6A3E9D] hover:text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          <FontAwesomeIcon icon={faQrcode} />
                        </button>
                        <button title="Edit Product" onClick={() => { setSelectedProduct(product); setIsUpdateOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </button>
                        <button title="Delete Product" onClick={() => { setProductToDelete(product); setIsDeleteOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-16 text-center text-gray-400 font-medium">No products found matching your search criteria. Try a different term.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Premium Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <p className="text-sm text-gray-500 font-medium hidden md:block">Showing Page <span className="font-bold text-gray-800">{currentPage}</span> of <span className="font-bold text-gray-800">{totalPages}</span></p>
             <div className="flex items-center gap-2 w-full md:w-auto justify-center">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm ${currentPage === 1 ? 'opacity-40 cursor-not-allowed text-gray-400 bg-transparent' : 'bg-white hover:bg-[#6A3E9D] hover:text-white text-[#6A3E9D] shadow-sm hover:shadow-md border border-gray-200 hover:border-transparent'}`}
              >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" /> Prev
              </button>
              <div className="flex gap-1.5">
                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    disabled={page === '...'}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl transition-all duration-300 font-black text-sm flex items-center justify-center 
                          ${page === '...' ? 'bg-transparent text-gray-400 cursor-default' :
                        currentPage === page ? 'bg-gradient-to-r from-[#6A3E9D] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/30 scale-110' : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed text-gray-400 bg-transparent' : 'bg-white hover:bg-[#6A3E9D] hover:text-white text-[#6A3E9D] shadow-sm hover:shadow-md border border-gray-200 hover:border-transparent'}`}
              >
                Next <FontAwesomeIcon icon={faChevronRight} size="xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmModal isOpen={isDeleteOpen} onClose={() => { setIsDeleteOpen(false); setProductToDelete(null); }} onConfirm={handleConfirmDelete} productName={productToDelete?.name || ""} />
      <ImageSliderModal isOpen={isSliderOpen} onClose={() => setIsSliderOpen(false)} images={sliderImages} />

      {/* QR MODAL - Highly Styled */}
      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        <div className="p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-purple-50 to-transparent"></div>
          
          <h3 className="font-black text-2xl mb-6 text-gray-800 tracking-tight relative z-10">Smart QR Tag</h3>

          <div className="relative z-10 bg-white p-5 rounded-3xl border-2 border-dashed border-[#6A3E9D]/30 mb-6 shadow-xl shadow-purple-100 group hover:border-[#6A3E9D] transition-colors duration-300">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} className="w-64 h-64 object-contain transform group-hover:scale-105 transition-transform duration-500" alt="QR" />
            ) : (
              <div className="w-64 h-64 bg-gray-50 flex flex-col items-center justify-center rounded-2xl gap-3">
                <FontAwesomeIcon icon={faQrcode} className="text-gray-300 text-5xl" />
                <span className="text-gray-400 text-sm font-bold tracking-widest uppercase">No QR Generated</span>
              </div>
            )}
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#6A3E9D] rounded-tl-xl -mt-1 -ml-1"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#6A3E9D] rounded-tr-xl -mt-1 -mr-1"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#6A3E9D] rounded-bl-xl -mb-1 -ml-1"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#6A3E9D] rounded-br-xl -mb-1 -mr-1"></div>
          </div>

          <div className="mb-8 relative z-10">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Model / Frame Details</p>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4A1D7A] to-[#8B5CF6] tracking-tight leading-none drop-shadow-sm">
              {qrProductName || "Unknown Product"}
            </h2>
            <div className="mt-3 inline-block bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
              <p className="text-sm font-bold text-gray-600 tracking-wide">{qrPcsPerBox ? `${qrPcsPerBox} PCS / BOX` : 'No Box Quantity'}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full relative z-10">
            <div className="flex gap-3 w-full">
              <button
                onClick={handlePrintSticker}
                disabled={!qrCodeUrl}
                className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                <FontAwesomeIcon icon={faPrint} /> Print Sticker
              </button>
              <button
                onClick={handleDownloadQr}
                disabled={!qrCodeUrl}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#6A3E9D] to-[#8B5CF6] hover:from-[#5a3486] hover:to-[#6A3E9D] text-white rounded-2xl font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
              >
                <FontAwesomeIcon icon={faDownload} /> Download PNG
              </button>
            </div>
            <button
              onClick={() => setQrOpen(false)}
              className="w-full py-3.5 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl font-black transition-all duration-300"
            >
              Close Window
            </button>
          </div>
        </div>
      </Modal>

      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onProductAdded={() => fetchData(1)} categories={categoryList} dimensions={dimensionList} handleAddNewDimension={handleAddNewDim} newDimensionInput={newDimInput} setNewDimensionInput={setNewDimInput} />

      {selectedProduct && (
        <UpdateProductModal
          isOpen={isUpdateOpen}
          onClose={() => { setIsUpdateOpen(false); setSelectedProduct(null); }}
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
      setIdx(images && images.length > 1 ? 1 : 0); 
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen || !images?.length) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden transition-all">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>
      
      <button onClick={onClose} className="absolute top-8 right-8 z-[100000] bg-white/10 hover:bg-red-500 hover:rotate-90 text-white w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xl border border-white/20 shadow-2xl">
        <FontAwesomeIcon icon={faTimes} size="xl" />
      </button>

      <div className="relative w-full max-w-6xl px-4 flex items-center justify-center">
        <button onClick={() => setIdx(i => i === 0 ? images.length - 1 : i - 1)} className="absolute left-2 md:left-10 text-white/50 hover:text-white hover:scale-125 transition-all z-50 p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md">
          <FontAwesomeIcon icon={faChevronLeft} size="2xl" />
        </button>
        
        <div className="relative flex items-center justify-center w-full h-[85vh]">
          <img key={idx} src={images[idx]} className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-2xl animate-in zoom-in slide-in-from-bottom-5 duration-500 ease-out" alt="Product View" />
          <div className="absolute -z-10 w-2/3 h-2/3 bg-[#6A3E9D]/20 blur-[100px] rounded-full mix-blend-screen"></div>
        </div>

        <button onClick={() => setIdx(i => i === images.length - 1 ? 0 : i + 1)} className="absolute right-2 md:right-10 text-white/50 hover:text-white hover:scale-125 transition-all z-50 p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md">
          <FontAwesomeIcon icon={faChevronRight} size="2xl" />
        </button>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-4 animate-in slide-in-from-bottom-5 duration-700">
        <div className="flex gap-2.5 items-center bg-white/10 backdrop-blur-xl px-5 py-3 rounded-full border border-white/20 shadow-2xl">
          {images.map((_, i) => (
            <div key={i} className={`h-2 transition-all duration-500 rounded-full cursor-pointer hover:bg-white ${i === idx ? 'w-10 bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'w-2 bg-white/40'}`} onClick={() => setIdx(i)} />
          ))}
        </div>
        <span className="text-white font-black text-[12px] tracking-[0.4em] uppercase bg-black/30 px-4 py-1.5 rounded-full border border-white/10">{idx + 1} <span className="mx-2 text-white/30">/</span> {images.length}</span>
      </div>
    </div>
  );
};

export default ViewProducts;