import React, { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { get__CompaniesList, get__AllCategories, add__NewCompany } from '../compoents/Services/companyService'; 

const FormModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start z-50 p-4 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-gray-300">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-2xl">×</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const CustomCategoryDropdown = ({ categories = [], selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeCategories = Array.isArray(categories) ? categories : [];
  const selectedCategory = useMemo(() => safeCategories.find(c => c._id === selected), [safeCategories, selected]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-2.5 border rounded-xl bg-white flex items-center justify-between text-left focus:ring-2 focus:ring-[#6A3E9D]/20 outline-none border-gray-300"
      >
        {selectedCategory ? (
          <span className="flex items-center gap-3">
            {selectedCategory.images?.[0]?.url && <img src={selectedCategory.images[0].url} alt="" className="w-6 h-6 rounded-full object-cover" />}
            <span className="text-gray-800">{selectedCategory.name}</span>
          </span>
        ) : <span className="text-gray-400">Select a category</span>}
        <span className="text-gray-400 text-xs transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-[60] max-h-60 overflow-y-auto">
          {safeCategories.length > 0 ? safeCategories.map(category => (
            <div key={category._id} onClick={() => { onSelect(category._id); setIsOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-violet-50 cursor-pointer border-b last:border-none">
              <img src={category.images?.[0]?.url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
              <span className="text-gray-700 font-medium">{category.name}</span>
            </div>
          )) : <div className="p-4 text-center text-gray-400">No categories found</div>}
        </div>
      )}
    </div>
  );
};

const AddCompanyModal = ({ isOpen, onClose, categories, onActionSuccess }) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isOpen) { setName(''); setLogo(null); setCategoryId(''); setPreview(null); }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setLogo(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter company name.');
    if (!categoryId) return toast.error('Please select a category.');
    if (!logo) return toast.error('Please upload a logo.');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('logo', logo);
    // FIX: Changed 'categoryId' to 'category' to match backend schema validation
    formData.append('category', categoryId);

    const promise = add__NewCompany(formData);

    toast.promise(promise, {
      loading: 'Adding company...',
      success: (res) => {
        onClose();
        setTimeout(() => onActionSuccess(), 1000);
        return 'Company added successfully!';
      },
      error: (err) => {
          // Backend se aane wale specific error message ko dikhane ke liye
          return err.response?.data?.error || err.response?.data?.message || 'Failed to add company.';
      },
    });
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Add New Company">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Name</label>
          <input type="text" placeholder="e.g. 3B Profiles" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#6A3E9D]" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Category</label>
          <CustomCategoryDropdown categories={categories} selected={categoryId} onSelect={setCategoryId} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company Logo</label>
          <div className="flex flex-col gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] cursor-pointer" />
            {preview && (
              <div className="relative w-24 h-24 mt-2">
                <img src={preview} alt="preview" className="w-full h-full rounded-2xl object-cover border-2 border-gray-100 shadow-sm" />
                <button type="button" onClick={() => {setLogo(null); setPreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">×</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button type="submit" className="px-8 py-2.5 rounded-xl font-bold bg-[#6A3E9D] hover:bg-[#583281] text-white shadow-lg active:scale-95">Create Company</button>
        </div>
      </form>
    </FormModal>
  );
};

function CompanyDetails() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [compData, catData] = await Promise.all([
        get__CompaniesList(),
        get__AllCategories()
      ]);

      setCompanies(compData);
      setCategories(catData?.categories || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data.");
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionSuccess = () => {
    fetchData(); 
  };

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8 max-w-[1400px] mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-3xl p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Manage Companies</h2>
            <p className="text-gray-500 text-sm mt-1">Add or update your partner brand details</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
            <span className="text-xl">+</span> Add New Company
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6A3E9D]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-100">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold border-b">
                  <th className="px-6 py-4">Company Details</th>
                  <th className="px-6 py-4">Category Type</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.length > 0 ? companies.map(company => (
                  <tr key={company._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                          <img src={company.logo?.url} alt={company.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-[#6A3E9D]">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-50 text-[#6A3E9D] text-[10px] font-black uppercase border border-violet-100">
                        {company.category?.name || company.categoryId?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        <button title="Edit" className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                        <button title="Delete" className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="text-center py-20 text-gray-400 font-medium italic">No companies listed yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onActionSuccess={handleActionSuccess}
      />
    </div>
  );
}

export default CompanyDetails;