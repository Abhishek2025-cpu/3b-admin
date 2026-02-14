import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare, faTrash, faTimes, faChevronLeft, faChevronRight, 
  faFilter, faArrowRightFromBracket, faArrowRightToBracket, 
  faUser, faBuilding, faBoxOpen, faSyncAlt, faIndianRupeeSign, 
  faHashtag, faSave, faImage, faPlusCircle
} from '@fortawesome/free-solid-svg-icons';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children, title, maxWidth = "max-w-2xl" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-center z-[110] p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className={`bg-white rounded-[2rem] shadow-2xl relative ${maxWidth} w-full border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200`}>
        <div className="p-5 border-b flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span> {title}
          </h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-500 transition-all">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Main View Component ---
function ViewProducts() {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    _id: '',
    productName: '',
    filledBy: '',
    toClient: '',
    toCompany: '',
    direction: '',
    qtyByClient: 0,
    mrpPerBox: 0,
    productImages: [] 
  });
  const [newImages, setNewImages] = useState([]); 

  // --- API CALL: FETCH DATA ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/get-movement');
      const data = await res.json();
      if (data.success) setMovements(data.movements || []);
    } catch (err) {
      toast.error("Failed to load movement data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- DETAIL MODAL LOGIC ---
  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  // --- EDIT PRE-FILL LOGIC ---
  const handleEditClick = (e, item) => {
    e.stopPropagation(); 
    setEditFormData({
      _id: item._id,
      productName: item.productName || '',
      filledBy: item.filledBy || '',
      toClient: item.toClient || '',
      toCompany: item.toCompany || '',
      direction: item.direction || 'Out',
      qtyByClient: item.qtyByClient || 0,
      mrpPerBox: item.mrpPerBox || 0,
      productImages: item.productImages || []
    });
    setNewImages([]);
    setIsEditOpen(true);
  };

  // --- API CALL: UPDATE (PUT) ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const formData = new FormData();
      formData.append('productName', editFormData.productName);
      formData.append('filledBy', editFormData.filledBy);
      formData.append('toClient', editFormData.toClient || '');
      formData.append('toCompany', editFormData.toCompany || '');
      formData.append('qtyByClient', editFormData.qtyByClient);
      formData.append('mrpPerBox', editFormData.mrpPerBox);
      formData.append('direction', editFormData.direction);
      
      newImages.forEach(file => {
        formData.append('productImages', file);
      });

      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/inventory/update/${editFormData._id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Transaction Updated Successfully!");
        setIsEditOpen(false);
        fetchData();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Connection Error during update");
    } finally {
      setIsUpdating(false);
    }
  };


  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this log permanently?")) {
      try {
        const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/inventory/delete/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if(data.success) {
          toast.success("Log Deleted Successfully");
          fetchData();
        } else {
          toast.error("Failed to delete");
        }
      } catch (err) {
        toast.error("Error connecting to server");
      }
    }
  };

  const filteredData = useMemo(() => {
    return movements.filter(m => 
      m.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.toClient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.toCompany?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [movements, searchTerm]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return (
      <div className="flex flex-col">
        <span className="text-slate-700 font-medium">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    );
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Refreshing Inventory Logs...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-sans antialiased text-slate-900">
      <Toaster position="top-right" />

      <div className="max-w-[1600px] mx-auto">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-lg shadow-inner"><FontAwesomeIcon icon={faSyncAlt} /></div>
            <div><p className="text-slate-400 text-xs font-medium uppercase">Total Movements</p><h3 className="text-xl font-semibold text-slate-800">{movements.length}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-lg shadow-inner"><FontAwesomeIcon icon={faArrowRightToBracket} /></div>
            <div><p className="text-slate-400 text-xs font-medium uppercase">Total Inbound</p><h3 className="text-xl font-semibold text-slate-800">{movements.filter(m => m.direction === 'In').length}</h3></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-lg shadow-inner"><FontAwesomeIcon icon={faArrowRightFromBracket} /></div>
            <div><p className="text-slate-400 text-xs font-medium uppercase">Total Outbound</p><h3 className="text-xl font-semibold text-slate-800">{movements.filter(m => m.direction === 'Out').length}</h3></div>
          </div>
        </div>

        {/* Table Main Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
            <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span> Inventory Log
            </h1>
            <div className="flex gap-4 w-full lg:w-auto">
              <div className="relative flex-grow">
                <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" placeholder="Search product, client..." 
                  className="w-full sm:w-72 pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                  value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>
              <button onClick={fetchData} className="w-12 h-12 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center">
                <FontAwesomeIcon icon={faSyncAlt} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-medium uppercase tracking-wide border-b border-slate-100">
                  <th className="px-8 py-4">Sr.</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Destination</th>
                  <th className="px-6 py-4 text-center">Flow</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">MRP / Box</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentItems.map((item, idx) => (
                  <tr key={item._id} onClick={() => handleRowClick(item)} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">{String(((currentPage - 1) * itemsPerPage) + idx + 1).padStart(2, '0')}</td>
                    <td className="px-6 py-5">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          {item.productImages?.[0]?.url ? (
                            <img src={item.productImages[0].url} className="w-full h-full object-cover" alt="p" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                              <FontAwesomeIcon icon={faBoxOpen} />
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm tracking-tight leading-none">{item.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-semibold text-slate-700 uppercase">{item.toCompany || item.toClient || 'Self-Store'}</span>
                       <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase mt-1">
                         <FontAwesomeIcon icon={item.toCompany ? faBuilding : faUser} className="text-[8px]" /> {item.toCompany ? 'Company' : 'Individual'}
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${item.direction === 'Out' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                        {item.direction}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-800 text-sm">{item.qtyByClient} <span className="text-[10px] text-slate-400 font-normal">Pcs</span></td>
                    <td className="px-6 py-5 font-medium text-slate-600 text-sm">₹{item.mrpPerBox?.toLocaleString()}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={(e) => handleEditClick(e, item)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                          <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, item._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs font-medium text-slate-400 uppercase">Showing {currentItems.length} of {filteredData.length} entries</p>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)} 
                  className={`w-9 h-9 rounded-lg font-semibold text-xs transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Transaction Summary">
        {selectedItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-white">
                {selectedItem.productImages?.[0]?.url ? (
                  <img src={selectedItem.productImages[0].url} className="w-full h-full object-cover" alt="p" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <FontAwesomeIcon icon={faBoxOpen} size="lg" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800 tracking-tight">{selectedItem.productName}</h3>
                <p className="text-xs font-medium text-indigo-500 uppercase tracking-wide mt-1">Inventory Record</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">Quantity Moved</p>
                 <p className="text-lg font-semibold text-slate-800">{selectedItem.qtyByClient} Pcs</p>
               </div>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">MRP / Box</p>
                 <p className="text-lg font-semibold text-slate-800">₹{selectedItem.mrpPerBox?.toLocaleString()}</p>
               </div>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">Flow Type</p>
                 <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase ${selectedItem.direction === 'Out' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                   {selectedItem.direction}
                 </span>
               </div>
               <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-medium text-slate-400 uppercase mb-1">Filled By</p>
                 <p className="text-sm font-semibold text-slate-800 uppercase">{selectedItem.filledBy}</p>
               </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4">
               <div className="flex justify-between items-center opacity-80">
                 <span className="text-xs font-medium uppercase">Client Name</span>
                 <span className="text-sm font-semibold">{selectedItem.toClient || '---'}</span>
               </div>
               <div className="flex justify-between items-center opacity-80">
                 <span className="text-xs font-medium uppercase">Company Name</span>
                 <span className="text-sm font-semibold">{selectedItem.toCompany || '---'}</span>
               </div>
               <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-xs font-medium uppercase opacity-60">Timestamp</span>
                  <span className="text-xs font-medium">{new Date(selectedItem.createdAt).toLocaleString()}</span>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Movement">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Product Name</label>
              <div className="relative">
                <FontAwesomeIcon icon={faBoxOpen} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.productName} onChange={(e)=>setEditFormData({...editFormData, productName: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Handler Name</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.filledBy} onChange={(e)=>setEditFormData({...editFormData, filledBy: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Client (Target)</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.toClient || ''} onChange={(e)=>setEditFormData({...editFormData, toClient: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Company (Target)</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.toCompany || ''} onChange={(e)=>setEditFormData({...editFormData, toCompany: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Moved Qty</label>
              <div className="relative">
                <FontAwesomeIcon icon={faHashtag} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.qtyByClient} onChange={(e)=>setEditFormData({...editFormData, qtyByClient: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-1">Price Per Box</label>
              <div className="relative">
                <FontAwesomeIcon icon={faIndianRupeeSign} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="number" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none focus:border-indigo-500 transition-all" value={editFormData.mrpPerBox} onChange={(e)=>setEditFormData({...editFormData, mrpPerBox: e.target.value})} required />
              </div>
            </div>
          </div>

          {/* IMAGE UPDATE AREA */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-500 ml-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faImage} /> Gallery & Uploads
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               {editFormData.productImages.map((img, i) => (
                 <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                   <img src={img.url} className="w-full h-full object-cover" alt="existing" />
                   <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] text-white font-semibold uppercase">Stored</span>
                   </div>
                 </div>
               ))}
               
               {newImages.map((file, i) => (
                 <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-indigo-400 shadow-sm">
                   <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="new" />
                   <button 
                    type="button"
                    onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center shadow-lg"
                   >
                     <FontAwesomeIcon icon={faTimes} />
                   </button>
                 </div>
               ))}

               <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all cursor-pointer bg-white">
                  <FontAwesomeIcon icon={faPlusCircle} className="text-lg mb-1" />
                  <span className="text-[9px] font-semibold uppercase">Upload</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
               </label>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button disabled={isUpdating} type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 text-sm">
              <FontAwesomeIcon icon={isUpdating ? faSyncAlt : faSave} className={isUpdating ? 'animate-spin' : ''} />
              {isUpdating ? 'Processing...' : 'Confirm Changes'}
            </button>
            <button type="button" onClick={()=>setIsEditOpen(false)} className="px-8 bg-slate-100 text-slate-500 font-semibold rounded-2xl hover:bg-slate-200 transition-all text-sm">Discard</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ViewProducts;