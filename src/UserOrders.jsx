import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaComments, FaFileInvoice, FaSyncAlt } from 'react-icons/fa'; // Added FaSyncAlt for return
import Swal from "sweetalert2";
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

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const sidePages = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - sidePages);
      let endPage = Math.min(totalPages - 1, currentPage + sidePages);

      if (currentPage <= sidePages + 1) {
        endPage = maxPagesToShow - 1;
      }
      if (currentPage >= totalPages - sidePages) {
        startPage = totalPages - maxPagesToShow + 2;
      }

      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      if (!pageNumbers.includes(totalPages)) {
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-end items-center gap-2 mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
      >
        Previous
      </button>
      {pageNumbers.map((number, index) => (
        number === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-gray-700">...</span>
        ) : (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 text-sm font-medium rounded-md border ${
              currentPage === number
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300'
            }`}
          >
            {number}
          </button>
        )
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
      >
        Next
      </button>
    </nav>
  );
};


const OrderTableRow = ({ order, onUpdateOrderList }) => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(order.currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAcceptingReturn, setIsAcceptingReturn] = useState(false);

  // ✅ Use order.returnEligible if available, else check delivered
  const [isReturnButtonEnabled, setIsReturnButtonEnabled] = useState(
    order.returnEligible !== undefined
      ? order.returnEligible
      : order.currentStatus === "Delivered"
  );

  const isBillGeneratable = order.currentStatus === "Delivered";

  const statusOptions = [
    { label: "🕓 Pending", value: "Pending" },
    { label: "✅ Confirmed", value: "Confirmed" },
    { label: "📦 Shipped", value: "Shipped" },
    { label: "🚚 Out for Delivery", value: "Out for Delivery" },
    { label: "📬 Delivered", value: "Delivered" },
    { label: "❌ Cancelled", value: "Cancelled" },
  ];
  const currentStatusIndex = statusOptions.findIndex(
    (opt) => opt.value === order.currentStatus
  );

  // -------------------- UPDATE STATUS --------------------
  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `https://threebapi-1067354145699.asia-south1.run.app/api/orders/status/${order._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: currentStatus }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update status");

      Swal.fire("✅ Success", "Order status updated successfully!", "success");

      // Enable return button if delivered
      setIsReturnButtonEnabled(currentStatus === "Delivered");

      if (onUpdateOrderList) onUpdateOrderList();
    } catch (err) {
      Swal.fire("❌ Error", err.message, "error");
      setCurrentStatus(order.currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------- ACCEPT RETURN --------------------
  const handleAcceptReturn = async () => {
    const confirmed = await Swal.fire({
      title: "Accept Return?",
      text: "Are you sure you want to accept this return request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Accept",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    setIsAcceptingReturn(true);
    try {
      const res = await fetch(
        `https://threebapi-1067354145699.asia-south1.run.app/api/orders/${order._id}/return-eligibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eligible: true }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to accept return");

      Swal.fire("✅ Return Accepted", "The return has been accepted successfully!", "success");

      // ✅ Disable button after success
      setIsReturnButtonEnabled(false);

      // Optional: trigger refresh of parent list
      if (onUpdateOrderList) onUpdateOrderList();
    } catch (err) {
      Swal.fire("❌ Error", err.message, "error");
    } finally {
      setIsAcceptingReturn(false);
    }
  };

  const handleChatClick = useCallback(() => {
    if (order.user?._id) navigate(`/manager/chats/${order.user._id}`);
  }, [navigate, order.user?._id]);

  return (
    <tr key={order._id}>
      {/* Order Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{order.orderId}</div>
        <div className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleString()}
        </div>
      </td>

      {/* User Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.user?.name || "N/A"}</div>
        <div className="text-xs text-gray-500">{order.user?.email || "N/A"}</div>
        <div className="text-xs text-gray-500">{order.user?.number || "N/A"}</div>
      </td>

      {/* Products */}
   {/* Products */}
<td className="px-6 py-4 max-w-sm">
  <div className="max-h-32 overflow-y-auto space-y-3">
    {order.products.map((p, i) => (
      <div
        key={i}
        className="flex items-start space-x-3 border-b pb-2 last:border-none"
      >
        <img
          src={p.image?.url}
          alt={p.productName}
          className="w-10 h-10 rounded object-cover border"
        />
        <div className="flex flex-col text-xs text-gray-700">
          <span className="font-semibold text-gray-900">{p.productName}</span>
          {p.selectedSize && <span>Size: {p.selectedSize}</span>}
          {p.color && <span>Color: {p.color}</span>}
          {p.materialName && <span>Material: {p.materialName}</span>}
          {p.modelNo && <span>Model No: {p.modelNo}</span>}
          {p.totalPiecesPerBox && (
            <span>Pieces/Box: {p.totalPiecesPerBox}</span>
          )}
          <span>Qty: {p.quantity}</span>
          <span>Price: ₹{p.priceAtPurchase}</span>
          <span>Total: ₹{p.totalPrice}</span>
          {p.company?.name && (
            <span className="text-gray-500 italic">
              Company: {p.company.name}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
</td>


      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{order.totalAmount || "N/A"}
      </td>

      {/* Status Dropdown */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex flex-col items-start">
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            className="px-2 py-1 rounded-md text-xs border border-gray-300 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map((opt, i) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={order.currentStatus !== "Cancelled" && i < currentStatusIndex}
              >
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleStatusUpdate}
            disabled={isUpdating || currentStatus === order.currentStatus}
            className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </td>

      {/* Action Buttons */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex flex-col space-y-2">
          {/* Chat */}
          <button
            onClick={handleChatClick}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
          >
            <FaComments />
            Chat
          </button>

          {/* Bill */}
          <button
            disabled={!isBillGeneratable}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-xs rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
          >
            <FaFileInvoice />
            Bill
          </button>

          {/* Accept Return */}
          <button
            onClick={handleAcceptReturn}
            disabled={!isReturnButtonEnabled || isAcceptingReturn}
            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-md transition-colors justify-center ${
              isReturnButtonEnabled
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            {isAcceptingReturn ? "Accepting..." : <><FaSyncAlt /> Accept Return</>}
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
    setCurrentPage(1);
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
        {/* Pagination outside the table but within the same shadow-md block */}
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
      <div className="max-w-7xl mx-auto">
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