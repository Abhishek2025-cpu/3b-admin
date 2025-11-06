import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select name={name} value={value} onChange={onChange} required className="p-2 border rounded-xl w-full bg-white">
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
    itemNo: '',
    length: '9.5 Feet',
    noOfSticks: '',
    noOfBoxes: '', 
    helperId: '',
    operatorId: '',
    shift: '',
    company: '',
    machineNumber: '',
    productImage: null,
  });

  const [helpers, setHelpers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees');
        const data = await res.json();

        // Now store _id for server, show name + eid for users
        setHelpers(data.filter(e => e.role === 'Helper').map(e => ({ value: e._id, label: `${e.name} (${e.eid})` })));
        setOperators(data.filter(e => e.role === 'Operator').map(e => ({ value: e._id, label: `${e.name} (${e.eid})` })));
      } catch (error) {
        toast.error('Failed to load staff list.');
        console.error('Error loading staff:', error);
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all');
        const data = await res.json();
        const productOptions = data.products.map(p => ({ value: p.name, label: p.name }));
        const newProductMap = new Map(data.products.map(p => [p.name, p.totalPiecesPerBox]));
        setProducts(productOptions);
        setProductMap(newProductMap);
      } catch (err) {
        toast.error('Failed to load product list.');
        console.error('Failed to load products:', err);
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
    setFormData(prev => ({
      ...prev,
      itemNo: value,
      noOfSticks: productMap.get(value) || ''
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, productImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, productImage: null }));
    setImagePreview('');
    document.getElementById('productImageInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.noOfBoxes <= 0) {
      toast.error('Number of boxes must be a positive number.');
      return;
    }
    setIsLoading(true);

    const submissionData = new FormData();
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/add-items', {
        method: 'POST',
        body: submissionData,
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(`Successfully created item with ${responseData.boxes.length} boxes!`);
        e.target.reset();
        setFormData({
          itemNo: '', length: '9.5 Feet', noOfSticks: '', noOfBoxes: '', helperId: '',
          operatorId: '', shift: '', company: '', machineNumber: '', productImage: null,
        });
        removeImage();
      } else {
        toast.error(responseData.error || 'An unknown error occurred.');
      }
    } catch (err) {
      toast.error('Submission failed. Please check your connection.');
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl mx-auto mt-5">
      <ToastContainer position="top-right" autoClose={5000} />

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <SelectInput name="itemNo" value={formData.itemNo} onChange={handleItemChange} options={products} placeholder="Select Item" />
          <input type="text" name="length" value={formData.length} readOnly className="p-2 border rounded-xl w-full bg-gray-100" />
          <input type="text" name="noOfSticks" value={formData.noOfSticks} readOnly placeholder="No of Pieces" className="p-2 border rounded-xl w-full bg-gray-100" />
          <SelectInput name="helperId" value={formData.helperId} onChange={handleChange} options={helpers} placeholder="Select Helper" />
          <SelectInput name="operatorId" value={formData.operatorId} onChange={handleChange} options={operators} placeholder="Select Operator" />
          <select name="shift" value={formData.shift} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white">
            <option value="">Select Shift</option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>

          <input
            type="number"
            name="noOfBoxes"
            value={formData.noOfBoxes}
            onChange={handleChange}
            placeholder="No of Boxes"
            required
            min="1"
            className="p-2 border rounded-xl w-full"
          />

          {/* Machine Number Dropdown */}
          <select name="machineNumber" value={formData.machineNumber} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white">
            <option value="">Select Machine Number</option>
            {[...Array(9)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>

          <select name="company" value={formData.company} onChange={handleChange} required className="py-1 px-2 border rounded-xl w-full bg-white">
            <option value="">Select Company</option>
            <option value="B">B</option>
            <option value="BI">BI</option>
          </select>

          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <input type="file" id="productImageInput" name="productImage" onChange={handleImageChange} accept="image/*" required className="p-2 border rounded-xl w-full" />
          </div>
        </div>

        {imagePreview && (
          <div className="mt-2 flex items-center gap-2">
            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border" />
            <button type="button" onClick={removeImage} className="text-red-600 font-bold text-2xl">×</button>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading} 
          className="bg-[#6F42C1] hover:bg-[#5a37a0] text-white px-6 py-3 rounded-xl w-full font-semibold disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Spinner />
              Submitting...
            </>
          ) : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default AddItem;
