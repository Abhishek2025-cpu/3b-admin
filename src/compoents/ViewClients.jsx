// src/components/ViewClients.jsx

import React, { useState, useEffect, useMemo } from 'react';
import defaultAvatar from '../assets/3B_logo.png'; // A fallback image

function ViewClients() {
  // State for storing clients, loading status, and errors
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Ek page par kitne clients dikhane hain

  // Fetch data when the component mounts
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/auth/get-user-profiles');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        const clientUsers = data.users.filter(user => user.role === 'client');
        setClients(clientUsers);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching clients:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClients();
  }, []);

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    // Reset to page 1 whenever search query changes
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.number?.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Search badalne par hamesha page 1 par le jao
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div className="text-center p-8 text-lg font-semibold">Loading clients...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-lg font-semibold text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">All Clients</h2>
      
      <div className="mb-4">
        <input 
          type="text"
          placeholder="Search by Name, Mobile, or Email..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-purple-700 uppercase bg-purple-50">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Mobile</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 min-w-[250px]">Shipping Addresses</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map(client => (
              <tr key={client._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                <td className="px-6 py-4">
                  <img 
                    src={client.profileImage || defaultAvatar} 
                    alt={client.name} 
                    className="w-16 h-20 object-cover rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {client.name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {client.number || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {client.email || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {client.shippingAddresses && client.shippingAddresses.length > 0 ? (
                    <select className="form-select w-full p-2 border border-gray-300 rounded-lg bg-white">
                      {client.shippingAddresses.map((addr, index) => (
                        <option key={index}>
                          {`${addr.addressType}: ${addr.detailedAddress}, ${addr.city}, ${addr.pincode}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-400">No Address Provided</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No clients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination UI --- */}
      {filteredClients.length > itemsPerPage && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(indexOfLastItem, filteredClients.length)}
            </span>{' '}
            of <span className="font-semibold">{filteredClients.length}</span> results
          </span>

          <nav className="inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 ml-0 leading-tight border border-gray-300 rounded-l-lg hover:bg-gray-100 ${
                currentPage === 1 ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white text-gray-500'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-2 leading-tight border border-gray-300 ${
                  currentPage === index + 1
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 leading-tight border border-gray-300 rounded-r-lg hover:bg-gray-100 ${
                currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white text-gray-500'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default ViewClients;