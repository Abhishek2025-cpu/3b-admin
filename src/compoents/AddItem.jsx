import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-5xl font-bold hover:text-gray-300 transition-colors"
        aria-label="Close image view"
      >
        &times;
      </button>

      <div
        className="relative p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Product Full View"
          className="max-w-[90vw] max-h-[85vh] object-contain"
        />
      </div>
    </div>
  );
};

const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select name={name} value={value} onChange={onChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
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
    company: '', machineNumber: '', mixtureMachine: '', 
    image: '', 
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
                if (e.roles && Array.isArray(e.roles)) {
                  return e.roles.some(r => r.role === roleName);
                }
                return false;
              }).map(e => {
                let displayEid = e.eid;
                if (!displayEid && e.roles) {
                  const roleObj = e.roles.find(r => r.role === roleName);
                  displayEid = roleObj ? roleObj.eid : '';
                }
                return { 
                  value: e._id, 
                  label: `${e.name} (${displayEid || 'N/A'})` 
                };
              });
            };

            setHelpers(processStaffByRole('Helper'));
            setOperators(processStaffByRole('Operator'));
            setMixtures(processStaffByRole('Mixture'));
            
        } catch (error) {
            console.error("Staff fetch error:", error);
            toast.error('Failed to load staff list.');
        }
    }

    async function fetchProducts() {
        try {
            const res = await fetch('https://threeb-1067354145699.asia-south1.run.app/api/products/all?all=true');
            const data = await res.json();
            const productOptions = data.products.map(p => ({ value: p.name, label: p.name }));
            const newProductDetailsMap = new Map(data.products.map(p => [p.name, p]));
            setProducts(productOptions);
            setProductDetailsMap(newProductDetailsMap);
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
    
    let imageUrl = '';
    if (selectedProduct?.images?.length > 0) {
      imageUrl = selectedProduct.images[0].url;
    }

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
    if (formData.noOfBoxes <= 0) {
      toast.error('Number of boxes must be a positive number.');
      return;
    }
    
    if (!formData.itemNo || !formData.image) {
        toast.error('Please select an item with an image.');
        return;
    }
    
    setIsLoading(true);

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key]);
    });

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/add-items', {
        method: 'POST',
        body: submissionData,
      });
      
      const responseData = await response.json();

      if (response.ok) {
        toast.success(`Successfully created!`);
        setFormData({
            itemNo: '', length: '9.5 Feet', noOfSticks: '', noOfBoxes: '', helperId: '',
            operatorId: '', shift: '', company: '', machineNumber: '', mixtureId: '', 
            mixtureMachine: '', image: '',
        });
        setImagePreview('');
        e.target.reset();
      } else {
        toast.error(responseData.error || 'An unknown error occurred.');
      }
    } catch (err) {
      toast.error('Submission failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-4xl mx-auto mt-5 border border-gray-100">
      <ToastContainer position="top-right" autoClose={5000} />

      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageUrl={imagePreview} 
      />

      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800 border-b pb-4">
        Add New Production Item
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
          
          {/* Item Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Select Item *</label>
            <SelectInput name="itemNo" value={formData.itemNo} onChange={handleItemChange} options={products} placeholder="Choose Product" />
          </div>

          {/* Length (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Length</label>
            <input type="text" name="length" value={formData.length} readOnly className="p-2 border rounded-xl w-full bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          {/* No of Sticks (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Sticks per Box</label>
            <input type="text" name="noOfSticks" value={formData.noOfSticks} readOnly placeholder="Auto-filled" className="p-2 border rounded-xl w-full bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          {/* Mixture Staff */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Mixture Staff *</label>
            <SelectInput name="mixtureId" value={formData.mixtureId} onChange={handleChange} options={mixtures} placeholder="Select Mixture" />
          </div>

          {/* Helper Staff */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Helper Staff *</label>
            <SelectInput name="helperId" value={formData.helperId} onChange={handleChange} options={helpers} placeholder="Select Helper" />
          </div>

          {/* Operator Staff */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Operator Staff *</label>
            <SelectInput name="operatorId" value={formData.operatorId} onChange={handleChange} options={operators} placeholder="Select Operator" />
          </div>

          {/* Shift Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Shift *</label>
            <select name="shift" value={formData.shift} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Shift</option>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
            </select>
          </div>

          {/* No of Boxes */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Number of Boxes *</label>
            <input type="number" name="noOfBoxes" value={formData.noOfBoxes} onChange={handleChange} placeholder="Enter quantity" required min="1" className="p-2 border rounded-xl w-full focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>

          {/* Machine Number */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Machine Number *</label>
            <select name="machineNumber" value={formData.machineNumber} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Machine</option>
              {[...Array(9)].map((_, i) => (<option key={i+1} value={i+1}>{i+1}</option>))}
            </select>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700 ml-1">Company *</label>
            <select name="company" value={formData.company} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="">Select Company</option>
              <option value="B">B</option>
              <option value="BI">BI</option>
            </select>
          </div>
        </div>
        
        {/* Image Preview Section */}
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Product Preview</label>
          {imagePreview ? (
            <div className="relative group">
              <img 
                src={imagePreview} 
                alt="Selected product" 
                className="w-full h-64 object-contain rounded-xl border-2 border-gray-200 cursor-pointer group-hover:border-purple-400 transition-all shadow-sm"
                onClick={() => setIsModalOpen(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-xl pointer-events-none">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md">Click to expand</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-col justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 bg-gray-50">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p>Image will appear here after item selection</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-[#6F42C1] hover:bg-[#5a37a0] text-white px-6 py-4 rounded-xl w-full font-bold text-lg shadow-lg hover:shadow-purple-200 transition-all disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center mt-8"
        >
          {isLoading ? ( <> <Spinner /> Submitting... </> ) : 'Submit Production Entry'}
        </button>
      </form>
    </div>
  );
}

export default AddItem;