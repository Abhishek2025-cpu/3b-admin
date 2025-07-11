import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// --- Reusable Helper Components ---

// A simple, reusable loader component
const Loader = () => (
  <div className="flex justify-center items-center py-20">
    <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Component to display a single product in an order
const ProductItem = ({ product }) => (
  <div className="flex items-center gap-4 py-2">
    <img
      src={product.image?.url || 'https://via.placeholder.com/150'}
      alt={product.productName || 'Product'}
      className="w-16 h-16 rounded-full object-cover bg-gray-200"
    />
    <div>
      <p className="font-semibold">{product.productName || 'N/A'}</p>
      <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
      <p className="text-sm text-gray-600">Price: ₹{product.priceAtPurchase}</p>
    </div>
  </div>
);

// --- Core Feature Components ---

// Manages the state and UI for a single order
const OrderCard = ({ order, onUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order.currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const statusOptions = [
    { label: '🕓 Pending', value: 'Pending' },
    { label: '✅ Confirmed', value: 'Confirmed' },
    { label: '📦 Shipped', value: 'Shipped' },
    { label: '🚚 Out for Delivery', value: 'Out for Delivery' },
    { label: '📬 Delivered', value: 'Delivered' },
    { label: '❌ Cancelled', value: 'Cancelled' },
  ];

  const currentStatusIndex = statusOptions.findIndex(opt => opt.value === order.currentStatus);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/orders/status/${order._id}`, {
        method: 'PATCH',
        // The 'Authorization' header has been removed.
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className="border border-dashed border-gray-300 rounded-lg p-4 mt-4 bg-gray-50">
      <div className="flex justify-between items-start text-sm mb-3">
        <div>
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Total:</strong> <span className="font-bold text-lg">₹{order.totalAmount || 'N/A'}</span></p>
        </div>
        <p className="text-gray-500 text-right">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="pl-5 border-l-2 border-gray-200">
        {order.products.map((p, index) => (
          <ProductItem key={index} product={p} />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <label className="font-bold block mb-2">Update Order Status:</label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="px-3 py-2 rounded-lg font-semibold text-sm border border-gray-300 bg-gray-100 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 border-none bg-green-600 text-white text-sm rounded-md cursor-pointer hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </button>
        </div>
        {message.text && (
          <p className={`mt-2 font-bold text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

// Groups all orders for a single user
const UserCard = ({ user, orders, onUpdate }) => (
  <div className="border border-gray-300 rounded-xl mb-8 p-5 bg-white shadow-lg">
    <div className="pb-3 border-b">
      <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      <p className="text-gray-600"><strong>Phone:</strong> {user.number}</p>
    </div>
    {orders.map(order => (
      <OrderCard key={order._id} order={order} onUpdate={onUpdate} />
    ))}
  </div>
);


// --- Main Page Component ---

function UserOrders() {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting to fetch orders..."); // 1. Check if the function runs

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
      
      console.log("API Response Status:", response.status); // 2. Check the HTTP status

      if (!response.ok) {
        throw new Error(`Server error (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log("Data received from API:", data); // 3. THIS IS THE MOST IMPORTANT LOG

      if (!data.success || !Array.isArray(data.orders)) {
        throw new Error(data.message || 'Invalid data format from server.');
      }
      setOrdersData(data.orders);
    } catch (err) {
      console.error("An error occurred during fetch:", err); // 4. Check for errors
      setError(err.message);
    } finally {
      setLoading(false);
    }
};

  // Fetch data on initial component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // In the UserOrders component, replace the old useMemo block with this one.

  const groupedByUser = useMemo(() => {
    if (!ordersData || ordersData.length === 0) {
      return [];
    }
    
    const userMap = new Map();

    ordersData.forEach(order => {
      // --- FIX: Check for 'order.user' instead of 'order.userId' ---
      // Also check that the user object actually has an ID.
      if (!order.user || !order.user._id) {
        // This will skip any orders that have malformed user data.
        return; 
      }

      // Get the user ID from the nested user object.
      const userId = order.user._id;

      // If we haven't seen this user ID before, create a new entry in our map.
      if (!userMap.has(userId)) {
        // The group will contain the full user object and an empty array for their orders.
        userMap.set(userId, { user: order.user, orders: [] });
      }

      // Add the current order to this user's list of orders.
      userMap.get(userId).orders.push(order);
    });

    // Sort orders for each user by date, newest first
    userMap.forEach(userData => {
      userData.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
    
    // Convert the map back to an array for rendering.
    return Array.from(userMap.values());
  }, [ordersData]); // This dependency array is correct.

  const renderContent = () => {
    if (loading) {
      return <Loader />;
    }
    if (error) {
      return <div className="text-center text-red-600 bg-red-100 p-4 rounded-md font-bold">{error}</div>;
    }
    if (groupedByUser.length === 0) {
      return <div className="text-center text-gray-500 text-xl p-4">No orders found.</div>;
    }
    return groupedByUser.map(({ user, orders }) => (
      <UserCard key={user._id} user={user} orders={orders} onUpdate={fetchOrders} />
    ));
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
      
        
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default UserOrders;