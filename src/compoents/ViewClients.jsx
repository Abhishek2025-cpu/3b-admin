// src/components/ViewClients.jsx

import React, { useState, useEffect, useMemo } from 'react';
import defaultAvatar from '../assets/3b_logo.png'; // A fallback image

function ViewClients() {
  // State for storing clients, loading status, and errors
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data when the component mounts
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/auth/get-user-profiles');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        // Filter for users with the 'client' role
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
  }, []); // The empty dependency array ensures this runs only once

  // Memoized filtering to avoid re-calculating on every render
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.number?.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Conditional rendering based on state
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
            {filteredClients.length > 0 ? filteredClients.map(client => (
              <tr key={client._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                <td className="px-6 py-4">
                  <img 
                    src={client.profileImage || defaultAvatar} 
                    alt={client.name} 
                    className="w-16 h-20 object-cover rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} // Fallback if image link is broken
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
      {/* Pagination component can be added here if needed */}
    </div>
  );
}

export default ViewClients;