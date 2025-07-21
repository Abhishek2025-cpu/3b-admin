import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ManageOtherProducts = () => {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    productName: '',
    modelNo: '',
    details: '',
    size: '',
    pieces: '',
    companyIds: [],
    images: [],
    materialImages: [],
    materialNames: [],
    materialPrices: [],
    materialDiscounts: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/get');
        if (catRes.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
          setSelectedId(catRes.data[0]._id);
        }

        const compRes = await axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/company/get-company');
        if (Array.isArray(compRes.data)) {
          setCompanies(compRes.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (companyId) => {
    setFormData(prev => {
      const exists = prev.companyIds.includes(companyId);
      const updated = exists
        ? prev.companyIds.filter(id => id !== companyId)
        : [...prev.companyIds, companyId];
      return { ...prev, companyIds: updated };
    });
  };

  const handleFileChange = (e, key) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, [key]: [...prev[key], ...files] }));
  };

  const removeImage = (index, key) => {
    setFormData(prev => {
      const updated = [...prev[key]];
      updated.splice(index, 1);
      return { ...prev, [key]: updated };
    });
  };

  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materialNames: [...prev.materialNames, ''],
      materialPrices: [...prev.materialPrices, ''],
      materialDiscounts: [...prev.materialDiscounts, ''],
      materialImages: [...prev.materialImages, null],
    }));
  };

  const handleMaterialChange = (index, key, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [key]: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('productName', formData.productName);
    fd.append('modelNo', formData.modelNo);
    fd.append('details', formData.details);
    fd.append('size', formData.size);
    fd.append('pieces', formData.pieces);

    formData.companyIds.forEach(id => fd.append('companyIds', id));
    formData.images.forEach(file => fd.append('images', file));
    formData.materialImages.forEach(file => file && fd.append('materialImages', file));
    formData.materialNames.forEach(name => fd.append('materialNames[]', name));
    formData.materialPrices.forEach(price => fd.append('materialPrices[]', price));
    formData.materialDiscounts.forEach(discount => fd.append('materialDiscounts[]', discount));

    try {
      await axios.post(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/${selectedId}/products`, fd);
      toast.success('Product added successfully!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
      toast.error('Error adding product.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <Toaster position="top-right" />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <label style={{ fontWeight: '600' }}>Select Category:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '15px' }}
        >
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <button
          onClick={() => setShowForm(prev => !prev)}
          style={{ padding: '8px 16px', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {showForm ? 'Hide Form' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input name="productName" placeholder="Product Name" onChange={handleInputChange} required />
          <input name="modelNo" placeholder="Model No" onChange={handleInputChange} required />
          <input name="details" placeholder="Details" onChange={handleInputChange} required />
          <input name="size" placeholder="Size" onChange={handleInputChange} />
          <input name="pieces" placeholder="Pieces" type="number" onChange={handleInputChange} />

          <label style={{ marginTop: '10px' }}>Select Companies:</label>
          {companies.map(c => (
            <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.companyIds.includes(c._id)}
                onChange={() => handleCheckboxChange(c._id)}
              />
              {c.name}
            </label>
          ))}

          <label>Product Images:</label>
          <input type="file" multiple onChange={(e) => handleFileChange(e, 'images')} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {formData.images.map((file, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(file)} alt="preview" width={80} height={80} style={{ borderRadius: '6px' }} />
                <span onClick={() => removeImage(i, 'images')} style={{ position: 'absolute', top: 0, right: 0, cursor: 'pointer', backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '0 6px' }}>x</span>
              </div>
            ))}
          </div>

          <hr />
          <label>Materials:</label>
          {formData.materialNames.map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input placeholder="Material Name" value={formData.materialNames[i]} onChange={(e) => handleMaterialChange(i, 'materialNames', e.target.value)} />
              <input type="number" placeholder="Price" value={formData.materialPrices[i]} onChange={(e) => handleMaterialChange(i, 'materialPrices', e.target.value)} />
              <input type="number" placeholder="Discount" value={formData.materialDiscounts[i]} onChange={(e) => handleMaterialChange(i, 'materialDiscounts', e.target.value)} />
              <input type="file" onChange={(e) => handleMaterialChange(i, 'materialImages', e.target.files[0])} />
              {formData.materialImages[i] && (
                <img src={URL.createObjectURL(formData.materialImages[i])} alt="material preview" width={60} height={60} style={{ borderRadius: '4px' }} />
              )}
            </div>
          ))}

          <button type="button" onClick={handleAddMaterial} style={{ backgroundColor: '#6f42c1', color: 'white', padding: '8px 12px', borderRadius: '6px', width: 'fit-content' }}>+ Add Material</button>

          <button
            type="submit"
            style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
          >
            Submit Product
          </button>
        </form>
      )}
    </div>
  );
};

export default ManageOtherProducts;
