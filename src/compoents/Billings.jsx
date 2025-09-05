import React, { useState, useEffect, useRef } from 'react';

// Assuming you have styles defined elsewhere or directly in this file
const styles = {
    pageContainer: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
    },
    openCardButton: {
        position: 'absolute',
        top: '70px',
        right: '20px',
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    billSelectionCard: {
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        width: '300px',
    },
    cardHeader: {
        marginTop: '0',
        marginBottom: '15px',
        color: '#333',
    },
    orderIdInput: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        marginBottom: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
    },
    loadingText: {
        color: '#007bff',
    },
    errorText: {
        color: 'red',
    },
    suggestionsContainer: {
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '4px',
    },
    suggestionItem: {
        padding: '10px',
        borderBottom: '1px solid #eee',
        cursor: 'pointer',
        backgroundColor: 'white',
    },
    suggestionItemHover: {
        backgroundColor: '#f0f0f0',
    },
    noResultsText: {
        padding: '10px',
        color: '#666',
    },
    mainContent: {
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    mainHeader: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px',
    },
    addressSection: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '30px',
        gap: '20px',
    },
    addressBox: {
        flex: '1',
        border: '1px solid #eee',
        borderRadius: '6px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
    },
    sectionTitle: {
        marginTop: '0',
        color: '#555',
        marginBottom: '10px',
    },
    textArea: {
        width: '100%',
        height: '150px',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '1.5',
        resize: 'vertical',
    },
    warningText: {
        color: '#ffc107',
        fontSize: '0.9em',
        marginTop: '10px',
    },
    saveNextButton: {
        display: 'block',
        width: '200px',
        padding: '12px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '18px',
        margin: '20px auto 0',
        transition: 'background-color 0.2s',
    },
    saveNextButtonHover: {
        backgroundColor: '#218838',
    },
    saveNextButtonDisabled: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed',
    },
    nextPartContent: {
        paddingTop: '20px',
    },
    invoiceHeader: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '25px',
    },
    inputGroup: {
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
    },
    inputGroupLabel: {
        minWidth: '180px',
        fontWeight: 'bold',
        color: '#555',
    },
    inputField: {
        flex: '1',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
    },
    addTransporterButton: { // Changed from addPartnerButton
        padding: '8px 12px',
        backgroundColor: '#17a2b8',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '10px',
        fontSize: '14px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '30px',
    },
    prevButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    modalOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        width: '400px',
        maxWidth: '90%',
    },
    modalButtonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '20px',
        gap: '10px',
    },
    saveButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    }
};


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
  
  // States for Vehicles dropdown
  const [vehicles, setVehicles] = useState([]); 
  const [selectedVehicle, setSelectedVehicle] = useState(''); 

  // States for Transport Partners (Dispatch Through)
  const [showTransporterModal, setShowTransporterModal] = useState(false); // Changed from showPartnerModal
  const [transporterName, setTransporterName] = useState(''); // New input state for name
  const [transporterNumber, setTransporterNumber] = useState(''); // New input state for number
  const [transporterAddress, setTransporterAddress] = useState(''); // New input state for address
  const [transportPartners, setTransportPartners] = useState([]); // State to store fetched partners
  const [selectedTransportPartner, setSelectedTransportPartner] = useState(''); // State for selected partner in dropdown


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

  // Fetch vehicles and transport partners on component mount
  useEffect(() => {
    fetchVehicles();
    fetchTransportPartners(); // New call
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

  const fetchVehicles = async () => {
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/vehicles/get');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setVehicles(result);
      } else {
        throw new Error('API response for vehicles was not an array.');
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  };

  // New function to fetch transport partners
  const fetchTransportPartners = async () => {
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/transport-partners/get-transpoters');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setTransportPartners(result);
      } else {
        throw new Error('API response for transport partners was not an array.');
      }
    } catch (err) {
      console.error("Failed to fetch transport partners:", err);
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

    const product = order.products[0]; 
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

  // New function to handle adding a transporter
  const handleAddTransporter = async () => {
    if (!transporterName || !transporterNumber || !transporterAddress) {
      alert('Please fill in all transporter details (Name, Number, Address).');
      return;
    }

    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/transport-partners/add-transporter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: transporterName, 
          number: transporterNumber, 
          address: transporterAddress 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Transporter "${result.partner.name}" added successfully!`);
      
      // Refresh the list of transport partners
      fetchTransportPartners(); 

      // Clear the input fields and close the modal
      setTransporterName('');
      setTransporterNumber('');
      setTransporterAddress('');
      setShowTransporterModal(false);

    } catch (err) {
      console.error("Failed to add transporter:", err);
      alert(`Failed to add transporter: ${err.message}`);
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
              <label style={styles.inputGroupLabel}>Invoice Number:</label>
              <input type="text" value={Math.floor(Math.random() * 9000) + 1200} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Date and Time of Bill:</label>
              <input type="text" value={new Date().toLocaleString()} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Delivery Note:</label>
              <input type="text" value={`Total count of: ${totalPiecesPerBox}`} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Mode/Terms of Payment:</label>
              <input type="text" value="30 DAYS" readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Buyer's Order No:</label>
              <input type="text" value={selectedOrder?.orderId || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Dated:</label>
              <input type="text" value={selectedOrder?.createdAt || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Doc Dispatch No:</label>
              <input type="text" value={selectedOrder?.orderId || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Delivery Date:</label>
              <input type="text" value={deliveredDate || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Dispatch Through:</label>
              <select 
                style={styles.inputField}
                value={selectedTransportPartner}
                onChange={(e) => setSelectedTransportPartner(e.target.value)}
              >
                <option value="">Select Transporter</option>
                {transportPartners.map((partner) => (
                  <option key={partner._id} value={partner.name}>
                    {partner.name}
                  </option>
                ))}
              </select>
              <button onClick={() => setShowTransporterModal(true)} style={styles.addTransporterButton}>Add Transporter</button>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Destination:</label>
              <input type="text" style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Motor Vehicle Number:</label>
              <select 
                style={styles.inputField} 
                value={selectedVehicle} 
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.vehicleNumber}>
                    {vehicle.vehicleNumber} ({vehicle.name})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Bill of Lading/LR-RR NO:</label>
              <input type="text" placeholder="Optional" style={styles.inputField} />
            </div>
            <div style={styles.buttonContainer}>
              <button onClick={() => setCurrentBillingPart(1)} style={styles.prevButton}>Prev</button>
              <button onClick={handleSaveAndNext} style={styles.saveNextButton}>Save & Next</button>
            </div>
          </div>
        )}
      </div>

      {showTransporterModal && ( // Changed from showPartnerModal
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4>Add New Transporter</h4> {/* Changed title */}
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Name:</label>
              <input
                type="text"
                placeholder="Transporter Name"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                style={styles.inputField}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Number:</label>
              <input
                type="text"
                placeholder="Contact Number"
                value={transporterNumber}
                onChange={(e) => setTransporterNumber(e.target.value)}
                style={styles.inputField}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Address:</label>
              <input
                type="text"
                placeholder="Transporter Address"
                value={transporterAddress}
                onChange={(e) => setTransporterAddress(e.target.value)}
                style={styles.inputField}
              />
            </div>
            <div style={styles.modalButtonContainer}>
              <button onClick={handleAddTransporter} style={styles.saveButton}>Save Transporter</button>
              <button onClick={() => setShowTransporterModal(false)} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billings;