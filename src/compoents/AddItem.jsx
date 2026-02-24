import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      className="fixed inset-0 bg-white/95 flex justify-center items-center z-[9999] p-4 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Close Button - Updated for White Background */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 z-[10000] bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center transition-all border border-gray-300 shadow-sm"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative max-w-5xl w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in duration-300"
        />
      </div>
    </div>
  );
};

const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select 
    name={name} 
    value={value} 
    onChange={onChange} 
    required 
    className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none"
  >
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees');
        const data = await res.json();
        const processStaffByRole = (roleName) => {
          return data.filter(e => {
            if (e.role === roleName) return true;
            if (e.roles && Array.isArray(e.roles)) return e.roles.some(r => r.role === roleName);
            return false;
          }).map(e => {
            let displayEid = e.eid;
            if (!displayEid && e.roles) {
              const roleObj = e.roles.find(r => r.role === roleName);
              displayEid = roleObj ? roleObj.eid : '';
            }
            return { value: e._id, label: `${e.name} (${displayEid || 'N/A'})` };
          });
        };
        setHelpers(processStaffByRole('Helper'));
        setOperators(processStaffByRole('Operator'));
        setMixtures(processStaffByRole('Mixture'));
      } catch (error) {
        toast.error('Failed to load staff list.');
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch('https://threeb-1067354145699.asia-south1.run.app/api/products/all?all=true');
        const data = await res.json();
        setProducts(data.products.map(p => ({ value: p.name, label: p.name })));
        setProductDetailsMap(new Map(data.products.map(p => [p.name, p])));
      } catch (err) {
        toast.error('Failed to load product list.');
      }
    }

    fetchStaff();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { value } = e.target;
    const selectedProduct = productDetailsMap.get(value);
    const imageUrl = selectedProduct?.images?.[0]?.url || '';
    setFormData(prev => ({
      ...prev,
      itemNo: value,
      noOfSticks: selectedProduct ? selectedProduct.totalPiecesPerBox : '',
      image: imageUrl, 
    }));
    setImagePreview(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.noOfBoxes <= 0) return toast.error('Enter valid box quantity.');
    if (!formData.itemNo || !formData.image) return toast.error('Select an item with image.');
    
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
        toast.success(`Success!`);
        setFormData({
          itemNo: '', length: '9.5 Feet', noOfSticks: '', noOfBoxes: '', helperId: '',
          operatorId: '', shift: '', company: '', machineNumber: '', mixtureId: '', 
          mixtureMachine: '', image: '',
        });
        setImagePreview('');
        e.target.reset();
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
    <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-4xl mx-auto mt-5 border border-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />

      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imagePreview} 
      />

      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800 border-b pb-4">
        Production Entry
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Select Item *</label>
            <SelectInput name="itemNo" value={formData.itemNo} onChange={handleItemChange} options={products} placeholder="Choose Product" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Length</label>
            <input type="text" name="length" value={formData.length} readOnly className="p-2 border rounded-xl w-full bg-gray-50 text-gray-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Sticks per Box</label>
            <input type="text" name="noOfSticks" value={formData.noOfSticks} readOnly className="p-2 border rounded-xl w-full bg-gray-50 text-gray-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Mixture Staff *</label>
            <SelectInput name="mixtureId" value={formData.mixtureId} onChange={handleChange} options={mixtures} placeholder="Select Mixture" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Helper Staff *</label>
            <SelectInput name="helperId" value={formData.helperId} onChange={handleChange} options={helpers} placeholder="Select Helper" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Operator Staff *</label>
            <SelectInput name="operatorId" value={formData.operatorId} onChange={handleChange} options={operators} placeholder="Select Operator" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Shift *</label>
            <select name="shift" value={formData.shift} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Shift</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Number of Boxes *</label>
            <input type="number" name="noOfBoxes" value={formData.noOfBoxes} onChange={handleChange} placeholder="Quantity" required min="1" className="p-2 border rounded-xl w-full focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Machine Number *</label>
            <select name="machineNumber" value={formData.machineNumber} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Machine</option>
              {[...Array(9)].map((_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Company *</label>
            <select name="company" value={formData.company} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Company</option>
              <option value="B">B</option>
              <option value="BI">BI</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Product Preview (Click to Zoom)</label>
          {imagePreview ? (
            <div className="relative cursor-pointer group" onClick={() => setIsModalOpen(true)}>
              <img 
                src={imagePreview} 
                alt="Product" 
                className="w-full h-64 object-contain rounded-xl border-2 border-gray-200 transition-all group-hover:border-purple-400 group-hover:shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all rounded-xl">
                 <span className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                   </svg>
                   Full View
                 </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-400">
              <p>Selection preview</p>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-[#6F42C1] hover:bg-[#5a37a0] text-white px-6 py-4 rounded-xl w-full font-bold text-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center mt-8"
        >
          {isLoading ? <><Spinner /> Submitting...</> : 'Submit Production Entry'}
        </button>
      </form>
    </div>
  );
}

export default AddItem;