import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComments, FaFileInvoice } from 'react-icons/fa';

// --- Reusable Helper Components ---

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

const ProductItem = ({ product }) => (
  <div className="flex items-start gap-4 py-3">
    <img
      src={product.image?.url || 'https://via.placeholder.com/150'}
      alt={product.productName || 'Product'}
      className="w-10 h-10 rounded-md object-cover bg-gray-200 shadow-sm flex-shrink-0"
    />
    <div className="flex-grow">
      <p className="font-semibold text-gray-800 text-sm">{product.productName || 'N/A'}</p>
      {product.company?.name && (
        <p className="text-xs text-gray-500 mt-0.5">
          Sold by: <span className="font-medium text-gray-600">{product.company.name}</span>
        </p>
      )}
      {product.materialName && (
        <p className="text-xs text-gray-500 mt-0.5">
          Material: <span className="font-medium text-gray-600">{product.materialName}</span>
        </p>
      )}
      <div className="flex items-center gap-4 mt-1">
        <p className="text-xs text-gray-600">Qty: {product.quantity}</p>
        <p className="text-xs text-gray-600">Price: ₹{product.priceAtPurchase}</p>
      </div>
    </div>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
      >
        Previous
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`px-4 py-2 text-sm font-medium rounded-md border ${
            currentPage === number
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
      >
        Next
      </button>
    </nav>
  );
};

// NEW: Extracted OrderTableRow into its own component
const OrderTableRow = ({ order, onUpdateOrderList }) => {
  const [currentStatus, setCurrentStatus] = useState(order.currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const isBillGeneratable = order.currentStatus === 'Delivered';

  const statusOptions = [
    { label: '🕓 Pending', value: 'Pending' }, { label: '✅ Confirmed', value: 'Confirmed' },
    { label: '📦 Shipped', value: 'Shipped' }, { label: '🚚 Out for Delivery', value: 'Out for Delivery' },
    { label: '📬 Delivered', value: 'Delivered' }, { label: '❌ Cancelled', value: 'Cancelled' },
  ];
  const currentStatusIndex = statusOptions.findIndex(opt => opt.value === order.currentStatus);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/orders/status/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: currentStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update status');
      setMessage({ text: '✅ Status updated successfully!', type: 'success' });
      // Call the prop function to notify the parent to re-fetch/update its list
      if (onUpdateOrderList) {
        onUpdateOrderList();
      }
    } catch (error) {
      setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
      setCurrentStatus(order.currentStatus); // Revert on error
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  const handleChatClick = useCallback(() => {
    if (order.user?._id) {
      navigate(`/manager/chats/${order.user._id}`);
    } else {
      console.error("User ID is missing, cannot navigate to chat.");
    }
  }, [navigate, order.user?._id]);


  return (
    <tr key={order._id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.user?.name || 'N/A'}</div>
        <div className="text-xs text-gray-500">{order.user?.email || 'N/A'}</div>
        <div className="text-xs text-gray-500">{order.user?.number || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 max-w-sm">
        <div className="max-h-24 overflow-y-auto custom-scrollbar">
          {order.products.map((p, idx) => (
            <ProductItem key={idx} product={p} />
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{order.totalAmount || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex flex-col items-start">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="px-2 py-1 rounded-md text-xs border border-gray-300 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((opt, index) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={order.currentStatus !== 'Cancelled' && index < currentStatusIndex}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || currentStatus === order.currentStatus}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
          {message.text && (
            <p className={`mt-1 text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleChatClick}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-colors justify-center"
          >
            <FaComments />
            <span>Chat</span>
          </button>
          <button
            disabled={!isBillGeneratable}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-md hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed justify-center"
          >
            <FaFileInvoice />
            <span>Bill</span>
          </button>
        </div>
      </td>
    </tr>
  );
};


// --- Main Page Component ---

const ITEMS_PER_PAGE = 10;

function UserOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Removed useNavigate from here, as it's now used in OrderTableRow

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
      if (!response.ok) throw new Error(`Server error (Status: ${response.status})`);
      const data = await response.json();
      if (!data.success || !Array.isArray(data.orders)) {
        throw new Error(data.message || 'Invalid data format from server.');
      }
      setOrdersData(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const sortedAndFilteredOrders = useMemo(() => {
    let filtered = ordersData;

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        const userNameMatch = order.user?.name.toLowerCase().includes(query);
        const userEmailMatch = order.user?.email.toLowerCase().includes(query);
        const userNumberMatch = order.user?.number?.includes(query);
        const orderIdMatch = order.orderId?.toLowerCase().includes(query);
        return userNameMatch || userEmailMatch || userNumberMatch || orderIdMatch;
      });
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ordersData, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFilteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedAndFilteredOrders, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedAndFilteredOrders.length / ITEMS_PER_PAGE);
  }, [sortedAndFilteredOrders]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const renderContent = () => {
    if (loading) return <Loader />;
    if (error) return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md font-bold">{error}</div>;
    if (paginatedOrders.length === 0) {
      return <div className="text-center text-gray-500 text-xl p-8">No orders found.</div>;
    }

    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID & Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Products
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedOrders.map(order => (
              <OrderTableRow key={order._id} order={order} onUpdateOrderList={fetchOrders} />
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto"> {/* Increased max-width for table */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Customer Orders</h1>
          <div className="relative w-full max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or Order ID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
            />
          </div>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default UserOrders;