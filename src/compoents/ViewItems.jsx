// src/components/ViewItems.jsx
import logo from '../assets/3b.png';
import React, { useState, useEffect, useMemo } from 'react';

// --- BillModal with Print-Specific CSS Fixes ---
const BillModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const profileCodes = [item.operator?.eid, item.helper?.eid]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <style>
        {`
          /* Defines the printable area margins on the physical page. */
          @page {
            size: A4;
            margin: 1.5cm;
          }

          @media print {
            /* Hide everything on the page by default */
            body * {
              visibility: hidden;
            }
            
            /* Make the printable section and its children visible */
            #bill-to-print, #bill-to-print * {
              visibility: visible;
            }

            /* 
             * SOLUTION 1: Correctly position the print container.
             * By removing 'position: absolute', the element will now respect the '@page'
             * margins and start at the top of the printable area, fixing the alignment.
             */
            #bill-to-print {
              position: static;
              margin: 0;
              padding: 0;
              width: auto;
              border: none;
              box-shadow: none;
              page-break-inside: avoid; /* Prevents the bill from being split across pages */
            }

            .no-print {
              display: none !important;
            }

            /* 
             * SOLUTION 2: Override on-screen layout ONLY for printing to prevent overflow.
             * These rules target elements within the bill and compact their layout
             * to ensure they fit on a single page, fixing the "repeating" issue.
             * These have NO effect on the on-screen appearance.
            */

            /* Target the logo by its 'alt' tag to reduce its height for print */
            #bill-to-print img[alt="3B Profiles Pvt Ltd Logo"] {
              height: 5rem !important; /* Was h-76 (19rem) */
            }

            /* Target the main flex containers and change their alignment to be compact */
            #bill-to-print .flex.flex-col.justify-between {
                justify-content: flex-start !important;
                gap: 1.5rem !important;
            }
            
            /* Target the dashed image box and reduce its height for print */
            #bill-to-print .h-44 {
                height: 9rem !important; /* Was h-44 (11rem) */
            }
          }
        `}
      </style>
      
      {/* The JSX below is UNCHANGED from your original to preserve the on-screen layout. */}
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="relative w-full max-w-2xl">
          <div id="bill-to-print" className="bg-white p-1.5 rounded-xl">
            <div className="border-[14px] border-[#6A3E9D] rounded-lg p-6">
              <div className="grid grid-cols-5 gap-x-6">
                <div className="col-span-3 flex flex-col justify-between">
                  <div>
                    <img src={logo} alt="3B Profiles Pvt Ltd Logo" className="h-76" />
                  </div>
                  <div>
                    <hr className="my-4 border-gray-400"/>
                    <div className="space-y-3 text-base">
                      <div className="flex">
                        <span className="w-32 font-semibold text-gray-800">Profile Code</span>
                        <span className="flex-1 border-b border-gray-500 text-center font-mono">{profileCodes || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-semibold text-gray-800">Height (m)</span>
                        <span className="flex-1 border-b border-gray-500 text-center font-mono">{item.length || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="w-32 font-semibold text-gray-800">Qty per Box</span>
                        <span className="flex-1 border-b border-gray-500 text-center font-mono">{item.noOfSticks || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex flex-col justify-between items-center">
                  {item.qrCodeUrl && (
                    <img src={item.qrCodeUrl} alt="QR Code" className="w-28 h-28"/>
                  )}
                  <div className="w-full h-44 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center p-2 my-4">
                    <img src={item.productImageUrl} alt={item.itemNo} className="max-w-full max-h-full object-contain"/>
                  </div>
                  <div className="w-full flex h-8 items-end justify-center gap-px overflow-hidden">
                      <div className="w-1 bg-black h-full"></div><div className="w-px bg-black h-3/4"></div>
                      <div className="w-1 bg-black h-full"></div><div className="w-px bg-black h-full"></div>
                      <div className="w-px bg-black h-1/2"></div><div className="w-1 bg-black h-3/4"></div>
                      <div className="w-px bg-black h-full"></div><div className="w-1 bg-black h-1/2"></div>
                      <div className="w-1 bg-black h-full"></div><div className="w-px bg-black h-3/4"></div>
                      <div className="w-1 bg-black h-full"></div><div className="w-1 bg-black h-full"></div>
                      <div className="w-px bg-black h-1/2"></div><div className="w-px bg-black h-3/4"></div>
                      <div className="w-1 bg-black h-full"></div><div className="w-px bg-black h-1/2"></div>
                      <div className="w-1 bg-black h-3/4"></div><div className="w-1 bg-black h-full"></div>
                      <div className="w-px bg-black h-full"></div><div className="w-px bg-black h-1/2"></div>
                      <div className="w-px bg-black h-3/4"></div><div className="w-1 bg-black h-full"></div>
                      <div className="w-px bg-black h-1/2"></div><div className="w-1 bg-black h-full"></div>
                      <div className="w-1 bg-black h-3/4"></div><div className="w-px bg-black h-full"></div>
                      <div className="w-1 bg-black h-full"></div><div className="w-px bg-black h-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="no-print mt-4 flex justify-end gap-3">
            <button
              onClick={handlePrint}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


// --- (No changes to the rest of the file) ---
const ItemDetails = ({ item, onGetBillClick }) => (
  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50">
    <div>
      <p className="font-semibold text-gray-700">Length:</p>
      <p>{item.length}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700">Shift:</p>
      <p>{item.shift}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700">Company:</p>
      <p>{item.company}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700">Created At:</p>
      <p>{new Date(item.createdAt).toLocaleString()}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700">Operator EID:</p>
      <p>{item.operator?.eid || 'N/A'}</p>
    </div>
    <div>
      <p className="font-semibold text-gray-700">Helper EID:</p>
      <p>{item.helper?.eid || 'N/A'}</p>
    </div>
    <div className="flex flex-col items-center justify-center">
      <p className="font-semibold text-gray-700 mb-2">QR Code:</p>
      {item.qrCodeUrl ? (
          <img 
              src={item.qrCodeUrl} 
              alt={`QR Code for ${item.itemNo}`} 
              className="w-24 h-24 object-contain rounded-lg border p-1" 
          />
      ) : <p>N/A</p>}
    </div>
    <div className="flex items-center justify-center">
      <button
        onClick={() => onGetBillClick(item)}
        className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-300"
      >
        Get Bill
      </button>
    </div>
  </div>
);
const AddItemModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [imageFileName, setImageFileName] = useState('');
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setImageFileName(event.target.files[0].name);
        } else {
            setImageFileName('');
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted!");
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-28" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-3xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mx-auto">Add New Item</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-gray-500">
                            <option value="">Select Item</option>
                        </select>
                        <input type="text" placeholder="No of Pieces" className="w-full p-3 border border-gray-300 rounded-lg"/>
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-gray-500">
                            <option value="">Select Operator</option>
                        </select>
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-gray-500">
                            <option value="">Select Company</option>
                        </select>
                        <input type="text" defaultValue="9.5 Feet" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly/>
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-gray-500">
                            <option value="">Select Helper</option>
                        </select>
                        <select className="w-full p-3 border border-gray-300 rounded-lg text-gray-500">
                            <option value="">Select Shift</option>
                        </select>
                        <div>
                            <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                            <label className="w-full flex items-center px-3 py-2.5 border border-gray-300 rounded-lg cursor-pointer text-gray-500">
                                <span className="flex-grow truncate">{imageFileName || 'Choose File No file chosen'}</span>
                                <input id="product-image" name="product-image" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button type="submit" className="w-full bg-[#6A3E9D] hover:bg-#6A3E9D-700 text-white font-bold py-3 px-4 rounded-lg transition-colors cursor-pointer">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
function ViewItems() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItemForBill, setSelectedItemForBill] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items');
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchItems();
  }, []);
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.itemNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.helper?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const handleToggleRow = (itemId) => {
    setExpandedRowId(expandedRowId === itemId ? null : itemId);
  };
  const handleOpenBillModal = (item) => {
    setSelectedItemForBill(item);
    setIsBillModalOpen(true);
  };
  const handleCloseBillModal = () => {
    setIsBillModalOpen(false);
    setSelectedItemForBill(null);
  };
  if (isLoading) return <div className="text-center p-8">Loading items...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  return (
    <>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">View All Items</h2>
            <div className="flex items-center gap-4">
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-64 p-2 border rounded-xl"
                />
                <button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Item
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Item No</th>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Helper</th>
                <th className="px-6 py-3">No of Sticks</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map(item => (
                <React.Fragment key={item._id}>
                  <tr className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.itemNo}</td>
                    <td className="px-6 py-4">
                      <img src={item.productImageUrl} alt={item.itemNo} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4">{item.operator?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{item.helper?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{item.noOfSticks}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.stockStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleRow(item._id)}
                        className="font-medium text-blue-600 hover:underline mr-4"
                      >
                        {expandedRowId === item._id ? 'Close' : 'View'}
                      </button>
                      <button className="font-medium text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                  {expandedRowId === item._id && (
                    <tr className="border-b">
                      <td colSpan="7" className="p-0">
                        <ItemDetails item={item} onGetBillClick={handleOpenBillModal} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-8">No items found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="mt-6 flex justify-end items-center gap-3">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        )}
      </div>
      <AddItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)} 
      />
      <BillModal 
        isOpen={isBillModalOpen} 
        onClose={handleCloseBillModal} 
        item={selectedItemForBill} 
      />
    </>
  );
}

export default ViewItems;