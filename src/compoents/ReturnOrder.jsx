import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

// --- SVG Icon for Delete ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);


// --- Enhanced Styles ---
const styles = {
  // Main container and header
  container: { padding: "20px", marginLeft: "260px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header: { marginBottom: "20px", color: "#6f42c1", fontWeight: "600", borderBottom: '2px solid #eee', paddingBottom: '10px' },
  // Controls for filtering and sorting
  controlsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  filterGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
  label: { fontWeight: '600', color: '#495057' },
  controlSelect: { padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc' },
  // Return Card
  card: { position: 'relative', backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.05)", padding: "25px", marginBottom: "25px", border: "1px solid #e9ecef", display: 'flex', flexDirection: 'column', gap: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', },
  cardTitle: { margin: 0, color: "#6f42c1", fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' },
  serialNumber: { backgroundColor: '#6f42c1', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' },
  cardBody: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  // Card Content
  section: {},
  sectionTitle: { fontWeight: "600", margin: "0 0 10px", color: "#343a40", fontSize: '1rem' },
  text: { fontSize: "15px", margin: "4px 0", color: "#495057" },
  imageGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  imageThumb: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: "2px solid #ddd", transition: 'transform 0.2s ease-in-out', },
  // Status & Actions
  statusBadge: { display: "inline-block", padding: "5px 12px", borderRadius: "15px", fontSize: "13px", fontWeight: "bold", textTransform: 'capitalize' },
  statusUpdater: { marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
  select: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', marginBottom: '10px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' },
  saveButton: { backgroundColor: '#6f42c1', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 1, transition: 'opacity 0.2s', },
  saveButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  deleteIcon: { position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', color: '#dc3545', transition: 'color 0.2s' },
  // Loaders and Empty States
  fullPageLoader: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' },
  loader: { border: '3px solid #f3f3f3', borderTop: '3px solid #6f42c1', borderRadius: '50%', width: '16px', height: '16px', animation: 'spin 1s linear infinite' },
  bigLoader: { border: '5px solid #f3f3f3', borderTop: '5px solid #6f42c1', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' },
  emptyState: { textAlign: 'center', padding: '50px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: '#6c757d' },
  // Pagination
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px' },
  pageButton: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', backgroundColor: '#fff' },
  activePageButton: { backgroundColor: '#6f42c1', color: '#fff', border: '1px solid #6f42c1' },
  disabledPageButton: { cursor: 'not-allowed', color: '#aaa', backgroundColor: '#f8f8f8' },
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  modalContent: { position: "relative", background: "#fff", padding: "15px", borderRadius: "8px", textAlign: "center", maxWidth: "90%", maxHeight: "90%" },
  modalImage: { maxWidth: "100%", maxHeight: "80vh", transition: "transform 0.3s ease" },
  closeBtn: { position: "absolute", top: "10px", right: "15px", fontSize: "20px", cursor: "pointer", color: "#6f42c1", fontWeight: "bold" },
  zoomControls: { marginTop: "10px", display: "flex", justifyContent: "center", gap: "15px" },
  zoomBtn: { fontSize: "18px", cursor: "pointer", color: "#6f42c1", fontWeight: "bold" },
  // Confirmation Modal
  confirmModal: { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '400px', textAlign: 'center' },
  confirmTitle: { marginTop: 0, color: '#333' },
  confirmText: { color: '#666', marginBottom: '25px' },
  confirmActions: { display: 'flex', justifyContent: 'center', gap: '15px' },
  confirmButton: { backgroundColor: '#dc3545', color: 'white' },
  cancelButton: { backgroundColor: '#6c757d', color: 'white' }
};

// --- Reusable Components ---
const Loader = ({ size = 'small' }) => <div style={size === 'big' ? styles.bigLoader : styles.loader}></div>;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.modalOverlay}>
            <div style={styles.confirmModal}>
                <h3 style={styles.confirmTitle}>{title}</h3>
                <p style={styles.confirmText}>{children}</p>
                <div style={styles.confirmActions}>
                    <button style={{...styles.saveButton, ...styles.cancelButton}} onClick={onClose}>Cancel</button>
                    <button style={{...styles.saveButton, ...styles.confirmButton}} onClick={onConfirm}>Confirm Delete</button>
                </div>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div style={styles.paginationContainer}>
            <button
                style={currentPage === 1 ? {...styles.pageButton, ...styles.disabledPageButton} : styles.pageButton}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            {pageNumbers.map(number => (
                <button
                    key={number}
                    style={number === currentPage ? {...styles.pageButton, ...styles.activePageButton} : styles.pageButton}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </button>
            ))}
            <button
                style={currentPage === totalPages ? {...styles.pageButton, ...styles.disabledPageButton} : styles.pageButton}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};

const StatusUpdater = ({ returnItem, onUpdateSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(returnItem.status);
  const [adminNotes, setAdminNotes] = useState(returnItem.adminNotes || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const terminalStatuses = ['Approved', 'Rejected', 'Completed'];
  const isReadOnly = terminalStatuses.includes(returnItem.status);

  const handleSave = async () => {
    if (selectedStatus === returnItem.status && adminNotes === (returnItem.adminNotes || '')) {
      toast.info("No changes detected.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.put(
        `https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/${returnItem._id}/status`,
        { status: selectedStatus, adminNotes: adminNotes }
      );
      if (response.data.success) {
        toast.success("Status updated successfully!");
        onUpdateSuccess(response.data.data);
      }
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
      console.error("Status update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isReadOnly) {
    return (
      <div>
        <p style={{...styles.sectionTitle, marginBottom: 0}}>Final Status</p>
        <p style={{...styles.text, fontStyle: 'italic', color: '#6c757d' }}>This request has been finalized and cannot be changed.</p>
        {returnItem.adminNotes && (
          <>
            <p style={{...styles.sectionTitle, marginTop: '10px'}}>Admin Notes:</p>
            <p style={styles.text}>{returnItem.adminNotes}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={styles.statusUpdater}>
      <p style={styles.sectionTitle}>Update Status</p>
      <select style={styles.select} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} disabled={isLoading}>
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Approved">Approve</option>
        <option value="Rejected">Reject</option>
        <option value="Completed">Completed</option>
      </select>
      <textarea style={styles.textarea} placeholder="Add optional notes for the user..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} disabled={isLoading} />
      <button style={isLoading ? {...styles.saveButton, ...styles.saveButtonDisabled} : styles.saveButton} onClick={handleSave} disabled={isLoading}>
        {isLoading ? <Loader /> : 'Save Status'}
      </button>
    </div>
  );
};


const ReturnCard = ({ returnItem, serialNumber, onUpdateSuccess, onDeleteRequest }) => {
    const [modalImage, setModalImage] = useState(null);
    const [zoom, setZoom] = useState(1);

    const openModal = (url) => { setModalImage(url); setZoom(1); };
    const closeModal = () => setModalImage(null);
    const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
    const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

    const getStatusStyle = (status) => {
        switch (status) {
            case "Pending": return { ...styles.statusBadge, backgroundColor: "#fff3cd", color: "#856404" };
            case "Approved": return { ...styles.statusBadge, backgroundColor: "#d4edda", color: "#155724" };
            case "Rejected": return { ...styles.statusBadge, backgroundColor: "#f8d7da", color: "#721c24" };
            case "Processing": return { ...styles.statusBadge, backgroundColor: '#cfe2ff', color: '#084298' };
            case "Completed": return { ...styles.statusBadge, backgroundColor: '#e2e3e5', color: '#41464b' };
            default: return styles.statusBadge;
        }
    };

    return (
        <>
            <div style={styles.card}>
                <div style={styles.deleteIcon} onClick={() => onDeleteRequest(returnItem)} title="Delete Request">
                    <TrashIcon />
                </div>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>
                        <span style={styles.serialNumber}>{serialNumber}</span>
                        Order ID: {returnItem.orderId?.orderId || 'N/A'}
                    </h3>
                    <span style={getStatusStyle(returnItem.status)}>{returnItem.status}</span>
                </div>
                <div style={styles.cardBody}>
                    <div style={styles.section}>
                        <p style={styles.sectionTitle}>User & Request Details</p>
                        <p style={styles.text}><b>User:</b> {returnItem.userId?.name} ({returnItem.userId?.email})</p>
                        <p style={styles.text}><b>Reason:</b> {returnItem.products[0]?.reason}</p>
                        <p style={styles.text}><b>Items to Return:</b> {returnItem.products[0]?.quantityToReturn}</p>
                        <p style={styles.text}><b>Description:</b> {returnItem.description}</p>
                        <p style={styles.sectionTitle}>Box Serial Numbers:</p>
                        {returnItem.boxSerialNumbers.length > 0 ? (
                            <ul>{returnItem.boxSerialNumbers.map((sn, i) => <li key={i} style={styles.text}>{sn}</li>)}</ul>
                        ) : <p style={styles.text}>None provided.</p>}
                    </div>
                    <div style={styles.section}>
                        {returnItem.boxImages.length > 0 && (
                            <div>
                                <p style={styles.sectionTitle}>Box Images:</p>
                                <div style={styles.imageGrid}>{returnItem.boxImages.map((img) => <img key={img._id} src={img.url} alt="Box" style={styles.imageThumb} onClick={() => openModal(img.url)} />)}</div>
                            </div>
                        )}
                        {returnItem.damagedPieceImages.length > 0 && (
                            <div style={{ marginTop: '20px' }}>
                                <p style={styles.sectionTitle}>Damaged Piece Images:</p>
                                <div style={styles.imageGrid}>{returnItem.damagedPieceImages.map((img) => <img key={img._id} src={img.url} alt="Damaged" style={styles.imageThumb} onClick={() => openModal(img.url)} />)}</div>
                            </div>
                        )}
                    </div>
                </div>
                <StatusUpdater returnItem={returnItem} onUpdateSuccess={onUpdateSuccess} />
            </div>

            {/* Image Preview Modal */}
            {modalImage && (
                <div style={styles.modalOverlay} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <span style={styles.closeBtn} onClick={closeModal}>×</span>
                        <img src={modalImage} alt="Preview" style={{ ...styles.modalImage, transform: `scale(${zoom})` }} />
                        <div style={styles.zoomControls}>
                            <span style={styles.zoomBtn} onClick={zoomOut}>➖</span>
                            <span style={styles.zoomBtn} onClick={zoomIn}>➕</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


// --- Main ReturnOrder Component ---
const ReturnOrder = () => {
    // Data and Loading state
    const [allReturns, setAllReturns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filtering and Sorting state
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Delete confirmation modal state
    const [returnToDelete, setReturnToDelete] = useState(null);

    // Fetch initial data
    useEffect(() => {
        const fetchReturns = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get("https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/all");
                if (data.success) {
                    setAllReturns(data.data);
                }
            } catch (err) {
                toast.error("Could not fetch return requests.");
                console.error("Error fetching returns:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReturns();
    }, []);

    // Memoized calculation for filtered and sorted returns
    const filteredAndSortedReturns = useMemo(() => {
        let processedReturns = [...allReturns];

        // Apply filter
        if (statusFilter !== "All") {
            processedReturns = processedReturns.filter(ret => ret.status === statusFilter);
        }

        // Apply sort
        processedReturns.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return processedReturns;
    }, [allReturns, statusFilter, sortOrder]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, sortOrder]);


    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedReturns.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentReturns = filteredAndSortedReturns.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handler for successful status update
    const handleUpdateSuccess = (updatedReturn) => {
        setAllReturns(prevReturns =>
            prevReturns.map(ret => (ret._id === updatedReturn._id ? updatedReturn : ret))
        );
    };

    // Handler to initiate deletion
    const handleDeleteRequest = (returnItem) => {
        setReturnToDelete(returnItem);
    };

    // Handler to confirm and execute deletion
    const handleConfirmDelete = async () => {
        if (!returnToDelete) return;
        try {
            await axios.delete(`https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/${returnToDelete._id}`);
            toast.success(`Request for order ${returnToDelete.orderId?.orderId} deleted.`);
            setAllReturns(prev => prev.filter(r => r._id !== returnToDelete._id));
        } catch (error) {
            toast.error("Failed to delete the request.");
            console.error("Delete error:", error);
        } finally {
            setReturnToDelete(null); // Close modal
        }
    };
    
    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Manage Order Returns</h2>

            {/* Filter and Sort Controls */}
            <div style={styles.controlsContainer}>
                <div style={styles.filterGroup}>
                    <label htmlFor="status-filter" style={styles.label}>Filter by Status:</label>
                    <select id="status-filter" style={styles.controlSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div style={styles.filterGroup}>
                    <label htmlFor="sort-order" style={styles.label}>Sort by Date:</label>
                    <select id="sort-order" style={styles.controlSelect} value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div style={styles.fullPageLoader}><Loader size="big" /></div>
            ) : currentReturns.length > 0 ? (
                <>
                    {currentReturns.map((ret, index) => (
                        <ReturnCard
                            key={ret._id}
                            returnItem={ret}
                            serialNumber={startIndex + index + 1}
                            onUpdateSuccess={handleUpdateSuccess}
                            onDeleteRequest={handleDeleteRequest}
                        />
                    ))}
                    {totalPages > 1 && (
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    )}
                </>
            ) : (
                <div style={styles.emptyState}>
                    <h3>No Return Requests Found</h3>
                    <p>There are no requests matching your current filters.</p>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={!!returnToDelete}
                onClose={() => setReturnToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
            >
                Are you sure you want to permanently delete the return request for Order ID: <strong>{returnToDelete?.orderId?.orderId}</strong>? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default ReturnOrder;