import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faPlus, faTimes, faChevronLeft, faChevronRight, faFilter, faArrowRightFromBracket, faArrowRightToBracket, faUser, faBuilding } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';

// --- Reusable Components ---
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start pt-20 z-50 p-4 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-4rem)]`}>
        {children}
      </div>
    </div>
  );
};

const ImageSliderModal = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { if (isOpen) setCurrentIndex(0); }, [isOpen]);
  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <button onClick={onClose} className="absolute top-5 right-5 text-white text-3xl z-50">&times;</button>
      <button onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="absolute left-5 text-white text-3xl"><FontAwesomeIcon icon={faChevronLeft} /></button>
      <img src={images[currentIndex]} className="max-w-full max-h-[85vh] object-contain rounded-lg" alt="preview" />
      <button onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="absolute right-5 text-white text-3xl"><FontAwesomeIcon icon={faChevronRight} /></button>
    </div>
  );
};

// --- Main View Component ---
function ViewProducts() {
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Data from Movement API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/get-movement');
      const data = await res.json();
      if (data.success) {
        setMovements(data.movements || []);
      }
    } catch (err) {
      toast.error("Failed to load movement data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter Search
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

  // Helper for Date
  const formatDate = (dateStr) => {
    return new Intl.DateTimeFormat('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(new Date(dateStr));
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen text-purple-700 font-bold animate-pulse">Loading Movement History...</div>;

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Toaster />
      
      <div className="max-w-[1600px] mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase">Inventory Movement Log</h1>
            <p className="text-sm text-gray-500 font-medium">Tracking {movements.length} total transactions</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search Product, Client, or Company..." 
                className="w-full md:w-80 pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              />
            </div>
            <button onClick={fetchData} className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl font-bold hover:bg-purple-200 transition-all">Refresh</button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase font-black tracking-wider">
              <tr>
                <th className="px-6 py-4">Sr.</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Product / Model</th>
                <th className="px-6 py-4">Filled By</th>
                <th className="px-6 py-4">To (Destination)</th>
                <th className="px-6 py-4 text-center">Direction</th>
                <th className="px-6 py-4">Qty Moved</th>
                <th className="px-6 py-4">MRP / Box</th>
                <th className="px-6 py-4">Inv. Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((item, idx) => (
                <tr key={item._id} className="hover:bg-purple-50/40 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-400">
                    {((currentPage - 1) * itemsPerPage) + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.productImages && item.productImages[0]?.url ? (
                           <img 
                            src={item.productImages[0].url} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setCarouselImages(item.productImages.map(img => img.url));
                              setCarouselOpen(true);
                            }}
                            alt="p"
                           />
                        ) : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>}
                      </div>
                      <span className="font-black text-gray-800 tracking-tight">{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px] font-bold uppercase">
                      <FontAwesomeIcon icon={faUser} className="mr-1 text-[9px]" /> {item.filledBy}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.toCompany ? (
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                        <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs" />
                        {item.toCompany}
                      </div>
                    ) : item.toClient ? (
                      <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                        <FontAwesomeIcon icon={faUser} className="text-gray-400 text-xs" />
                        {item.toClient}
                      </div>
                    ) : <span className="text-gray-300 italic">Self</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      item.direction === 'Out' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <FontAwesomeIcon icon={item.direction === 'Out' ? faArrowRightFromBracket : faArrowRightToBracket} />
                      {item.direction}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-700 text-sm">
                    {item.qtyByClient} <span className="text-[10px] text-gray-400 ml-0.5">Pcs</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-600 text-sm">
                    ₹{item.mrpPerBox?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-black text-purple-700 text-xs">
                      {item.productQty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-500 hover:text-blue-700"><FontAwesomeIcon icon={faPenToSquare} /></button>
                      <button 
                         onClick={async () => {
                          if(window.confirm("Delete this log permanently?")) {
                            await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete-movement/${item._id}`, {method: 'DELETE'});
                            fetchData();
                          }
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="py-20 text-center text-gray-400 font-medium">No movement records found.</div>
        )}

        {/* Pagination Section */}
        <div className="p-6 bg-gray-50/50 border-t flex justify-between items-center">
          <p className="text-xs font-bold text-gray-500 uppercase">Showing {currentItems.length} of {filteredData.length} records</p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${
                  currentPage === i + 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-400 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImageSliderModal 
        isOpen={isCarouselOpen} 
        onClose={() => setCarouselOpen(false)} 
        images={carouselImages} 
      />
    </div>
  );
}

export default ViewProducts;