// src/components/ManageOtherProducts.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// --- Reusable UI Components ---

/**
 * A generic modal component for forms or other content.
 * MODIFIED: Removed the dark background overlay as requested.
 */
const FormModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    // REMOVED: bg-black bg-opacity-60
    <div className="fixed inset-0 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">×</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * NEW: A modal form for adding a new category.
 */
const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setFiles([]);
    }
  }, [isOpen]);

  const handleFileChange = (e) => setFiles(Array.from(e.target.files));
  const removeFile = (indexToRemove) => setFiles(prev => prev.filter((_, index) => index !== indexToRemove));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required.');
    if (files.length === 0) return toast.error('At least one category image is required.');

    const fd = new FormData();
    fd.append('name', name);
    files.forEach(file => fd.append('files', file));

    const addPromise = axios.post('https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/add', fd);

    toast.promise(addPromise, {
      loading: 'Adding new category...',
      success: () => {
        onClose();
        setTimeout(() => onCategoryAdded(), 1000); // Trigger page refresh in parent
        return 'Category added successfully!';
      },
      error: 'Failed to add category.',
    });
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Add New Category">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input id="category-name" type="text" placeholder="e.g., Handles, Locks" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Image(s)</label>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100" />
        </div>
        {files.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700">Preview:</p>
            <div className="flex gap-2 flex-wrap mt-2 p-2 border rounded-lg bg-gray-50">
              {files.map((file, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-24 h-24 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold leading-none">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
          <button type="submit" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg">Add Category</button>
        </div>
      </form>
    </FormModal>
  );
};


const AddProductForm = ({ isOpen, onClose, companies, selectedCategoryId, onProductAdded }) => {
  // This component remains exactly the same.
  const [formData, setFormData] = useState({
    productName: '', modelNo: '', details: '', size: '', pieces: '',
    companyIds: [], images: [], materialImages: [], materialNames: [],
    materialPrices: [], materialDiscounts: [],
  });
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        productName: '', modelNo: '', details: '', size: '', pieces: '',
        companyIds: [], images: [], materialImages: [], materialNames: [],
        materialPrices: [], materialDiscounts: [],
      });
    }
  }, [isOpen]);
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleCheckboxChange = (companyId) => {
    setFormData(prev => ({
      ...prev,
      companyIds: prev.companyIds.includes(companyId)
        ? prev.companyIds.filter(id => id !== companyId)
        : [...prev.companyIds, companyId]
    }));
  };
  const handleFileChange = (e, key) => setFormData(prev => ({ ...prev, [key]: [...prev[key], ...Array.from(e.target.files)] }));
  const removeImage = (index, key) => setFormData(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materialNames: [...prev.materialNames, ''], materialPrices: [...prev.materialPrices, ''],
      materialDiscounts: [...prev.materialDiscounts, ''], materialImages: [...prev.materialImages, null],
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
    const submissionPromise = axios.post(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/${selectedCategoryId}/products`, fd);
    toast.promise(submissionPromise, {
      loading: 'Adding product...',
      success: () => {
        onClose(); // Close the modal
        setTimeout(() => onProductAdded(), 1000); // Trigger page refresh
        return 'Product added successfully!';
      },
      error: (err) => err.response?.data?.message || 'Failed to add product.',
    });
  };
  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Add New Product">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="productName" placeholder="Product Name" value={formData.productName} onChange={handleInputChange} required className="w-full p-2 border rounded-xl" />
                <input name="modelNo" placeholder="Model No" value={formData.modelNo} onChange={handleInputChange} required className="w-full p-2 border rounded-xl" />
                <input name="details" placeholder="Details" value={formData.details} onChange={handleInputChange} required className="w-full p-2 border rounded-xl" />
                <input name="size" placeholder="Size" value={formData.size} onChange={handleInputChange} className="w-full p-2 border rounded-xl" />
                <input name="pieces" placeholder="Pieces" type="number" value={formData.pieces} onChange={handleInputChange} className="w-full p-2 border rounded-xl" />
            </div>
            <div>
                <label className="font-semibold text-gray-700 mb-2 block">Select Companies</label>
                <div className="space-y-2">
                    {companies.map(c => (
                        <label key={c._id} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={formData.companyIds.includes(c._id)} onChange={() => handleCheckboxChange(c._id)} className="h-4 w-4 rounded border-gray-300 text-[#6A3E9D] focus:ring-[#583281]"/>
                            {c.logo?.url && <img src={c.logo.url} alt={c.name} className="w-6 h-6 rounded-full object-cover" />}
                            <span>{c.name}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="font-semibold text-gray-700 mb-2 block">Product Images</label>
                <input type="file" multiple onChange={(e) => handleFileChange(e, 'images')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                <div className="flex gap-2 flex-wrap mt-2">
                    {formData.images.map((file, i) => (
                    <div key={i} className="relative">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-20 h-20 rounded-lg object-cover" />
                        <button type="button" onClick={() => removeImage(i, 'images')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">x</button>
                    </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="font-semibold text-gray-700 mb-2 block">Materials</label>
                <div className="space-y-4">
                    {formData.materialNames.map((_, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg">
                        <input placeholder="Material Name" value={formData.materialNames[i]} onChange={(e) => handleMaterialChange(i, 'materialNames', e.target.value)} className="w-full p-2 border rounded-lg" />
                        <input type="number" placeholder="Price" value={formData.materialPrices[i]} onChange={(e) => handleMaterialChange(i, 'materialPrices', e.target.value)} className="w-full p-2 border rounded-lg" />
                        <input type="number" placeholder="Discount %" value={formData.materialDiscounts[i]} onChange={(e) => handleMaterialChange(i, 'materialDiscounts', e.target.value)} className="w-full p-2 border rounded-lg" />
                        <input type="file" onChange={(e) => handleMaterialChange(i, 'materialImages', e.target.files[0])} className="w-full text-sm self-center" />
                    </div>
                    ))}
                </div>
                <button type="button" onClick={handleAddMaterial} className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">+ Add Material</button>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
                <button type="submit" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg">Submit Product</button>
            </div>
        </form>
    </FormModal>
  );
};


function ManageOtherProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);

  // New state for the category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      setError(null);
      try {
        const [catRes, compRes] = await Promise.all([
          axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/get'),
          axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/company/get-company')
        ]);
        if (catRes.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
          if (catRes.data.length > 0) {
            setSelectedId(catRes.data[0]._id);
          } else {
            setIsLoading(false);
          }
        }
        if (Array.isArray(compRes.data)) {
          setCompanies(compRes.data);
        }
      } catch (err) {
        setError("Failed to load initial data. Please refresh the page.");
        setIsLoading(false);
      } 
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setProducts([]); 
      setIsLoading(false);
      return;
    }
    setExpandedProductId(null);
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const prodRes = await axios.get(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/product/${selectedId}`);
        if (Array.isArray(prodRes.data)) {
          setProducts(prodRes.data);
        } else if (prodRes.data && Array.isArray(prodRes.data.products)) {
          setProducts(prodRes.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError('Failed to fetch products for this category.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [selectedId]); // Removed refetch as we are now reloading the page
  
  // MODIFIED: This function now just reloads the page.
  const handleActionSuccess = () => {
    window.location.reload();
  };

  const handleDeleteProduct = (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const promise = axios.delete(`https://threebapi-1067354145699.asia-south1.run.app/api/other-products/product/${productId}`);
    toast.promise(promise, {
      loading: 'Deleting...',
      success: () => {
        setProducts(prev => prev.filter(p => p._id !== productId));
        return 'Product deleted!';
      },
      error: 'Failed to delete product.'
    });
  };

  const handleToggleRow = (productId) => {
    setExpandedProductId(currentId => (currentId === productId ? null : productId));
  };

  const categoryName = useMemo(() => categories.find(c => c._id === selectedId)?.name || 'N/A', [categories, selectedId]);

  return (
    // ADDED margin-top
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md">
        <label htmlFor="category-select" className="font-semibold text-gray-700">Select Category:</label>
        <select
          id="category-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-grow p-2 border rounded-xl bg-gray-50"
          disabled={isLoading || categories.length === 0}
        >
          {categories.length === 0 && <option>No categories found</option>}
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex-shrink-0 bg-[#6A3E9D] hover:bg-[#6A3E9D] text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors cursor-pointer "
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Products In: <span className="text-[#6A3E9D]">{categoryName}</span>
          </h2>
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={!selectedId}
            className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            Add Product
          </button>
        </div>
        
        {isLoading && <div className="text-center p-8">Loading products...</div>}
        {error && <div className="text-center p-8 text-red-500">Error: {error}</div>}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Companies</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map(prod => (
                  <React.Fragment key={prod._id}>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div>{prod.productName}</div>
                        <div className="text-xs text-gray-500">{prod.modelNo}</div>
                      </td>
                      <td className="px-6 py-4">
                        {prod.images?.[0]?.url ? (
                          <img src={prod.images[0].url} alt={prod.productName} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {prod.companies?.map(c => (
                            c.logo?.url && <img key={c._id} src={c.logo.url} title={c.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          prod.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(prod.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center space-x-4">
                        <button onClick={() => handleToggleRow(prod._id)} className="font-medium text-blue-600 hover:underline">
                          {expandedProductId === prod._id ? 'Close' : 'View'}
                        </button>
                        <button onClick={() => handleDeleteProduct(prod._id)} className="font-medium text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                    {expandedProductId === prod._id && (
                      <tr className="border-b">
                        <td colSpan="6" className="p-0 bg-slate-50">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-4">
                              <div>
                                <p className="font-semibold text-gray-700">Details:</p>
                                <p className="text-gray-600 break-words">{prod.details || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700">Size:</p>
                                <p className="text-gray-600">{prod.size || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700">Pieces:</p>
                                <p className="text-gray-600">{prod.pieces || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">All Product Images:</p>
                              {prod.images && prod.images.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {prod.images.map(img => (
                                    <a key={img._id} href={img.url} target="_blank" rel="noopener noreferrer">
                                      <img src={img.url} alt="product" className="w-24 h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                                    </a>
                                  ))}
                                </div>
                              ) : <p className="text-gray-500">No additional images.</p>}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 mb-2">Materials:</p>
                              {prod.materials && prod.materials.length > 0 ? (
                                <div className="space-y-3">
                                  {prod.materials.map((mat, i) => (
                                    <div key={i} className="flex items-start gap-3 p-2 bg-white rounded-lg border">
                                      {mat.materialImage?.url && (
                                          <img src={mat.materialImage.url} alt={mat.materialName} className="w-12 h-12 object-cover rounded" />
                                      )}
                                      <div>
                                          <p className="font-bold text-gray-800">{mat.materialName}</p>
                                          <p className="text-sm text-gray-600">
                                              Price: ₹{mat.price} | Discount: {mat.discount}% | Final: <span className="font-semibold">₹{mat.discountedPrice}</span>
                                          </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : <p className="text-gray-500">No materials listed.</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8">No products found for this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        companies={companies}
        selectedCategoryId={selectedId}
        onProductAdded={handleActionSuccess}
      />
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={handleActionSuccess}
      />
    </div>
  );
}

export default ManageOtherProducts;