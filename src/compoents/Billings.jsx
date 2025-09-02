import React, { useState, useEffect, useRef } from 'react';

const Billings = () => {
  const [showCard, setShowCard] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);
  
  // New state variables for totalPiecesPerBox and delivery date
  const [totalPiecesPerBox, setTotalPiecesPerBox] = useState(0);
  const [deliveredDate, setDeliveredDate] = useState('');
  const [showPartnerModal, setShowPartnerModal] = useState(false); // Added state for partner modal
  const [newPartner, setNewPartner] = useState(''); // State for new partner input

  const sellerDetails = `3B PROFILES PRIVATE LIMITED -2025-2026
NO.39/2, YALACHAGUPPE,RAMPUR VILLAGE,
GIDADAPALYA MAIN ROAD, TAVAREKERE HOBLI,
BANGLORE SOUTH TALUK, BANGALORE, KARNATAKA -562130

UDYAM Reg No. : UDYAM-KR-03-0193660 (Small)
GSTIN/UIN: 29AACCZ0397C 1Z7
State Name : Karnataka, Code :29
CIN : U36996KA2022PTC165134`;

  const [currentBillingPart, setCurrentBillingPart] = useState(1);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowCard(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchOrders = async () => {
    if (orders.length > 0) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success && Array.isArray(result.orders)) {
        const validOrders = result.orders.filter(item => typeof item.orderId === 'string');
        setOrders(validOrders);
        setFilteredOrders(validOrders);
      } else {
        throw new Error('API response was not successful or data is malformed.');
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError('Could not load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderInput = (event) => {
    const input = event.target.value;
    setOrderIdInput(input);
    setSelectedOrder(null);
    
    if (input.length > 0) {
      const lowerCaseInput = input.toLowerCase();
      const newFilteredOrders = orders.filter(item =>
        item.orderId.toLowerCase().includes(lowerCaseInput) ||
        item.user?.name?.toLowerCase().includes(lowerCaseInput)
      );
      setFilteredOrders(newFilteredOrders);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleSuggestionClick = (order) => {
    setOrderIdInput(order.orderId);
    setSelectedOrder(order);
    setFilteredOrders([]);

    // Fetch totalPiecesPerBox and delivery date
    const product = order.products[0]; // Assuming you want the first product
    setTotalPiecesPerBox(product.totalPiecesPerBox || 0);
    setDeliveredDate(order.statusHistory.find(status => status.status === "Delivered")?.timestamp || '');
  };

  const handleBillSelectClick = () => {
    setShowCard(prev => !prev);
    if (!showCard) {
      fetchOrders();
    }
  };

  const handleSaveAndNext = () => {
    if (selectedOrder) {
      setCurrentBillingPart(2);
      console.log("Proceeding to next billing part for order:", selectedOrder.orderId);
    } else {
      alert("Please select an order before proceeding.");
    }
  };

  // Define the getBuyerDetailsText function
  const getBuyerDetailsText = () => {
    if (!selectedOrder) return "No order selected.";

    const { user, shippingDetails, gstin } = selectedOrder;

    let buyerInfo = `Buyer Details:\n`;
    if (user?.name) buyerInfo += `Name: ${user.name}\n`;
    if (user?.email) buyerInfo += `Email: ${user.email}\n`;
    if (user?.number) buyerInfo += `Phone: ${user.number}\n`;
    if (gstin) buyerInfo += `GSTIN/UIN: ${gstin}\n`;

    buyerInfo += `\nShipping Address:\n`;
    if (shippingDetails?.addressType) buyerInfo += `Address Type: ${shippingDetails.addressType}\n`;
    if (shippingDetails?.detailedAddress) buyerInfo += `Address: ${shippingDetails.detailedAddress}\n`;
    if (shippingDetails?.phone && shippingDetails.phone !== user?.number) buyerInfo += `Shipping Phone: ${shippingDetails.phone}\n`;

    return buyerInfo;
  };

  const handleAddPartner = () => {
    if (newPartner) {
      // Logic to add the new partner
      console.log("New partner added:", newPartner);
      setNewPartner(''); // Clear the input
      setShowPartnerModal(false); // Close the modal
    }
  };

  return (
    <div style={styles.pageContainer}>
      <button onClick={handleBillSelectClick} style={styles.openCardButton}>
        {selectedOrder ? `Order: ${selectedOrder.orderId}` : "Select Bill"}
      </button>

      {showCard && (
        <div ref={cardRef} style={styles.billSelectionCard}>
          <h4 style={styles.cardHeader}>Select Bill</h4>
          <input
            type="text"
            placeholder="Search Order ID or Name"
            value={orderIdInput}
            onChange={handleOrderInput}
            style={styles.orderIdInput}
          />
          
          {isLoading && <p style={styles.loadingText}>Loading orders...</p>}
          {error && <p style={styles.errorText}>{error}</p>}
          
          {!isLoading && !error && (
            <div style={styles.suggestionsContainer}>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((item) => (
                  <div
                    key={item._id}
                    style={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {`${item.orderId} - (:User    ${item.user?.name || 'N/A'})`}
                  </div>
                ))
              ) : (
                orderIdInput.length > 0 && <p style={styles.noResultsText}>No matching orders found.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div style={styles.mainContent}>
        <h2 style={styles.mainHeader}>Billing Page - Part {currentBillingPart}</h2>

        {currentBillingPart === 1 && (
          <>
            <div style={styles.addressSection}>
              <div style={styles.addressBox}>
                <h3 style={styles.sectionTitle}>Seller Address & Details</h3>
                <textarea
                  style={styles.textArea}
                  value={sellerDetails}
                  readOnly
                />
              </div>

              <div style={styles.addressBox}>
                <h3 style={styles.sectionTitle}>Buyer Address & Details</h3>
                <textarea
                  style={styles.textArea}
                  value={getBuyerDetailsText()}
                  readOnly
                />
                {!selectedOrder && <p style={styles.warningText}>Please select an order from the top-right to view buyer details.</p>}
              </div>
            </div>

            <button
              onClick={handleSaveAndNext}
              style={styles.saveNextButton}
              disabled={!selectedOrder}
            >
              Save & Next
            </button>
          </>
        )}

        {currentBillingPart === 2 && (
          <div style={styles.nextPartContent}>
            <h3 style={styles.invoiceHeader}>Invoice Details</h3>
            <div style={styles.inputGroup}>
              <label>Invoice Number:</label>
              <input type="text" value={Math.floor(Math.random() * 9000) + 1200} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Date and Time of Bill:</label>
              <input type="text" value={new Date().toLocaleString()} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Delivery Note:</label>
              <input type="text" value={`Total count of: ${totalPiecesPerBox}`} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Mode/Terms of Payment:</label>
              <input type="text" value="30 DAYS" readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Buyer's Order No:</label>
              <input type="text" value={selectedOrder?.orderId || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Dated:</label>
              <input type="text" value={selectedOrder?.createdAt || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Doc Dispatch No:</label>
              <input type="text" value={selectedOrder?.orderId || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Delivery Date:</label>
              <input type="text" value={deliveredDate || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Dispatch Through:</label>
              <select style={styles.inputField}>
                <option value="">Select Partner</option>
                {/* Add partner options here */}
              </select>
              <button onClick={() => setShowPartnerModal(true)} style={styles.addPartnerButton}>Add Partner</button>
            </div>
            <div style={styles.inputGroup}>
              <label>Destination:</label>
              <input type="text" style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label>Motor Vehicle Number:</label>
              <select style={styles.inputField}>
                <option value="">Select Vehicle</option>
                {/* Fetch vehicle options dynamically */}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label>Bill of Lading/LR-RR NO:</label>
              <input type="text" placeholder="Optional" style={styles.inputField} />
            </div>
            <div style={styles.buttonContainer}>
              <button onClick={() => setCurrentBillingPart(1)} style={styles.prevButton}>Prev</button>
              <button onClick={handleSaveAndNext} style={styles.saveNextButton}>Save & Next</button>
            </div>
          </div>
        )}
      </div>

      {showPartnerModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Add Partner</h4>
            <input
              type="text"
              placeholder="Enter Partner Name"
              value={newPartner}
              onChange={(e) => setNewPartner(e.target.value)}
              style={styles.inputField}
            />
            <div style={styles.modalButtonContainer}>
              <button onClick={handleAddPartner} style={styles.saveButton}>Save</button>
              <button onClick={() => setShowPartnerModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles remain unchanged
const styles = {
  pageContainer: {
    position: 'relative',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
  },
  openCardButton: {
    position: 'fixed',
    top: '75px',
    right: '20px',
    padding: '8px 15px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#7853C2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: 1000,
  },
  billSelectionCard: {
    position: 'absolute',
    top: '60px',
    right: '20px',
    width: '300px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '15px',
    zIndex: 999,
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '1rem',
    color: '#333',
  },
  orderIdInput: {
    width: 'calc(100% - 20px)',
    padding: '8px 10px',
    marginBottom: '10px',
    fontSize: '0.9rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: '0.85rem',
  },
  suggestionsContainer: {
    marginTop: '5px',
    borderTop: '1px solid #eee',
    paddingTop: '5px',
  },
  suggestionItem: {
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    borderBottom: '1px solid #eee',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#999',
    padding: '10px 0',
  },
  mainContent: {
    marginTop: '60px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    maxWidth: '900px',
    margin: '60px auto 20px auto',
  },
  mainHeader: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#333',
  },
  invoiceHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  addressSection: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  addressBox: {
    flex: '1 1 45%',
    minWidth: '300px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '15px',
    backgroundColor: '#fcfcfc',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#555',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px',
  },
  textArea: {
    width: '100%',
    height: '200px',
    padding: '10px',
    fontSize: '0.9rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#e9ecef',
    color: '#333',
    resize: 'vertical',
    fontFamily: 'monospace',
  },
  warningText: {
    color: '#dc3545',
    fontSize: '0.85rem',
    marginTop: '10px',
    textAlign: 'center',
  },
  saveNextButton: {
    padding: '12px 25px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#7853C2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  prevButton: {
    padding: '12px 25px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#7853C2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transition: 'background-color 0.3s ease',
  },
  inputField: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
  },
  nextPartContent: {
    marginTop: '40px',
    padding: '20px',
    border: '1px dashed #007bff',
    borderRadius: '8px',
    backgroundColor: '#eaf5ff',
    textAlign: 'left',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    width: '300px',
    textAlign: 'center',
  },
  modalButtonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
  },
  saveButton: {
    padding: '10px 15px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#7853C2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
   cancelButton: {
    padding: '10px 15px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  addPartnerButton: {
    marginLeft: '10px',
    padding: '8px 15px',
    backgroundColor: '#7853C2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default Billings;






