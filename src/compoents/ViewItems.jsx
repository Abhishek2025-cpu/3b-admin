// src/components/ViewItems.jsx
import React, { useState, useEffect, useMemo } from 'react';

function ViewItems() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items');
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setItems(data || []);
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
      item.helper?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  if (isLoading) return <div className="text-center p-8">Loading items...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">View All Items</h2>
      <input 
        type="text"
        placeholder="Search by Item No or Helper Name..."
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
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{item.itemNo}</td>
                <td className="px-6 py-4">
                  <img src={item.productImageUrl} alt={item.itemNo} className="w-16 h-16 object-cover rounded" />
                </td>
                <td className="px-6 py-4">{item.operator?.name || 'N/A'}</td>
                <td className="px-6 py-4">{item.stockStatus || 'N/A'}</td>
                <td className="px-6 py-4">
                  <button className="font-medium text-blue-600 hover:underline mr-4">View</button>
                  <button className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-8">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination and Modals would be added here */}
    </div>
  );
}

export default ViewItems;