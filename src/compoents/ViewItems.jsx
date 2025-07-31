// src/components/ViewItems.jsx
import logo from '../assets/3b.png';
import React, { useState, useEffect, useMemo } from 'react';

/**
 * BillModal Component - **REVISED LAYOUT**
 * A modal that displays item details in a bill format, precisely replicating the provided design.
 */
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
          @media print {
            body * { visibility: hidden; }
            #bill-to-print, #bill-to-print * { visibility: visible; }
            #bill-to-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none;
              box-shadow: none;
              margin: 0;
              padding: 0;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>
      
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="relative w-full max-w-2xl">
          {/* --- Printable Area --- */}
                  {/* --- Printable Area (Final Corrected Layout) --- */}
          <div id="bill-to-print" className="bg-white p-1.5 rounded-xl">
            <div className="border-[14px] border-[#6A3E9D] rounded-lg p-6">
              
              <div className="grid grid-cols-5 gap-x-6">

                {/* --- LEFT COLUMN (LOGO & DETAILS) --- */}
                <div className="col-span-3 flex flex-col justify-between">
                  {/* Top Part: Logo & Company Name */}
                  <div>
                                     {/* Top Part: Logo & Company Name */}
                  <div>
                    {/* Replaced the text logo with a single image */}
                    <img src={logo} alt="3B Profiles Pvt Ltd Logo" className="h-76" />
              
                  </div>
                    {/* <p className="text-sm text-gray-500">www.3bprofilespvttltd.com</p> */}
                  </div>
                  
                  {/* Bottom Part: Item Specifics */}
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

                {/* --- RIGHT COLUMN (QR, IMAGE, BARCODE) --- */}
                <div className="col-span-2 flex flex-col justify-between items-center">
                  {/* QR Code */}
                  {item.qrCodeUrl && (
                    <img src={item.qrCodeUrl} alt="QR Code" className="w-28 h-28"/>
                  )}
                  
                  {/* Dashed Box for Product Image */}
                  <div className="w-full h-44 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center p-2 my-4">
                    <img src={item.productImageUrl} alt={item.itemNo} className="max-w-full max-h-full object-contain"/>
                  </div>
                  
                  {/* Barcode Placeholder */}
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
          
          {/* Action Buttons (will not be printed) */}
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


/**
 * ItemDetails Component
 */
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

/**
 * Main ViewItems Component
 */
function ViewItems() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemForBill, setSelectedItemForBill] = useState(null);

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

  const handleToggleRow = (itemId) => {
    setExpandedRowId(expandedRowId === itemId ? null : itemId);
  };
  
  const handleOpenBillModal = (item) => {
    setSelectedItemForBill(item);
    setIsModalOpen(true);
  };

  const handleCloseBillModal = () => {
    setIsModalOpen(false);
    setSelectedItemForBill(null);
  };

  if (isLoading) return <div className="text-center p-8">Loading items...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">View All Items</h2>
        <input 
          type="text"
          placeholder="Search by Item No, Operator, or Helper Name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-xl mb-4"
        />
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
              {filteredItems.length > 0 ? filteredItems.map(item => (
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
      </div>

      <BillModal 
        isOpen={isModalOpen} 
        onClose={handleCloseBillModal} 
        item={selectedItemForBill} 
      />
    </>
  );
}

export default ViewItems;