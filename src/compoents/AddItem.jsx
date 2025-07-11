// src/components/AddItem.jsx
import React, { useState, useEffect } from 'react';

// A reusable input component for cleaner code
const SelectInput = ({ name, value, onChange, options, placeholder }) => (
  <select name={name} value={value} onChange={onChange} required className="p-2 border rounded-xl w-full bg-white">
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

function AddItem() {
  const [formData, setFormData] = useState({
    itemNo: '',
    length: '9.5 Feet',
    noOfSticks: '',
    helperEid: '',
    operatorEid: '',
    shift: '',
    company: '',
    productImage: null,
  });
  const [helpers, setHelpers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState(new Map());
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });

  // Fetch staff and products on component mount
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/staff/get-employees');
        const data = await res.json();
        setHelpers(data.filter(e => e.role === 'Helper').map(e => ({ value: e.eid, label: `${e.name} (${e.eid})` })));
        setOperators(data.filter(e => e.role === 'Operator').map(e => ({ value: e.eid, label: `${e.name} (${e.eid})` })));
      } catch (error) {
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
    // Reset the file input visually
    document.getElementById('productImageInput').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: '', type: '' });

    const submissionData = new FormData();
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/add-items', {
        method: 'POST',
        body: submissionData,
      });

      if (response.ok) {
        setStatus({ message: 'Item added successfully!', type: 'success' });
        e.target.reset();
        removeImage();
      } else {
        const errorText = await response.text();
        setStatus({ message: `Error: ${errorText}`, type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Submission error. Please check the console.', type: 'error' });
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl mx-auto mt-5">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <SelectInput name="itemNo" value={formData.itemNo} onChange={handleItemChange} options={products} placeholder="Select Item" />
          <input type="text" name="length" value={formData.length} readOnly className="p-2 border rounded-xl w-full bg-gray-100" />
          <input type="text" name="noOfSticks" value={formData.noOfSticks} readOnly placeholder="No of Pieces" className="p-2 border rounded-xl w-full bg-gray-100" />
          <SelectInput name="helperEid" value={formData.helperEid} onChange={handleChange} options={helpers} placeholder="Select Helper" />
          <SelectInput name="operatorEid" value={formData.operatorEid} onChange={handleChange} options={operators} placeholder="Select Operator" />
          <select name="shift" value={formData.shift} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white">
            <option value="">Select Shift</option>
            <option value="Day">Day</option>
            <option value="Night">Night</option>
          </select>
          <select name="company" value={formData.company} onChange={handleChange} required className="p-2 border rounded-xl w-full bg-white">
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

        <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl w-full font-semibold disabled:bg-blue-400">
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {status.message && (
        <div className={`mt-6 text-center font-semibold ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}

export default AddItem;