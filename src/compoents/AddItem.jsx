import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Components ---

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 z-[10000] bg-white hover:bg-red-50 text-gray-800 hover:text-red-500 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg border border-gray-100 transform hover:rotate-90 hover:scale-110"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div 
        className="relative max-w-5xl w-full flex justify-center transform transition-all duration-500 scale-100" 
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-pop-in"
        />
      </div>
    </div>
  );
};

// --- Searchable Select Component (STRICT SORTING APPLIED HERE) ---
const SearchableSelect = ({ label, options, value, onChange, placeholder, onSearch, isSearching }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  // --- HAR BAAR RENDER PE SORT HOGA (ASCENDING ORDER) ---
  const displayedOptions = options
    .filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="group relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
        {label}
      </label>
      
      <div 
        className={`relative flex items-center w-full p-3.5 border rounded-xl cursor-pointer transition-all duration-300 shadow-sm hover:border-indigo-400 ${isOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500 bg-white' : 'border-gray-200 bg-gray-50'}`}
        onClick={() => {
            setIsOpen(!isOpen);
            if(!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <span className={`font-medium truncate pr-6 ${!value ? 'text-gray-400' : 'text-gray-700'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <svg className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-pop-in">
          <div className="p-2 bg-gray-50 border-b border-gray-100">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full p-2.5 pl-9 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="Search product..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute left-3 top-3">
                    {isSearching ? (
                        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>
          </div>

          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {displayedOptions.length > 0 ? (
              displayedOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-4 py-3 text-sm cursor-pointer transition-all flex items-center justify-between
                    ${value === opt.value ? 'bg-indigo-600 text-white font-bold' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center">
                <svg className="h-8 w-8 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No products found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const SelectInput = ({ name, value, onChange, options, placeholder, label }) => (
  <div className="group relative">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        required 
        className="w-full p-3.5 pr-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300 appearance-none shadow-sm hover:border-indigo-300"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-focus-within:text-indigo-600 transition-colors">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const TextInput = ({ name, value, onChange, placeholder, label, readOnly = false, type = "text", min }) => (
  <div className="group">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1 group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <input 
      type={type}
      name={name} 
      value={value} 
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      min={min}
      required={!readOnly}
      className={`w-full p-3.5 border rounded-xl font-medium outline-none transition-all duration-300 shadow-sm
        ${readOnly 
          ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
          : 'bg-gray-50 text-gray-700 border-gray-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300'
        }`} 
    />
  </div>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

function AddItem() {
  const [formData, setFormData] = useState({
    itemNo: '', length: '9.5 Feet', noOfSticks: '', noOfBoxes: '',
    helperId: '', operatorId: '', shift: '', mixtureId: '',
    company: '', machineNumber: '', mixtureMachine: '', image: '', 
  });

  const [helpers, setHelpers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [mixtures, setMixtures] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetailsMap, setProductDetailsMap] = useState(new Map());
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees');
        const data = await res.json();
        
        const processStaffByRole = (roleName) => {
          return data
            .filter(e => e.role && Array.isArray(e.role) && e.role.includes(roleName))
            .map(e => ({
              value: e._id,
              label: `${e.name} (${e.eid || 'N/A'})`
            }));
        };

        setHelpers(processStaffByRole('Helper'));
        setOperators(processStaffByRole('Operator'));
        setMixtures(processStaffByRole('Mixture'));
      } catch (error) {
        toast.error('Failed to load staff list.');
      }
    }

    async function fetchInitialProducts() {
      try {
        const res = await fetch('https://threeb-1067354145699.asia-south1.run.app/api/products/all?all=true');
        const data = await res.json();
        const initialProducts = data.products || [];
        setProducts(initialProducts.map(p => ({ value: p.name, label: p.name })));
        setProductDetailsMap(new Map(initialProducts.map(p => [p.name, p])));
      } catch (err) {
        console.error('Failed to load initial products.');
      }
    }

    fetchStaff();
    fetchInitialProducts();
  }, []);

  const handleItemSearch = useCallback((searchTerm) => {
    if (!searchTerm) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/search?name=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        const foundProducts = Array.isArray(data) ? data : (data.products || []);

        if (foundProducts.length > 0) {
            setProducts(prev => {
                const existingNames = new Set(prev.map(p => p.value));
                const newItems = foundProducts
                    .filter(p => !existingNames.has(p.name))
                    .map(p => ({ value: p.name, label: p.name }));
                return [...prev, ...newItems];
            });

            setProductDetailsMap(prev => {
                const newMap = new Map(prev);
                foundProducts.forEach(p => newMap.set(p.name, p));
                return newMap;
            });
        }
      } catch (err) {
        console.error('Search API error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemSelect = (val) => {
    const selectedProduct = productDetailsMap.get(val);
    const imageUrl = selectedProduct?.images?.[1]?.url || selectedProduct?.images?.[0]?.url || '';
    
    setFormData(prev => ({
      ...prev,
      itemNo: val,
      noOfSticks: selectedProduct ? (selectedProduct.totalPiecesPerBox || '') : '',
      image: imageUrl, 
    }));
    setImagePreview(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.noOfBoxes <= 0) return toast.error('Enter valid box quantity.');
    if (!formData.itemNo) return toast.error('Select an item.');
    
    setIsLoading(true);
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/add-items', {
        method: 'POST',
        body: submissionData,
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Production entry added successfully!`);
        setFormData({
          itemNo: '', length: '9.5 Feet', noOfSticks: '', noOfBoxes: '', helperId: '',
          operatorId: '', shift: '', company: '', machineNumber: '', mixtureId: '', 
          mixtureMachine: '', image: '',
        });
        setImagePreview('');
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch (err) {
      toast.error('Connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.2s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #818cf8; }
      `}</style>
      
      <ToastContainer position="top-center" theme="colored" autoClose={3000} />

      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imagePreview} 
      />

      <div className="bg-white shadow-[0_10px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden w-full max-w-4xl border border-gray-100 animate-slide-up">
        
        <div className="relative bg-white px-8 pt-10 pb-6 text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
                Production Entry
            </h2>
            <p className="text-gray-500 font-medium">Manage and track your daily production output</p>
        </div>

        <div className="p-8 md:p-10 pt-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              
              <SearchableSelect 
                label="Select Item *"
                options={products}
                value={formData.itemNo}
                onChange={handleItemSelect}
                onSearch={handleItemSearch}
                isSearching={isSearching}
                placeholder="Type to search (e.g. 3B 157)"
              />

              <TextInput label="Length" name="length" value={formData.length} readOnly={true} />
              <TextInput label="Sticks per Box" name="noOfSticks" value={formData.noOfSticks} readOnly={true} placeholder="Sticks count" />
              <SelectInput label="Mixture Staff *" name="mixtureId" value={formData.mixtureId} onChange={handleChange} options={mixtures} placeholder="Select Staff..." />
              <SelectInput label="Helper Staff *" name="helperId" value={formData.helperId} onChange={handleChange} options={helpers} placeholder="Select Staff..." />
              <SelectInput label="Operator Staff *" name="operatorId" value={formData.operatorId} onChange={handleChange} options={operators} placeholder="Select Staff..." />
              
              <SelectInput 
                label="Shift *"
                name="shift" 
                value={formData.shift} 
                onChange={handleChange} 
                options={[{value: 'Day', label: 'Day Shift'}, {value: 'Night', label: 'Night Shift'}]}
                placeholder="Select Shift..." 
              />

              <TextInput label="Number of Boxes *" name="noOfBoxes" value={formData.noOfBoxes} onChange={handleChange} placeholder="0" type="number" min="1" />
              <SelectInput label="Machine Number *" name="machineNumber" value={formData.machineNumber} onChange={handleChange} options={[...Array(9)].map((_, i) => ({ value: i+1, label: `Machine ${i+1}` }))} placeholder="Select Machine..." />
              <SelectInput label="Company *" name="company" value={formData.company} onChange={handleChange} options={[{value: 'B', label: 'B'}, {value: 'BI', label: 'BI'}]} placeholder="Select Company..." />
            </div>
            
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-300">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">Product Visualization</label>
              {imagePreview ? (
                <div className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white" onClick={() => setIsModalOpen(true)}>
                  <img src={imagePreview} alt="Product" className="w-full h-64 object-contain p-4 transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/20 transition-all duration-300 flex items-center justify-center">
                     <span className="bg-white/95 backdrop-blur text-indigo-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                       Click to Expand
                     </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400 group hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-medium">Select a product to view image</p>
                </div>
              )}
            </div>

            <div className="pt-2">
                <button type="submit" disabled={isLoading} className={`w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-500/30 transform transition-all duration-300 flex items-center justify-center gap-3 ${isLoading ? 'bg-gray-400 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 hover:-translate-y-1 hover:shadow-indigo-500/50 active:scale-[0.98]'}`}>
                {isLoading ? <><Spinner /> Processing Entry...</> : <><span className="tracking-wide">SUBMIT ENTRY</span></>}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddItem;