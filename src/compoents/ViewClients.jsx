import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, MapPin, ChevronLeft, ChevronRight, Users, UserX } from 'lucide-react';
import defaultAvatar from '../assets/3B_logo.png';

function ViewClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/auth/get-user-profiles');
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        const clientUsers = data.users.filter(user => user.role === 'client');
        setClients(clientUsers);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.number?.includes(searchQuery) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginate = (pageNumber) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-purple-600 font-medium animate-pulse">Fetching premium clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-100">
        <UserX className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-800">Oops! Something went wrong</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-4 md:p-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Client Directory
          </h2>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Users size={16} /> Total {clients.length} registered clients
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search name, email, or mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full md:w-80 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all outline-none"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-900">
                <th className="px-6 py-5 font-bold uppercase text-xs tracking-wider">Client Details</th>
                <th className="px-6 py-5 font-bold uppercase text-xs tracking-wider">Contact Info</th>
                <th className="px-6 py-5 font-bold uppercase text-xs tracking-wider">Shipping Addresses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode='wait'>
                {currentItems.length > 0 ? currentItems.map((client, idx) => (
                  <motion.tr 
                    key={client._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-purple-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={client.profileImage || defaultAvatar} 
                            alt={client.name} 
                            className="w-14 h-14 object-cover rounded-2xl ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all"
                            onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-base">{client.name || 'Anonymous'}</p>
                          <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Client</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <div className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-sm">{client.number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm truncate max-w-[180px]">{client.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.shippingAddresses && client.shippingAddresses.length > 0 ? (
                        <div className="relative max-w-[280px]">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 z-10">
                            <MapPin size={16} />
                          </div>
                          <select className="appearance-none w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none cursor-pointer text-gray-700">
                            {client.shippingAddresses.map((addr, index) => (
                              <option key={index}>
                                {`${addr.addressType}: ${addr.city}, ${addr.pincode}`}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight size={14} className="text-gray-400 rotate-90" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No addresses saved</span>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Search size={48} className="text-gray-200 mb-2" />
                        <p className="text-gray-500 font-medium">No clients match your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* --- Pagination UI --- */}
        {filteredClients.length > itemsPerPage && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 font-medium">
              Showing <span className="text-purple-600 font-bold">{indexOfFirstItem + 1}</span> to{' '}
              <span className="text-purple-600 font-bold">{Math.min(indexOfLastItem, filteredClients.length)}</span> of {filteredClients.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl border transition-all ${
                  currentPage === 1 
                  ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                  : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-600 hover:text-white shadow-sm'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      currentPage === index + 1
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                        : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-100'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl border transition-all ${
                  currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed' 
                  : 'bg-white text-purple-600 border-purple-100 hover:bg-purple-600 hover:text-white shadow-sm'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ViewClients;