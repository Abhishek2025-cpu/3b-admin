// import React, { useState, useEffect, useMemo } from 'react';
// // Importing necessary icons from react-icons
// import { FaSearch, FaComments, FaFileInvoice } from 'react-icons/fa';

// // --- Reusable Helper Components ---

// // A simple, reusable loader component
// const Loader = () => (
//   <div className="flex justify-center items-center py-20">
//     <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
//   </div>
// );

// // Component to display a single product in an order
// const ProductItem = ({ product }) => (
//   <div className="flex items-center gap-4 py-3">
//     <img
//       src={product.image?.url || 'https://via.placeholder.com/150'}
//       alt={product.productName || 'Product'}
//       className="w-14 h-14 rounded-lg object-cover bg-gray-200 shadow-sm"
//     />
//     <div>
//       <p className="font-semibold text-gray-800">{product.productName || 'N/A'}</p>
//       <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
//       <p className="text-sm text-gray-600">Price: ₹{product.priceAtPurchase}</p>
//     </div>
//   </div>
// );

// // New Reusable Pagination Component
// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//   if (totalPages <= 1) return null;

//   const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

//   return (
//     <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
//       >
//         Previous
//       </button>
//       {pageNumbers.map(number => (
//         <button
//           key={number}
//           onClick={() => onPageChange(number)}
//           className={`px-4 py-2 text-sm font-medium rounded-md border ${
//             currentPage === number
//               ? 'bg-blue-600 text-white border-blue-600'
//               : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
//           }`}
//         >
//           {number}
//         </button>
//       ))}
//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
//       >
//         Next
//       </button>
//     </nav>
//   );
// };

// // --- Core Feature Components ---

// // Manages the state and UI for a single order (Redesigned)
// const OrderCard = ({ order, onUpdate }) => {
//   const [currentStatus, setCurrentStatus] = useState(order.currentStatus);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   const isBillGeneratable = order.currentStatus === 'Delivered';

//   const statusOptions = [
//     { label: '🕓 Pending', value: 'Pending' },
//     { label: '✅ Confirmed', value: 'Confirmed' },
//     { label: '📦 Shipped', value: 'Shipped' },
//     { label: '🚚 Out for Delivery', value: 'Out for Delivery' },
//     { label: '📬 Delivered', value: 'Delivered' },
//     { label: '❌ Cancelled', value: 'Cancelled' },
//   ];

//   const currentStatusIndex = statusOptions.findIndex(opt => opt.value === order.currentStatus);

//   const handleStatusUpdate = async () => {
//     setIsUpdating(true);
//     setMessage({ text: '', type: '' });
//     try {
//       const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/orders/status/${order._id}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ newStatus: currentStatus }),
//       });
//       const result = await response.json();
//       if (!response.ok) throw new Error(result.message || 'Failed to update status');
//       setMessage({ text: '✅ Status updated successfully!', type: 'success' });
//       if (onUpdate) onUpdate();
//     } catch (error) {
//       setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
//       setCurrentStatus(order.currentStatus);
//     } finally {
//       setIsUpdating(false);
//       setTimeout(() => setMessage({ text: '', type: '' }), 4000);
//     }
//   };

//   return (
//     <div className="border border-gray-200 rounded-lg p-5 mt-4 bg-white">
//       <div className="flex justify-between items-start text-sm mb-4">
//         <div>
//           <p className="font-semibold text-gray-800">Order ID: {order.orderId}</p>
//           <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
//         </div>
//         <p className="text-right">
//           <span className="text-gray-600">Total: </span>
//           <span className="font-bold text-xl text-gray-900">₹{order.totalAmount || 'N/A'}</span>
//         </p>
//       </div>

//       <div className="pl-4 border-l-2 border-gray-200 space-y-2">
//         {order.products.map((p, index) => <ProductItem key={index} product={p} />)}
//       </div>
      
//       <div className="flex flex-wrap justify-between items-end gap-4 mt-5 pt-4 border-t border-gray-200">
//         {/* Status Update Section */}
//         <div>
//           <label className="font-bold text-sm text-gray-700 block mb-2">Update Status:</label>
//           <div className="flex items-center gap-2">
//             <select
//               value={currentStatus}
//               onChange={(e) => setCurrentStatus(e.target.value)}
//               className="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               {statusOptions.map((opt, index) => (
//                 <option key={opt.value} value={opt.value} disabled={order.currentStatus !== 'Cancelled' && index < currentStatusIndex}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleStatusUpdate}
//               disabled={isUpdating || currentStatus === order.currentStatus}
//               className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               {isUpdating ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//            {message.text && (
//             <p className={`mt-2 font-semibold text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
//               {message.text}
//             </p>
//           )}
//         </div>

//         {/* Action Buttons Section */}
//         <div className="flex items-center gap-3">
//           <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors">
//             <FaComments />
//             <span>Chat</span>
//           </button>
//           <button
//             disabled={!isBillGeneratable}
//             className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
//           >
//             <FaFileInvoice />
//             <span>Generate Bill</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Groups all orders for a single user (Redesigned)
// const UserCard = ({ user, orders, onUpdate }) => (
//   <div className="border border-gray-200 rounded-xl mb-8 p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
//     <div className="pb-4 border-b border-gray-200">
//       <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
//       <p className="text-gray-600">{user.email}</p>
//       <p className="text-gray-600"><strong>Phone:</strong> {user.number}</p>
//     </div>
//     {orders.map(order => (
//       <OrderCard key={order._id} order={order} onUpdate={onUpdate} />
//     ))}
//   </div>
// );

// // --- Main Page Component ---

// const ITEMS_PER_PAGE = 5; // Number of user cards per page

// function UserOrders() {
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);

//   const fetchOrders = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
//       if (!response.ok) throw new Error(`Server error (Status: ${response.status})`);
//       const data = await response.json();
//       if (!data.success || !Array.isArray(data.orders)) {
//         throw new Error(data.message || 'Invalid data format from server.');
//       }
//       setOrdersData(data.orders);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Memoized derivation of data for filtering and pagination
//   const processedData = useMemo(() => {
//     if (!ordersData || ordersData.length === 0) {
//       return { usersToDisplay: [], totalPages: 0 };
//     }

//     const userMap = new Map();
//     ordersData.forEach(order => {
//       if (!order.user || !order.user._id) return;
//       const userId = order.user._id;
//       if (!userMap.has(userId)) {
//         userMap.set(userId, { user: order.user, orders: [] });
//       }
//       userMap.get(userId).orders.push(order);
//     });

//     userMap.forEach(userData => {
//       userData.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     });

//     const allGroupedUsers = Array.from(userMap.values());

//     // Filter based on search query
//     const filteredUsers = allGroupedUsers.filter(group => {
//       const query = searchQuery.toLowerCase().trim();
//       if (!query) return true;
//       const userNameMatch = group.user.name.toLowerCase().includes(query);
//       const userEmailMatch = group.user.email.toLowerCase().includes(query);
//       const userNumberMatch = group.user.number?.includes(query);
//       const orderIdMatch = group.orders.some(order => order.orderId.toLowerCase().includes(query));
//       return userNameMatch || userEmailMatch || userNumberMatch || orderIdMatch;
//     });

//     // Paginate the filtered results
//     const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     const usersToDisplay = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//     return { usersToDisplay, totalPages };
//   }, [ordersData, searchQuery, currentPage]);

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1); // Reset to first page on new search
//   };
  
//   const renderContent = () => {
//     if (loading) return <Loader />;
//     if (error) return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md font-bold">{error}</div>;
//     if (processedData.usersToDisplay.length === 0) {
//       return <div className="text-center text-gray-500 text-xl p-8">No orders found.</div>;
//     }
//     return (
//       <>
//         {processedData.usersToDisplay.map(({ user, orders }) => (
//           <UserCard key={user._id} user={user} orders={orders} onUpdate={fetchOrders} />
//         ))}
//         <Pagination
//           currentPage={currentPage}
//           totalPages={processedData.totalPages}
//           onPageChange={setCurrentPage}
//         />
//       </>
//     );
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
//       <div className="max-w-5xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-800 mb-4">Customer Orders</h1>
//           <div className="relative w-full max-w-lg">
//             <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by name, email, phone or Order ID..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
//             />
//           </div>
//         </header>
        
//         <main>
//           {renderContent()}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default UserOrders;


// src/components/UserOrders.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComments, FaFileInvoice } from 'react-icons/fa';

// --- Reusable Helper Components ---

const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
);

// --- MODIFIED COMPONENT ---
// Updated to conditionally display company and material name
const ProductItem = ({ product }) => (
  <div className="flex items-start gap-4 py-3">
    <img
      src={product.image?.url || 'https://via.placeholder.com/150'}
      alt={product.productName || 'Product'}
      className="w-14 h-14 rounded-lg object-cover bg-gray-200 shadow-sm flex-shrink-0"
    />
    <div className="flex-grow">
      <p className="font-semibold text-gray-800">{product.productName || 'N/A'}</p>
      
      {/* NEW: Conditionally render company name */}
      {product.company?.name && (
        <p className="text-xs text-gray-500 mt-0.5">
          Sold by: <span className="font-medium text-gray-600">{product.company.name}</span>
        </p>
      )}

      {/* NEW: Conditionally render material name */}
      {product.materialName && (
        <p className="text-xs text-gray-500 mt-0.5">
          Material: <span className="font-medium text-gray-600">{product.materialName}</span>
        </p>
      )}

      <div className="flex items-center gap-4 mt-1.5">
        <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
        <p className="text-sm text-gray-600">Price: ₹{product.priceAtPurchase}</p>
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

// --- Core Feature Components ---

const OrderCard = ({ order, onUpdate }) => {
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

  const handleChatClick = () => {
    if (order.user?._id) {
      navigate(`/manager/chats/${order.user._id}`);
    } else {
      console.error("User ID is missing, cannot navigate to chat.");
    }
  };

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
      if (onUpdate) onUpdate();
    } catch (error) {
      setMessage({ text: `❌ Error: ${error.message}`, type: 'error' });
      setCurrentStatus(order.currentStatus);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 mt-4 bg-white">
      <div className="flex justify-between items-start text-sm mb-4">
        <div>
          <p className="font-semibold text-gray-800">Order ID: {order.orderId}</p>
          <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <p className="text-right">
          <span className="text-gray-600">Total: </span>
          <span className="font-bold text-xl text-gray-900">₹{order.totalAmount || 'N/A'}</span>
        </p>
      </div>
      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
        {order.products.map((p, index) => <ProductItem key={index} product={p} />)}
      </div>
      <div className="flex flex-wrap justify-between items-end gap-4 mt-5 pt-4 border-t border-gray-200">
        <div>
          <label className="font-bold text-sm text-gray-700 block mb-2">Update Status:</label>
          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt, index) => (
                <option key={opt.value} value={opt.value} disabled={order.currentStatus !== 'Cancelled' && index < currentStatusIndex}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || currentStatus === order.currentStatus}
              className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
           {message.text && (
            <p className={`mt-2 font-semibold text-xs ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleChatClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaComments />
            <span>Chat</span>
          </button>
          <button
            disabled={!isBillGeneratable}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FaFileInvoice />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const UserCard = ({ user, orders, onUpdate }) => (
  <div className="border border-gray-200 rounded-xl mb-8 p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
    <div className="pb-4 border-b border-gray-200">
      <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-gray-600"><strong>Phone:</strong> {user.number}</p>
    </div>
    {orders.map(order => (
      <OrderCard key={order._id} order={order} onUpdate={onUpdate} />
    ))}
  </div>
);

// --- Main Page Component ---

const ITEMS_PER_PAGE = 5;

function UserOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  const processedData = useMemo(() => {
    if (!ordersData || ordersData.length === 0) {
      return { usersToDisplay: [], totalPages: 0 };
    }
    const userMap = new Map();
    ordersData.forEach(order => {
      if (!order.user?._id) return;
      userMap.set(order.user._id, userMap.get(order.user._id) || { user: order.user, orders: [] });
      userMap.get(order.user._id).orders.push(order);
    });
    userMap.forEach(userData => {
      userData.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    const filteredUsers = Array.from(userMap.values()).filter(group => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        group.user.name.toLowerCase().includes(query) ||
        group.user.email.toLowerCase().includes(query) ||
        group.user.number?.includes(query) ||
        group.orders.some(order => order.orderId.toLowerCase().includes(query))
      );
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const usersToDisplay = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return { usersToDisplay, totalPages };
  }, [ordersData, searchQuery, currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  
  const renderContent = () => {
    if (loading) return <Loader />;
    if (error) return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md font-bold">{error}</div>;
    if (processedData.usersToDisplay.length === 0) {
      return <div className="text-center text-gray-500 text-xl p-8">No orders found.</div>;
    }
    return (
      <>
        {processedData.usersToDisplay.map(({ user, orders }) => (
          <UserCard key={user._id} user={user} orders={orders} onUpdate={fetchOrders} />
        ))}
        <Pagination
          currentPage={currentPage}
          totalPages={processedData.totalPages}
          onPageChange={setCurrentPage}
        />
      </>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
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