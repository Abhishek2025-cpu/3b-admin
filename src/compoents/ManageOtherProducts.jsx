import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ManageOtherProducts = () => {
  // Add state for add company form
  // (removed duplicate declaration)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  // For update modal (not implemented yet)
  // const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
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

  // Add state for add company form
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', logo: null });

  // Add company handler
  const handleAddCompany = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', newCompany.name);
    if (newCompany.logo) fd.append('logo', newCompany.logo);
    try {
      const res = await axios.post('https://threebapi-1067354145699.asia-south1.run.app/api/company/add-company', fd);
      if (res.data && res.data._id) {
        setCompanies(prev => [...prev, res.data]);
        toast.success('Company added!');
        setShowAddCompany(false);
        setNewCompany({ name: '', logo: null });
      } else {
        toast.error('Failed to add company');
      }
    } catch (err) {
      toast.error('Error adding company');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/get');
        if (catRes.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
          setSelectedId(catRes.data[0]._id);
          setCategoryName(catRes.data[0].name);
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

  useEffect(() => {
    if (!selectedId) return;
    const fetchProducts = async () => {
      try {
        const prodRes = await axios.get(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/product/${selectedId}`);
        if (Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        } else if (prodRes.data && prodRes.data.products) {
          setProducts(prodRes.data.products);
        }
        // Find category name
        const cat = categories.find(c => c._id === selectedId);
        setCategoryName(cat ? cat.name : '');
        setCurrentPage(1); // Reset to first page on category change
      } catch (err) {
        setProducts([]);
        setCategoryName('');
      }
    };
    fetchProducts();
  }, [selectedId, categories]);

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

  // Toggle availability
  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await axios.patch(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/product/${productId}/availability`, { available: !currentStatus });
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, available: !currentStatus } : p));
      toast.success('Availability updated');
    } catch {
      toast.error('Failed to update availability');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/product/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // Show all products, toggle is static
  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

      {/* Product Form - now above table */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
          {/* ...existing code... */}
          <input name="productName" placeholder="Product Name" onChange={handleInputChange} required />
          <input name="modelNo" placeholder="Model No" onChange={handleInputChange} required />
          <input name="details" placeholder="Details" onChange={handleInputChange} required />
          <input name="size" placeholder="Size" onChange={handleInputChange} />
          <input name="pieces" placeholder="Pieces" type="number" onChange={handleInputChange} />

          <label style={{ marginTop: '10px' }}>Select Companies:</label>
          {companies.map(c => (
            <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              {/* Toggle switch for company selection */}
              <span style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                <input
                  type="checkbox"
                  checked={formData.companyIds.includes(c._id)}
                  onChange={() => handleCheckboxChange(c._id)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: formData.companyIds.includes(c._id) ? '#6f42c1' : '#ccc', borderRadius: '22px', transition: 'background 0.2s' }}></span>
                <span style={{ position: 'absolute', left: formData.companyIds.includes(c._id) ? '20px' : '2px', top: '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}></span>
              </span>
              {c.logo && c.logo.url && (
                <img src={c.logo.url} alt={c.name} width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
              )}
              <span>{c.name}</span>
            </label>
          ))}

          {/* Add New Company Button and Form */}
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
            <button type="button" onClick={() => setShowAddCompany(prev => !prev)} style={{ backgroundColor: '#28a745', color: 'white', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              {showAddCompany ? 'Cancel' : '+ Add New Company'}
            </button>
            {showAddCompany && (
              <form onSubmit={handleAddCompany} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                <input name="companyName" placeholder="Company Name" value={newCompany.name} onChange={e => setNewCompany(prev => ({ ...prev, name: e.target.value }))} required />
                <input type="file" accept="image/*" onChange={e => setNewCompany(prev => ({ ...prev, logo: e.target.files[0] }))} required />
                {newCompany.logo && (
                  <img src={URL.createObjectURL(newCompany.logo)} alt="logo preview" width={60} height={60} style={{ borderRadius: '50%' }} />
                )}
                <button type="submit" style={{ backgroundColor: '#6f42c1', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>Add Company</button>
              </form>
            )}
          </div>


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

      {/* Products Table */}
      <div style={{ marginBottom: '30px', maxHeight: '400px', overflow: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '10px', color: '#6f42c1' }}>Products for Category: {categoryName}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '1400px', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f3f3f3' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Model No</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Images</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Size</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Details</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Pieces</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Companies</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Materials</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Availability</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Created At</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr><td colSpan={11} style={{ textAlign: 'center', padding: '12px' }}>No products found.</td></tr>
              ) : (
                paginatedProducts.map((prod, idx) => (
                  <tr key={prod._id || idx}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.productName || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.modelNo || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>
                      {Array.isArray(prod.images) && prod.images.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {prod.images.map(img => (
                            <img key={img._id || img.id} src={img.url} alt="product" width={40} height={40} style={{ borderRadius: '4px', objectFit: 'cover', border: '1px solid #eee' }} />
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.size || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.details || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.pieces || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px' }}>
                      {Array.isArray(prod.companies) && prod.companies.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {prod.companies.map(comp => (
                            <div key={comp._id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {comp.logo && comp.logo.url && (
                                <img src={comp.logo.url} alt={comp.name} width={24} height={24} style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} />
                              )}
                              <span>{comp.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '180px' }}>
                      {Array.isArray(prod.materials) && prod.materials.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {prod.materials.map((mat, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {mat.materialImage && mat.materialImage.url && (
                                <img src={mat.materialImage.url} alt={mat.materialName} width={28} height={28} style={{ borderRadius: '4px', objectFit: 'cover', border: '1px solid #eee' }} />
                              )}
                              <span style={{ fontWeight: 'bold' }}>{mat.materialName}</span>
                              <span>₹{mat.price}</span>
                              <span>Discount: {mat.discount}%</span>
                              <span>Final: ₹{mat.discountedPrice}</span>
                            </div>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    {/* Static Availability Toggle (Switch) */}
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                          <input type="checkbox" checked={!!prod.available} disabled style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', cursor: 'not-allowed', top: 0, left: 0, right: 0, bottom: 0, background: prod.available ? '#6f42c1' : '#ccc', borderRadius: '22px', transition: 'background 0.2s' }}></span>
                          <span style={{ position: 'absolute', left: prod.available ? '20px' : '2px', top: '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}></span>
                        </span>
                        <span style={{ color: prod.available ? 'green' : 'red', fontWeight: 'bold' }}>{prod.available ? 'Available' : 'Unavailable'}</span>
                      </label>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prod.createdAt ? new Date(prod.createdAt).toLocaleString() : '-'}</td>
                    {/* Actions - icons */}
                    <td style={{ border: '1px solid #ddd', padding: '8px', minWidth: '120px', textAlign: 'center' }}>
                      <span title="Edit" onClick={() => alert('Update not implemented yet')} style={{ marginRight: '16px', cursor: 'pointer', color: '#ffc107', fontSize: '20px', verticalAlign: 'middle' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1.292 1.292-2.121-2.121 1.292-1.292a.5.5 0 0 1 .706 0l1.415 1.415zm-2.121 2.121L4.939 12.504a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l8.442-8.442 2.121 2.121z"/></svg>
                      </span>
                      <span title="Delete" onClick={() => handleDeleteProduct(prod._id)} style={{ cursor: 'pointer', color: '#dc3545', fontSize: '20px', verticalAlign: 'middle' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-7zm-1-1A1.5 1.5 0 0 1 6 3h4a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 10 13H6a1.5 1.5 0 0 1-1.5-1.5v-7zM4.118 4.5A.5.5 0 0 1 4.5 4h7a.5.5 0 0 1 .382.5l.5 8A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5l.5-8z"/></svg>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #6f42c1', background: currentPage === 1 ? '#eee' : '#6f42c1', color: currentPage === 1 ? '#888' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #6f42c1', background: currentPage === totalPages ? '#eee' : '#6f42c1', color: currentPage === totalPages ? '#888' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
        </div>
      </div>

      {/* ...existing code... */}
    </div>
  );
};

export default ManageOtherProducts;
