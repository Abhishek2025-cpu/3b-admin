import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- STYLES ---
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', position: 'relative' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#6f42c1',
    color: '#fff',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '10px',
    width: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    boxSizing: 'border-box'
  },
  label: { fontWeight: 'bold', marginBottom: '5px', display: 'block' },
  submitBtn: {
    padding: '10px 16px',
    backgroundColor: '#6f42c1',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px'
  },
  deleteConfirmBtn: {
    padding: '10px 16px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '48%'
  },
  cancelBtn: {
    padding: '10px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '48%'
  },
  closeBtn: {
    padding: '8px 12px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px'
  },
  // Table Styles
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #ddd',
    backgroundColor: '#f8f9fa'
  },
  td: { padding: '12px', borderBottom: '1px solid #ddd', verticalAlign: 'middle' },
  img: { width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' },
  statusIn: { color: 'green', fontWeight: 'bold' },
  statusOut: { color: 'red', fontWeight: 'bold' },
  actionBtn: {
    marginRight: '10px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: '18px'
  },
  // Tracking History Styles
  expandedRow: {
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #ddd'
  },
  historyContainer: {
    padding: '20px',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
  },
  historyTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    backgroundColor: '#fff',
    border: '1px solid #eee'
  },
  historyTh: {
    textAlign: 'left',
    padding: '8px',
    borderBottom: '2px solid #eee',
    color: '#555',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  historyTd: {
    padding: '8px',
    borderBottom: '1px solid #eee',
    color: '#333'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  badgeIn: { backgroundColor: '#e6fffa', color: '#00796b' },
  badgeOut: { backgroundColor: '#fff5f5', color: '#c53030' },
  toggleBtn: {
    cursor: 'pointer',
    color: '#6f42c1',
    background: 'none',
    border: '1px solid #6f42c1',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  // Toast Styles
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    borderRadius: '5px',
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 1100,
    transition: 'opacity 0.5s ease-in-out',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }
};

const InventoryStock = () => {
  const BASE_URL = "https://threebapi-1067354145699.asia-south1.run.app";
  
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('BI');
  const [products, setProducts] = useState([]);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Add/Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  
  const [stockForm, setStockForm] = useState({
    productName: '',
    qty: '',
    numberOfBoxes: '',
    company: 'BI',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Barcode State
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);

  // Tracking History State
  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  // --- HELPER FUNCTIONS ---

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const resetForm = () => {
    setStockForm({
      productName: '',
      qty: '',
      numberOfBoxes: '',
      company: 'BI',
      status: 'active'
    });
    setImageFile(null);
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString();
  };

  // --- API CALLS ---

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/inventory/get`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showToast("Failed to fetch inventory", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('productName', stockForm.productName);
    formData.append('qty', stockForm.qty);
    formData.append('numberOfBoxes', stockForm.numberOfBoxes);
    formData.append('company', stockForm.company);
    formData.append('status', stockForm.status);
    if (imageFile) {
      formData.append('productImage', imageFile);
    }

    try {
      if (isEditMode) {
        await axios.put(
          `${BASE_URL}/api/inventory/update/${currentEditId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        showToast("Stock updated successfully!", "success");
      } else {
        await axios.post(
          `${BASE_URL}/api/inventory/add`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        showToast("Stock added successfully!", "success");
      }

      setShowModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error("Operation error:", error);
      showToast("An error occurred. Please try again.", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/inventory/delete/${deleteId}`);
      showToast("Stock deleted successfully!", "success");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchInventory();
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete stock.", "error");
    }
  };

  // --- HANDLERS ---

  const handleAddNewClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setCurrentEditId(item._id);
    setStockForm({
      productName: item.productName,
      qty: item.qty,
      numberOfBoxes: item.numberOfBoxes,
      company: item.company,
      status: item.status || 'active'
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleShowBarcode = (item) => {
    setBarcodeData(item);
    setShowBarcodeModal(true);
  };

  const toggleRow = (id) => {
    if (expandedRowId === id) {
      setExpandedRowId(null); // Collapse if already open
    } else {
      setExpandedRowId(id); // Expand new row
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(barcodeData.barcodeId);
    showToast("Barcode Key Copied!", "success");
  };

  // --- RENDER HELPERS ---

  const filteredProducts = products.filter(item =>
    item.productName.toLowerCase().includes(search.toLowerCase()) &&
    item.company.toLowerCase() === company.toLowerCase()
  );

  const getStatus = (qty, boxes) =>
    qty > 0 && boxes > 0 ? 'Stock In' : 'Stock Out';

  return (
    <div style={styles.container}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'success' ? '#28a745' : '#dc3545'
        }}>
          {toast.message}
        </div>
      )}

      {/* Top Bar */}
      <div style={styles.header}>
        <input
          type="text"
          placeholder="Search Product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={styles.input}
        >
          <option value="3B">3B</option>
          <option value="BI">BI</option>
        </select>

        <button style={styles.addButton} onClick={handleAddNewClick}>
          + Add Stocks
        </button>
      </div>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product Name</th>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>No of Boxes</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Tracking</th> 
            <th style={styles.th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(item => {
              const status = getStatus(item.qty, item.numberOfBoxes);
              const isExpanded = expandedRowId === item._id;

              return (
                <React.Fragment key={item._id}>
                  {/* MAIN ROW */}
                  <tr style={isExpanded ? {backgroundColor: '#f1f3f5'} : {}}>
                    <td style={styles.td}>{item.productName}</td>
                    <td style={styles.td}>
                      <img src={item.productImage} alt={item.productName} style={styles.img} />
                    </td>
                    <td style={styles.td}>{item.qty}</td>
                    <td style={styles.td}>{item.numberOfBoxes}</td>
                    <td style={styles.td}>
                      <span style={status === "Stock In" ? styles.statusIn : styles.statusOut}>
                        {status}
                      </span>
                    </td>
                    
                    {/* TRACKING TOGGLE */}
                    <td style={styles.td}>
                      <button 
                        style={styles.toggleBtn}
                        onClick={() => toggleRow(item._id)}
                      >
                        {isExpanded ? 'Hide History ▲' : 'View History ▼'}
                      </button>
                    </td>

                    <td style={styles.td}>
                      <button 
                        style={styles.actionBtn} 
                        onClick={() => handleShowBarcode(item)}
                        title="View Barcode"
                      >
                        🧾
                      </button>
                      <button 
                        style={{...styles.actionBtn, color: '#007bff'}} 
                        onClick={() => handleEditClick(item)}
                        title="Edit Stock"
                      >
                        ✏️
                      </button>
                      <button 
                        style={{...styles.actionBtn, color: '#dc3545'}} 
                        onClick={() => handleDeleteClick(item._id)}
                        title="Delete Stock"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED TRACKING HISTORY ROW */}
                  {isExpanded && (
                    <tr style={styles.expandedRow}>
                      <td colSpan="7" style={{ padding: 0 }}>
                        <div style={styles.historyContainer}>
                          <h4 style={{marginTop: 0, marginBottom: '10px', color: '#666'}}>
                            Tracking History for {item.productName}
                          </h4>
                          
                          {item.trackingHistory && item.trackingHistory.length > 0 ? (
                            <table style={styles.historyTable}>
                              <thead>
                                <tr>
                                  <th style={styles.historyTh}>Date/Time</th>
                                  <th style={styles.historyTh}>Type</th>
                                  <th style={styles.historyTh}>Qty</th>
                                  <th style={styles.historyTh}>Boxes</th>
                                  <th style={styles.historyTh}>From</th>
                                  <th style={styles.historyTh}>To</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.trackingHistory.slice().reverse().map((hist, index) => (
                                  <tr key={hist._id || index}>
                                    <td style={styles.historyTd}>{formatDate(hist.timestamp || hist.time)}</td>
                                    <td style={styles.historyTd}>
                                      <span style={{
                                        ...styles.badge,
                                        ...(hist.type === 'in' ? styles.badgeIn : styles.badgeOut)
                                      }}>
                                        {hist.type}
                                      </span>
                                    </td>
                                    <td style={styles.historyTd}>{hist.qty}</td>
                                    <td style={styles.historyTd}>{hist.numberOfBoxes}</td>
                                    <td style={styles.historyTd}>{hist.fromCompany}</td>
                                    <td style={styles.historyTd}>{hist.toCompany}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p style={{fontStyle: 'italic', color: '#888'}}>No tracking history available.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{...styles.td, textAlign: 'center'}}>No products found.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>{isEditMode ? 'Edit Stock' : 'Add New Stock'}</h3>

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Product Name</label>
              <input
                type="text"
                style={styles.input}
                value={stockForm.productName}
                onChange={(e) => setStockForm({ ...stockForm, productName: e.target.value })}
                required
              />

              <label style={styles.label}>Quantity</label>
              <input
                type="number"
                style={styles.input}
                value={stockForm.qty}
                onChange={(e) => setStockForm({ ...stockForm, qty: e.target.value })}
                required
              />

              <label style={styles.label}>Number of Boxes</label>
              <input
                type="number"
                style={styles.input}
                value={stockForm.numberOfBoxes}
                onChange={(e) => setStockForm({ ...stockForm, numberOfBoxes: e.target.value })}
                required
              />

              <label style={styles.label}>Company</label>
              <select
                style={styles.input}
                value={stockForm.company}
                onChange={(e) => setStockForm({ ...stockForm, company: e.target.value })}
              >
                <option value="3B">3B</option>
                <option value="BI">BI</option>
              </select>

              <label style={styles.label}>Status</label>
              <select
                style={styles.input}
                value={stockForm.status}
                onChange={(e) => setStockForm({ ...stockForm, status: e.target.value })}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>

              <label style={styles.label}>
                Product Image {isEditMode && <small>(Leave empty to keep existing)</small>}
              </label>
              <input
                type="file"
                accept="image/*"
                style={styles.input}
                onChange={(e) => setImageFile(e.target.files[0])}
                required={!isEditMode}
              />

              <button type="submit" style={styles.submitBtn}>
                {isEditMode ? 'Update Stock' : 'Submit Stock'}
              </button>
            </form>

            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{color: '#dc3545'}}>Confirm Deletion</h3>
            <p>Are you sure you want to delete this stock item? This action cannot be undone.</p>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button style={styles.deleteConfirmBtn} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE MODAL */}
      {showBarcodeModal && barcodeData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Barcode Details</h3>

            <label style={styles.label}>Barcode Key</label>
            <input
              type="text"
              value={barcodeData.barcodeId}
              readOnly
              style={styles.input}
            />

            <button
              onClick={copyToClipboard}
              style={{ ...styles.submitBtn, backgroundColor: "#6f42c1", marginBottom: '15px' }}
            >
              Copy Key
            </button>

            <label style={styles.label}>Barcode Image</label>
            <img
              src={barcodeData.barcodeUrl}
              alt="barcode"
              style={{ width: "100%", borderRadius: "8px", marginBottom: "15px", border: "1px solid #ddd" }}
            />

            <button
              style={styles.closeBtn}
              onClick={() => setShowBarcodeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryStock;