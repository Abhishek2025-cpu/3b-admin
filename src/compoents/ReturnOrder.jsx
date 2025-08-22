import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

// --- Enhanced Styles ---
const styles = {
  container: { padding: "20px", marginLeft: "260px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header: { marginBottom: "20px", color: "#6f42c1", fontWeight: "600", borderBottom: '2px solid #eee', paddingBottom: '10px' },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    padding: "25px",
    marginBottom: "25px",
    border: "1px solid #e9ecef",
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  cardTitle: { margin: 0, color: "#6f42c1", fontSize: '1.2rem' },
  cardBody: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  section: {},
  sectionTitle: { fontWeight: "600", margin: "0 0 10px", color: "#343a40", fontSize: '1rem' },
  text: { fontSize: "15px", margin: "4px 0", color: "#495057" },
  imageGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  imageThumb: {
    width: "100px", height: "100px", objectFit: "cover",
    borderRadius: "6px", cursor: "pointer", border: "2px solid #ddd",
    transition: 'transform 0.2s ease-in-out',
  },
  statusBadge: {
    display: "inline-block", padding: "5px 12px", borderRadius: "15px",
    fontSize: "13px", fontWeight: "bold", textTransform: 'capitalize'
  },
  statusUpdater: {
    marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa',
    borderRadius: '8px', border: '1px solid #dee2e6'
  },
  select: {
    width: '100%', padding: '10px', borderRadius: '5px',
    border: '1px solid #ccc', fontSize: '14px', marginBottom: '10px'
  },
  textarea: {
    width: '100%', padding: '10px', borderRadius: '5px',
    border: '1px solid #ccc', fontSize: '14px', minHeight: '80px',
    resize: 'vertical', boxSizing: 'border-box'
  },
  saveButton: {
    backgroundColor: '#6f42c1', color: '#fff', border: 'none',
    padding: '10px 15px', borderRadius: '5px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: '8px',
    opacity: 1, transition: 'opacity 0.2s',
  },
  saveButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  loader: {
    border: '3px solid #f3f3f3', borderTop: '3px solid #6f42c1',
    borderRadius: '50%', width: '16px', height: '16px',
    animation: 'spin 1s linear infinite'
  },
  // Modal Styles (unchanged but included for completeness)
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 },
  modalContent: { position: "relative", background: "#fff", padding: "15px", borderRadius: "8px", textAlign: "center", maxWidth: "90%", maxHeight: "90%" },
  modalImage: { maxWidth: "100%", maxHeight: "80vh", transition: "transform 0.3s ease" },
  closeBtn: { position: "absolute", top: "10px", right: "15px", fontSize: "20px", cursor: "pointer", color: "#6f42c1", fontWeight: "bold" },
  zoomControls: { marginTop: "10px", display: "flex", justifyContent: "center", gap: "15px" },
  zoomBtn: { fontSize: "18px", cursor: "pointer", color: "#6f42c1", fontWeight: "bold" },
};

// --- Reusable Loader Component ---
const Loader = () => <div style={styles.loader}></div>;

// --- Status Updater Component ---
const StatusUpdater = ({ returnItem, onUpdateSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(returnItem.status);
  const [adminNotes, setAdminNotes] = useState(returnItem.adminNotes || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // These statuses are considered final and lock the component
  const terminalStatuses = ['Approved', 'Rejected', 'Completed'];
  const isReadOnly = terminalStatuses.includes(returnItem.status);

  const handleSave = async () => {
    if (selectedStatus === returnItem.status) {
      toast.info("No status change detected.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.put(
        `https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/${returnItem._id}/status`,
        {
          status: selectedStatus,
          adminNotes: adminNotes,
        }
      );
      if (response.data.success) {
        toast.success("Status updated successfully!");
        onUpdateSuccess(response.data.data); // Update parent state
      }
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
      console.error("Status update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // If status is terminal, show read-only info.
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

  // Otherwise, show the interactive form
  return (
    <div style={styles.statusUpdater}>
      <p style={styles.sectionTitle}>Update Status</p>
      <select
        style={styles.select}
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        disabled={isLoading}
      >
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Approved">Approve</option>
        <option value="Rejected">Reject</option>
        <option value="Completed">Completed</option>
      </select>
      
      <textarea
          style={styles.textarea}
          placeholder="Add optional notes for the user..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isLoading}
      />

      <button
        style={isLoading ? {...styles.saveButton, ...styles.saveButtonDisabled} : styles.saveButton}
        onClick={handleSave}
        disabled={isLoading}
      >
        {isLoading ? <Loader /> : 'Save Status'}
      </button>
    </div>
  );
};


// --- Main ReturnOrder Component ---
const ReturnOrder = () => {
  const [returns, setReturns] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await axios.get(
          "https://threebapi-1067354145699.asia-south1.run.app/api/returns/admin/all"
        );
        if (data.success) {
          setReturns(data.data);
        }
      } catch (err) {
        toast.error("Could not fetch return requests.");
        console.error("Error fetching returns:", err);
      }
    };
    fetchReturns();
  }, []);

  const handleUpdateSuccess = (updatedReturn) => {
    setReturns(prevReturns =>
      prevReturns.map(ret =>
        ret._id === updatedReturn._id ? updatedReturn : ret
      )
    );
  };

  // Modal and Zoom functions (unchanged)
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
    <div style={styles.container}>
      <h2 style={styles.header}>Manage Order Returns</h2>

      {returns.length === 0 ? (
          <p>No return requests found.</p>
      ) : (
        returns.map((ret) => (
          <div key={ret._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Order ID: {ret.orderId?.orderId}</h3>
              <span style={getStatusStyle(ret.status)}>{ret.status}</span>
            </div>
            
            <div style={styles.cardBody}>
                <div style={styles.section}>
                    <p style={styles.sectionTitle}>User & Request Details</p>
                    <p style={styles.text}><b>User:</b> {ret.userId?.name} ({ret.userId?.email})</p>
                    <p style={styles.text}><b>Reason:</b> {ret.products[0]?.reason}</p>
                    <p style={styles.text}><b>Items to Return:</b> {ret.products[0]?.quantityToReturn}</p>
                    <p style={styles.text}><b>Description:</b> {ret.description}</p>
                    <p style={styles.sectionTitle}>Box Serial Numbers:</p>
                    {ret.boxSerialNumbers.length > 0 ? (
                        <ul>
                            {ret.boxSerialNumbers.map((sn, i) => <li key={i} style={styles.text}>{sn}</li>)}
                        </ul>
                    ) : <p style={styles.text}>None provided.</p>}
                </div>
                
                <div style={styles.section}>
                    {ret.boxImages.length > 0 && (
                        <div>
                        <p style={styles.sectionTitle}>Box Images:</p>
                        <div style={styles.imageGrid}>
                            {ret.boxImages.map((img) => (
                                <img key={img._id} src={img.url} alt="Box" style={styles.imageThumb} onClick={() => openModal(img.url)}/>
                            ))}
                        </div>
                        </div>
                    )}
                    {ret.damagedPieceImages.length > 0 && (
                        <div style={{marginTop: '20px'}}>
                        <p style={styles.sectionTitle}>Damaged Piece Images:</p>
                        <div style={styles.imageGrid}>
                            {ret.damagedPieceImages.map((img) => (
                                <img key={img._id} src={img.url} alt="Damaged" style={styles.imageThumb} onClick={() => openModal(img.url)}/>
                            ))}
                        </div>
                        </div>
                    )}
                </div>
            </div>
            
            <StatusUpdater returnItem={ret} onUpdateSuccess={handleUpdateSuccess} />
          </div>
        ))
      )}

      {/* Modal (unchanged) */}
      {modalImage && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span style={styles.closeBtn} onClick={closeModal}>×</span>
            <img src={modalImage} alt="Preview" style={{ ...styles.modalImage, transform: `scale(${zoom})` }}/>
            <div style={styles.zoomControls}>
              <span style={styles.zoomBtn} onClick={zoomOut}>➖</span>
              <span style={styles.zoomBtn} onClick={zoomIn}>➕</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnOrder;