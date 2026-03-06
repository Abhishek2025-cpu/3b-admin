import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPenToSquare, faTrash, faTimes, faChevronLeft, faChevronRight, 
  faFilter, faArrowRightFromBracket, faArrowRightToBracket, 
  faUser, faBuilding, faBoxOpen, faSyncAlt, faIndianRupeeSign, 
  faHashtag, faSave, faImage, faPlusCircle, faHistory, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, children, title, maxWidth = "max-w-2xl" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-[110] p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className={`bg-white rounded-[2.5rem] shadow-2xl relative ${maxWidth} w-full border border-white/20 flex flex-col max-h-[90vh] overflow-hidden z-[111]`}
          >
            <div className="p-7 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="w-2.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                {title}
              </h2>
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300">
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function ViewProducts() {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [editFormData, setEditFormData] = useState({
    _id: '', productName: '', filledBy: '', toClient: '', toCompany: '',
    direction: '', qtyByClient: 0, mrpPerBox: 0, productImages: [] 
  });
  const [newImages, setNewImages] = useState([]); 

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/get-movement');
      const data = await res.json();
      if (data.success) setMovements(data.movements || []);
    } catch (err) {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      Object.keys(editFormData).forEach(key => {
        if (key !== 'productImages') formData.append(key, editFormData[key]);
      });
      newImages.forEach(file => formData.append('productImages', file));

      const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/inventory/update/${editFormData._id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Log updated successfully");
        setIsEditOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Confirm permanent deletion?")) {
      try {
        const res = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/inventory/delete/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.success) { toast.success("Record deleted"); fetchData(); }
      } catch (err) { toast.error("Error deleting"); }
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

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full mb-6"
      />
      <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Loading Workspace...</p>
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-[#f8fafc] min-h-screen font-sans antialiased text-slate-900">
      <Toaster position="top-right" />

      <div className="max-w-[1500px] mx-auto space-y-12">
        
        {/* --- DYNAMIC HEADER --- */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-3"
            >
              <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                <FontAwesomeIcon icon={faLayerGroup} className="text-white text-base" />
              </div>
              <span className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Live Inventory System</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-none"
            >
              Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Analytics</span>
            </motion.h1>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[320px]">
              <FontAwesomeIcon icon={faFilter} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors text-lg" />
              <input 
                type="text" placeholder="Search product or client..." 
                className="pl-14 pr-6 py-5 rounded-[1.5rem] bg-white border-2 border-slate-100 shadow-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all w-full font-semibold text-base"
                value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
            <button onClick={fetchData} className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-600 rounded-[1.5rem] hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center active:scale-95">
              <FontAwesomeIcon icon={faSyncAlt} className={`text-xl ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </motion.div>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Logs Found', val: movements.length, icon: faHistory, color: 'indigo' },
            { label: 'Inbound Movements', val: movements.filter(m => m.direction === 'In').length, icon: faArrowRightToBracket, color: 'emerald' },
            { label: 'Outbound Movements', val: movements.filter(m => m.direction === 'Out').length, icon: faArrowRightFromBracket, color: 'rose' }
          ].map((stat, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6"
            >
              <div className={`w-16 h-16 bg-${stat.color}-50 text-${stat.color}-600 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner`}>
                <FontAwesomeIcon icon={stat.icon} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{stat.val}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- TABLE AREA --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-7 border-b border-slate-100">Sr. No</th>
                  <th className="px-6 py-7 border-b border-slate-100">Date & Time</th>
                  <th className="px-6 py-7 border-b border-slate-100">Product Specification</th>
                  <th className="px-6 py-7 border-b border-slate-100">Destination</th>
                  <th className="px-6 py-7 border-b border-slate-100 text-center">Flow</th>
                  <th className="px-6 py-7 border-b border-slate-100">Volume</th>
                  <th className="px-10 py-7 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode='popLayout'>
                  {currentItems.map((item, idx) => (
                    <motion.tr 
                      layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      key={item._id} onClick={() => handleRowClick(item)} 
                      className="hover:bg-indigo-50/40 transition-all cursor-pointer group"
                    >
                      <td className="px-10 py-6 text-sm text-slate-400 font-bold">#{String(((currentPage - 1) * itemsPerPage) + idx + 1).padStart(2, '0')}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-black text-base">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">{new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                            {item.productImages?.[0]?.url ? (
                              <img src={item.productImages[0].url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 text-xl"><FontAwesomeIcon icon={faBoxOpen} /></div>
                            )}
                          </div>
                          <span className="font-black text-slate-800 text-base tracking-tight">{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-700 uppercase leading-tight">{item.toCompany || item.toClient || 'Self Store'}</span>
                           <span className="text-[11px] text-indigo-500 font-black uppercase mt-1.5 tracking-wider">
                             <FontAwesomeIcon icon={item.toCompany ? faBuilding : faUser} className="mr-1.5" />
                             {item.toCompany ? 'Commercial' : 'Individual'}
                           </span>
                         </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${item.direction === 'Out' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.direction === 'Out' ? 'bg-rose-600' : 'bg-emerald-600'}`}></div>
                          {item.direction}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-base font-black text-slate-900">{item.qtyByClient} <span className="text-xs text-slate-400 font-bold uppercase">Units</span></div>
                        <div className="text-xs text-slate-400 font-bold mt-0.5">₹{item.mrpPerBox?.toLocaleString()} / unit</div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                          <button onClick={(e) => handleEditClick(e, item)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                            <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                          </button>
                          <button onClick={(e) => handleDelete(e, item._id)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <FontAwesomeIcon icon={faTrash} className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* --- LARGE PAGINATION --- */}
          <div className="p-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8 bg-slate-50/20">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Showing {currentItems.length} of {filteredData.length} entries</p>
            <div className="flex gap-3">
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i} onClick={() => setCurrentPage(i + 1)} 
                  className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-indigo-200 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-indigo-400 hover:text-indigo-600'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- DETAILS MODAL --- */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Log Details" maxWidth="max-w-xl">
        {selectedItem && (
          <div className="space-y-10">
            <div className="relative group overflow-hidden rounded-[2.5rem] aspect-[16/10] bg-slate-100 border-4 border-white shadow-2xl">
                {selectedItem.productImages?.[0]?.url ? (
                  <img src={selectedItem.productImages[0].url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><FontAwesomeIcon icon={faBoxOpen} size="4x" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex items-end p-10">
                   <div>
                     <span className="px-3 py-1 bg-indigo-500 text-[10px] font-black text-white uppercase rounded-lg mb-3 inline-block tracking-[0.2em]">Product Item</span>
                     <h3 className="text-3xl font-black text-white leading-tight">{selectedItem.productName}</h3>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               {[
                 { label: 'Volume Moved', val: `${selectedItem.qtyByClient} Pcs`, color: 'slate' },
                 { label: 'Price Value', val: `₹${selectedItem.mrpPerBox?.toLocaleString()}`, color: 'slate' },
                 { label: 'Flow Direction', val: selectedItem.direction, color: selectedItem.direction === 'In' ? 'emerald' : 'rose' },
                 { label: 'Responsible', val: selectedItem.filledBy, color: 'indigo' }
               ].map((box, i) => (
                 <div key={i} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem]">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{box.label}</p>
                   <p className={`text-xl font-black text-${box.color}-600 uppercase`}>{box.val}</p>
                 </div>
               ))}
            </div>

            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
               <div className="flex justify-between items-center relative z-10">
                 <span className="text-xs font-black uppercase text-slate-500 tracking-widest">Entity / Client</span>
                 <span className="text-lg font-black">{selectedItem.toClient || selectedItem.toCompany || '---'}</span>
               </div>
               <div className="flex justify-between items-center border-t border-white/10 pt-6 relative z-10">
                 <span className="text-xs font-black uppercase text-slate-500 tracking-widest">System Timestamp</span>
                 <span className="text-sm font-black text-slate-300">{new Date(selectedItem.createdAt).toLocaleString()}</span>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- EDIT MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Logistics Log">
        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Product Name</label>
              <div className="relative">
                <FontAwesomeIcon icon={faBoxOpen} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                <input type="text" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-base outline-none focus:border-indigo-500 focus:bg-white transition-all" value={editFormData.productName} onChange={(e)=>setEditFormData({...editFormData, productName: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Handler Name</label>
              <div className="relative">
                <FontAwesomeIcon icon={faUser} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                <input type="text" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-base outline-none focus:border-indigo-500 focus:bg-white transition-all" value={editFormData.filledBy} onChange={(e)=>setEditFormData({...editFormData, filledBy: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Movement Quantity</label>
              <div className="relative">
                <FontAwesomeIcon icon={faHashtag} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                <input type="number" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-base outline-none focus:border-indigo-500 focus:bg-white transition-all" value={editFormData.qtyByClient} onChange={(e)=>setEditFormData({...editFormData, qtyByClient: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2">Price Value (₹)</label>
              <div className="relative">
                <FontAwesomeIcon icon={faIndianRupeeSign} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                <input type="number" className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-base outline-none focus:border-indigo-500 focus:bg-white transition-all" value={editFormData.mrpPerBox} onChange={(e)=>setEditFormData({...editFormData, mrpPerBox: e.target.value})} required />
              </div>
            </div>
          </div>

          <div className="space-y-5 pt-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-3">
              <FontAwesomeIcon icon={faImage} className="text-indigo-500 text-lg" /> Product Media Gallery
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-5 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
               {editFormData.productImages.map((img, i) => (
                 <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-lg group border-2 border-white">
                   <img src={img.url} className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <span className="text-xs text-white font-black uppercase tracking-tighter">Existing</span>
                   </div>
                 </div>
               ))}
               {newImages.map((file, i) => (
                 <div key={i} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-4 border-indigo-500 shadow-2xl scale-95">
                   <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                   <button type="button" onClick={() => setNewImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 w-7 h-7 bg-rose-500 text-white rounded-full text-xs shadow-xl flex items-center justify-center"><FontAwesomeIcon icon={faTimes} /></button>
                 </div>
               ))}
               <label className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer">
                  <FontAwesomeIcon icon={faPlusCircle} className="text-2xl mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Files</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
               </label>
            </div>
          </div>

          <div className="flex gap-5 pt-8">
            <button disabled={isUpdating} type="submit" className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 text-base tracking-widest uppercase">
              {isUpdating ? <FontAwesomeIcon icon={faSyncAlt} className="animate-spin text-xl" /> : <FontAwesomeIcon icon={faSave} className="text-xl" />}
              {isUpdating ? 'Saving Data...' : 'Confirm Update'}
            </button>
            <button type="button" onClick={()=>setIsEditOpen(false)} className="flex-1 bg-slate-100 text-slate-500 font-black rounded-[1.5rem] hover:bg-slate-200 transition-all text-base uppercase tracking-widest">Discard</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ViewProducts;