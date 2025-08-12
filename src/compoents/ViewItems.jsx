import logo from '../assets/3b.png';
import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- SVG Icons (Unchanged) ---
const ViewIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> );
const BoxIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v2h14V4a1 1 0 00-1-1H4zM3 9v9a1 1 0 001 1h12a1 1 0 001-1V9H3z" /></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg> );
const PrintIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg> );
const TrackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>);
const Spinner = () => ( <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );

// --- PrintModal with NO background overlay ---
const PrintModal = ({ isOpen, onClose, item, box }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !item || !box) return null;

  const profileCodes = [item.operator?.eid, item.helper?.eid].filter(Boolean).join(', ');

  return (
    <>
      <style>{`@media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; } .no-print { display: none !important; } }`}</style>
      
      {/* Modal container: No background, pointer-events-none to allow clicking behind */}
      <div className="fixed inset-0 z-50 flex justify-center items-center p-4 pointer-events-none"> {/* <-- CHANGE HERE */}
        {/* Modal Dialog: Re-enable pointer events for the modal itself */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col pointer-events-auto"> {/* <-- CHANGE HERE */}
          
          <div id="printable-area" className="p-2">
            <div className="border-[16px] border-[#6A3E9D] p-6 bg-white">
              <div className="grid grid-cols-5 gap-x-8">
                <div className="col-span-3 flex flex-col justify-between">
                  <div><img src={logo} alt="3B Profiles Logo" className="h-40" /><p className="text-sm font-semibold text-gray-700 mt-1">www.3bprofilespvtltd.com</p></div>
                  <div className="mt-8 space-y-4 text-lg">
                    <div className="flex items-center"><span className="w-36 font-bold text-gray-800">Profile Code</span><span className="flex-1 border-b-2 border-gray-400 text-center font-mono">{profileCodes || 'N/A'}</span></div>
                    <div className="flex items-center"><span className="w-36 font-bold text-gray-800">Height (m)</span><span className="flex-1 border-b-2 border-gray-400 text-center font-mono">{item.length}</span></div>
                    <div className="flex items-center"><span className="w-36 font-bold text-gray-800">Qty per Box</span><span className="flex-1 border-b-2 border-gray-400 text-center font-mono">{item.noOfSticks}</span></div>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col justify-between items-center">
                  <div className="text-center"><img src={box.qrCodeUrl} alt="Box QR Code" className="w-32 h-32" /><p className="font-mono font-bold text-lg mt-1">{`${item.itemNo.trim()}/${box.boxSerialNo}`}</p></div>
                  <div className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center p-2 my-4"><img src={item.productImageUrl} alt="Product" className="max-w-full max-h-full object-contain"/></div>
                  <div className="w-full flex h-10 items-end justify-center gap-px overflow-hidden">{[...Array(40)].map((_, i) => <div key={i} className={`w-px bg-black h-${[4,6,8,10,12,10,8,6,4,8,12,6,10][i % 13]}/12`}></div>)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="no-print p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t">
            <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">Print</button>
            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </>
  );
};


// --- BoxesModal with NO background overlay ---
const BoxesModal = ({ isOpen, onClose, item, onOpenPrintModal }) => {
  if (!isOpen) return null;
  return (
    // Modal container: No background, pointer-events-none to allow clicking behind
    <div className="fixed inset-0 z-40 flex justify-center items-center p-4 pointer-events-none"> {/* <-- CHANGE HERE */}
      {/* Modal Dialog: Re-enable pointer events for the modal itself */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col pointer-events-auto"> {/* <-- CHANGE HERE */}
        <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Boxes for Item: <span className="text-indigo-600">{item?.itemNo?.trim()}</span></h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button></div>
        <div className="p-4 overflow-y-auto">
          {item?.boxes?.length > 0 ? (
            <ul className="space-y-3">
              {item.boxes.map((box) => (
                <li key={box._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4"><img src={box.qrCodeUrl} alt="QR Code" className="w-16 h-16 rounded-md"/><div><p className="font-semibold text-gray-700">Serial No:</p><p className="text-lg font-mono text-black">{box.boxSerialNo}</p></div></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => alert(`Tracking box: ${box.boxSerialNo}`)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"><TrackIcon /> Track</button>
                    <button onClick={() => onOpenPrintModal(box)} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"><PrintIcon /> View/Print</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : ( <p className="text-center text-gray-500 py-8">No box details found.</p> )}
        </div>
        <div className="p-4 border-t text-right"><button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Close</button></div>
      </div>
    </div>
  );
};

const ItemDetails = ({ item }) => {
    if (!item) return null;
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50">
        <div><p className="font-semibold text-gray-700">Length:</p><p>{item.length}</p></div>
        <div><p className="font-semibold text-gray-700">Shift:</p><p>{item.shift}</p></div>
        <div><p className="font-semibold text-gray-700">Company:</p><p>{item.company}</p></div>
        <div><p className="font-semibold text-gray-700">Created At:</p><p>{new Date(item.createdAt).toLocaleString()}</p></div>
        <div><p className="font-semibold text-gray-700">Operator EID:</p><p>{item.operator?.eid || 'N/A'}</p></div>
        <div><p className="font-semibold text-gray-700">Helper EID:</p><p>{item.helper?.eid || 'N/A'}</p></div>
      </div>
    );
};
  
// --- Main ViewItems Component (Unchanged) ---
function ViewItems() {
    const [items, setItems] = useState([]);
    const [fullItemsMap, setFullItemsMap] = useState(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [isBoxesModalOpen, setIsBoxesModalOpen] = useState(false);
    const [selectedItemForBoxes, setSelectedItemForBoxes] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedBoxForPrint, setSelectedBoxForPrint] = useState(null);
  
    useEffect(() => {
      async function fetchAllData() {
        setIsLoading(true);
        try {
          const [listRes, detailRes] = await Promise.all([
            fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-Allitems'),
            fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items')
          ]);
          if (!listRes.ok || !detailRes.ok) throw new Error('Failed to fetch data.');
          const listData = await listRes.json();
          const detailData = await detailRes.json();
          setItems(Array.isArray(listData) ? listData : []);
          const itemMap = new Map();
          if (Array.isArray(detailData)) { detailData.forEach(item => itemMap.set(item._id, item)); }
          setFullItemsMap(itemMap);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
      }
      fetchAllData();
    }, []);
    
    const filteredItems = useMemo(() => {
      if (!Array.isArray(items)) return [];
      return items.filter(item => 
        item.itemNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.helper?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [items, searchQuery]);
  
    const currentItems = filteredItems;
    
    const handleToggleRow = (itemId) => setExpandedRowId(expandedRowId === itemId ? null : itemId);
  
    const handleOpenBoxesModal = (itemFromList) => {
      const fullItemData = fullItemsMap.get(itemFromList._id);
      if (fullItemData) { setSelectedItemForBoxes(fullItemData); setIsBoxesModalOpen(true); } 
      else { alert('Could not find detailed box information. Please try refreshing.'); }
    };
    
    const handleCloseBoxesModal = () => setIsBoxesModalOpen(false);
  
    const handleOpenPrintModal = (box) => {
      setSelectedBoxForPrint(box);
      setIsPrintModalOpen(true);
      setIsBoxesModalOpen(false);
    };
    
    const handleClosePrintModal = () => {
      setIsPrintModalOpen(false);
      setSelectedBoxForPrint(null);
      setIsBoxesModalOpen(true);
    };
  
    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /><p className="ml-4 text-xl text-gray-600">Loading All Items...</p></div>;
    if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  
    return (
      <>
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">View All Items</h2>
            <div className="flex items-center gap-4">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 p-2 border rounded-xl"/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr><th className="px-6 py-3">Item No</th><th className="px-6 py-3">Image</th><th className="px-6 py-3">Operator</th><th className="px-6 py-3">Helper</th><th className="px-6 py-3 text-center">Boxes</th><th className="px-6 py-3 text-center">Actions</th></tr>
              </thead>
              <tbody>
                {currentItems.map(item => (
                  <React.Fragment key={item._id}>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.itemNo.trim()}</td>
                      <td className="px-6 py-4"><img src={item.productImageUrl} alt={item.itemNo} className="w-16 h-16 object-cover rounded" /></td>
                      <td className="px-6 py-4">{item.operator?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{item.helper?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-center font-mono text-lg">{item.boxCount}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleToggleRow(item._id)} title="View Details" className="text-blue-600 hover:text-blue-800"><ViewIcon /></button>
                          <button onClick={() => handleOpenBoxesModal(item)} title="View Boxes" className="text-green-600 hover:text-green-800"><BoxIcon /></button>
                          <button onClick={() => alert(`Deleting item: ${item.itemNo.trim()}`)} title="Delete Item" className="text-red-600 hover:text-red-800"><DeleteIcon /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRowId === item._id && (
                      <tr className="border-b"><td colSpan="6" className="p-0"><ItemDetails item={fullItemsMap.get(item._id)} /></td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <BoxesModal isOpen={isBoxesModalOpen} onClose={handleCloseBoxesModal} item={selectedItemForBoxes} onOpenPrintModal={handleOpenPrintModal}/>
        <PrintModal isOpen={isPrintModalOpen} onClose={handleClosePrintModal} item={selectedItemForBoxes} box={selectedBoxForPrint} />
      </>
    );
}
  
export default ViewItems;