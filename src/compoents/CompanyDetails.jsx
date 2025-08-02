// src/components/CompanyDetails.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// --- Reusable UI Components ---

/**
 * A generic modal component without the dark background overlay.
 */
const FormModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 border border-gray-300">
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
 * A custom dropdown that can display images next to the options.
 */
const CustomCategoryDropdown = ({ categories, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = useMemo(() => categories.find(c => c._id === selected), [categories, selected]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full p-2 border rounded-xl bg-white flex items-center justify-between text-left"
      >
        {selectedCategory ? (
          <span className="flex items-center gap-3">
            <img src={selectedCategory.images[0]?.url} alt={selectedCategory.name} className="w-6 h-6 rounded-full object-cover" />
            <span>{selectedCategory.name}</span>
          </span>
        ) : (
          <span className="text-gray-500">Select a category</span>
        )}
        <span className="text-gray-500">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
          {categories.map(category => (
            <div
              key={category._id}
              onClick={() => {
                onSelect(category._id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
            >
              <img src={category.images[0]?.url} alt={category.name} className="w-6 h-6 rounded-full object-cover" />
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * The modal form for adding a new company.
 */
const AddCompanyModal = ({ isOpen, onClose, categories, onActionSuccess }) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(null); // File object
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setLogo(null);
      setCategoryId('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !logo || !categoryId) {
      return toast.error('All fields are required.');
    }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('logo', logo);
    fd.append('categoryId', categoryId);

    const promise = axios.post('https://threebapi-1067354145699.asia-south1.run.app/api/company/add-company', fd);

    toast.promise(promise, {
      loading: 'Adding company...',
      success: () => {
        onClose();
        setTimeout(() => onActionSuccess(), 1000);
        return 'Company added successfully!';
      },
      error: 'Failed to add company.',
    });
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Add New Company">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input type="text" placeholder="e.g., Acme Corporation" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <CustomCategoryDropdown categories={categories} selected={categoryId} onSelect={setCategoryId} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100" />
        </div>
        {logo && (
          <div>
            <p className="text-sm font-medium text-gray-700">Logo Preview:</p>
            <div className="relative inline-block mt-2">
              <img src={URL.createObjectURL(logo)} alt="preview" className="w-28 h-28 rounded-full object-cover border-2 border-gray-200" />
              <button type="button" onClick={() => setLogo(null)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold leading-none">×</button>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button>
          <button type="submit" className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg">Add Company</button>
        </div>
      </form>
    </FormModal>
  );
};


/**
 * Main Component to Manage Companies
 */
function CompanyDetails() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [companyRes, categoryRes] = await Promise.all([
          axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/company/get-company'),
          axios.get('https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/get')
        ]);
        setCompanies(companyRes.data || []);
        setCategories(categoryRes.data || []);
      } catch (err) {
        setError("Failed to load data. Please refresh.");
        toast.error("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleActionSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Manage Companies</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">
            + Add Company
          </button>
        </div>
        
        {isLoading && <div className="text-center p-8">Loading companies...</div>}
        {error && <div className="text-center p-8 text-red-500">{error}</div>}

        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.length > 0 ? companies.map(company => (
                  <tr key={company._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-4">
                      <img src={company.logo?.url} alt={company.name} className="w-12 h-12 rounded-full object-cover border" />
                      <span>{company.name}</span>
                    </td>
                    <td className="px-6 py-4">{company.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={true} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-center space-x-4">
                      <button title="Update" className="text-yellow-500 hover:text-yellow-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                      </button>
                      <button title="Delete" className="text-red-500 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8">No companies found. Add one to get started.</td>
                  </tr>
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