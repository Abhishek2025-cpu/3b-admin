import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { FaSearch, FaTrash, FaEye, FaSyncAlt } from 'react-icons/fa';
import Swal from "sweetalert2";

// --- Shared Helper Components ---

const Loader = () => (
    <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);

    return (
        <nav className="flex justify-end items-center gap-2 mt-4 px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 border border-gray-300"
            >
                Previous
            </button>
            {pageNumbers.map((number) => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={`px-3 py-1 text-sm font-medium rounded-md border ${currentPage === number ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-300'}`}
                >
                    {number}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 border border-gray-300"
            >
                Next
            </button>
        </nav>
    );
};

// --- Sub-Component: Return Table Row ---

const ReturnTableRow = ({ returnItem, index, onUpdate, onDelete }) => {
    const [currentStatus, setCurrentStatus] = useState(returnItem.status);
    const [isUpdating, setIsUpdating] = useState(false);

    const statusOptions = [
        { label: "🕓 Pending", value: "Pending" },
        { label: "⚙️ Processing", value: "Processing" },
        { label: "✅ Approved", value: "Approved" },
        { label: "❌ Rejected", value: "Rejected" },
        { label: "🏁 Completed", value: "Completed" },
    ];

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await axios.put(
                `https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/${returnItem._id}/status`,
                { status: currentStatus }
            );
            if (res.data.success) {
                Swal.fire("Success", "Return status updated!", "success");
                onUpdate(res.data.data);
            }
        } catch (err) {
            Swal.fire("Error", "Failed to update status", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const viewImages = () => {
        const allImages = [...returnItem.boxImages, ...returnItem.damagedPieceImages];
        Swal.fire({
            title: 'Return Evidence',
            html: `
                <div class="grid grid-cols-2 gap-2">
                    ${allImages.map(img => `<img src="${img.url}" class="w-full h-40 object-cover rounded shadow-sm" />`).join('')}
                </div>
                <div class="mt-4 text-left text-sm">
                    <p><b>Reason:</b> ${returnItem.products[0]?.reason}</p>
                    <p><b>Description:</b> ${returnItem.description}</p>
                </div>
            `,
            width: 600,
            showCloseButton: true,
        });
    };

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{returnItem.orderId?.orderId || "N/A"}</div>
                <div className="text-xs text-gray-500">{new Date(returnItem.createdAt).toLocaleDateString()}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{returnItem.userId?.name || "N/A"}</div>
                <div className="text-xs text-gray-500">{returnItem.userId?.email || "N/A"}</div>
            </td>
            <td className="px-6 py-4 max-w-xs overflow-hidden">
                <div className="text-sm text-gray-700 truncate">{returnItem.products[0]?.reason}</div>
                <div className="text-xs text-gray-500">Qty: {returnItem.products[0]?.quantityToReturn}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button 
                    onClick={viewImages}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    <FaEye /> View ({returnItem.boxImages.length + returnItem.damagedPieceImages.length})
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-2">
                    <select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        className="px-2 py-1 rounded-md text-xs border border-gray-300 bg-white focus:ring-1 focus:ring-blue-500"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating || currentStatus === returnItem.status}
                        className="bg-green-600 text-white text-[10px] py-1 px-2 rounded hover:bg-green-700 disabled:bg-gray-300"
                    >
                        {isUpdating ? "..." : "Save Status"}
                    </button>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                    onClick={() => onDelete(returnItem)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                >
                    <FaTrash />
                </button>
            </td>
        </tr>
    );
};

// --- Main ReturnOrder Component ---

const ITEMS_PER_PAGE = 10;

const ReturnOrder = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/all");
            if (data.success) setReturns(data.data);
        } catch (err) {
            console.error("Error fetching returns:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredReturns = useMemo(() => {
        return returns.filter(item => {
            const matchesSearch = 
                item.orderId?.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "All" || item.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [returns, searchQuery, statusFilter]);

    const paginatedReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReturns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredReturns, currentPage]);

    const totalPages = Math.ceil(filteredReturns.length / ITEMS_PER_PAGE);

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This return request will be permanently deleted.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/${item._id}`);
                setReturns(prev => prev.filter(r => r._id !== item._id));
                Swal.fire('Deleted!', 'Request removed.', 'success');
            } catch (err) {
                Swal.fire('Error', 'Could not delete request.', 'error');
            }
        }
    };

    const handleUpdate = (updatedItem) => {
        setReturns(prev => prev.map(r => r._id === updatedItem._id ? updatedItem : r));
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-bold text-gray-800">Return Requests</h1>
                        <div className="flex gap-4">
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative w-full max-w-lg">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name or Email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </header>

                <main>
                    {loading ? (
                        <Loader />
                    ) : paginatedReturns.length > 0 ? (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Info</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedReturns.map((item, idx) => (
                                        <ReturnTableRow 
                                            key={item._id} 
                                            returnItem={item} 
                                            index={idx}
                                            onUpdate={handleUpdate}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-lg">No return requests found.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ReturnOrder;