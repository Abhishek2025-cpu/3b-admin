import React, { useState, useEffect, useRef } from 'react';

const styles = {
  pageContainer: {
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    position: 'relative',
  },
  openCardButton: {
    position: 'absolute',
    top: '20px',
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
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '15px',
    zIndex: 1000,
    width: '300px',
  },
  cardHeader: {
    marginTop: '0',
    marginBottom: '10px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  orderIdInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
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
  loadingText: {
    color: '#007bff',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
  noResultsText: {
    color: '#6c757d',
    textAlign: 'center',
    padding: '10px',
  },
  mainContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    marginTop: '20px',
  },
  mainHeader: {
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
  },
  addressSection: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    gap: '20px',
  },
  addressBox: {
    flex: '1',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fdfdfd',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    color: '#555',
    marginBottom: '15px',
    fontSize: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  textArea: {
    width: '100%',
    minHeight: '150px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    lineHeight: '1.5',
    resize: 'vertical',
    backgroundColor: '#f9f9f9',
  },
  warningText: {
    color: '#ffc107',
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px',
  },
  saveNextButton: {
    display: 'block',
    margin: '20px auto 0',
    padding: '12px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background-color 0.3s ease',
  },
  saveNextButtonHover: {
    backgroundColor: '#218838',
  },
  nextPartContent: {
    paddingTop: '20px',
  },
  invoiceHeader: {
    color: '#333',
    marginBottom: '25px',
    fontSize: '24px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
  },
  inputGroup: {
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  inputGroupLabel: {
    minWidth: '180px',
    marginRight: '10px',
    fontSize: '15px',
    color: '#555',
  },
  inputField: {
    flex: '1',
    padding: '9px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '200px',
  },
  addTransporterButton: {
    marginLeft: '10px',
    padding: '8px 12px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
    border: '1px solid #ddd',
  },
  tableCell: {
    padding: '10px',
    border: '1px solid #ddd',
    textAlign: 'left',
  },
  tableInput: {
    width: 'calc(100% - 10px)',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  rateDropdown: {
    width: 'calc(100% - 10px)',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '5px', // Added for spacing
  },
  totalAmountText: {
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: '10px',
    marginRight: '10px',
  },
  amountInWords: {
    fontSize: '16px',
    fontStyle: 'italic',
    textAlign: 'right',
    marginRight: '10px',
    marginBottom: '20px',
  },
  companyDetails: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  detailLabel: {
    minWidth: '150px',
    fontWeight: 'bold',
    color: '#555',
  },
  declarationContainer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  declarationText: {
    fontSize: '14px',
    color: '#666',
    marginLeft: '5px',
  },
  authoritySign: {
    marginTop: '40px',
    textAlign: 'right',
    paddingRight: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#444',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },
  prevButton: {
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background-color 0.3s ease',
  },
  prevButtonHover: {
    backgroundColor: '#5a6268',
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
    zIndex: 1000,
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
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
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

  const [totalPiecesPerBox, setTotalPiecesPerBox] = useState(0);
  const [deliveredDate, setDeliveredDate] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const [showTransporterModal, setShowTransporterModal] = useState(false);
  const [transporterName, setTransporterName] = useState('');
  const [transporterNumber, setTransporterNumber] = useState('');
  const [transporterAddress, setTransporterAddress] = useState('');
  const [transportPartners, setTransportPartners] = useState([]);
  const [selectedTransportPartner, setSelectedTransportPartner] = useState('');

  const [descriptionItems, setDescriptionItems] = useState([
    { id: 1, purchaseItem: '', hsnSac: '', qty: 0, rate: 0, rateType: 'Without GST', subtotal: 0, cgst: 0, sgst: 0, totalAmount: 0 }
  ]);
  const [companyBankDetails, setCompanyBankDetails] = useState('Account Name: 3B PROFILES\nBank:  KOTAK MAHINDRA BANK\nAccount No: 4647279768\nIFSC: KKBK0008262');
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);

  const [hsnCodes, setHsnCodes] = useState([]); // New state for HSN codes

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

  useEffect(() => {
    fetchVehicles();
    fetchTransportPartners();
    fetchHsnCodes(); // Fetch HSN codes when component mounts
  }, []);

  // Effect to recalculate totals when descriptionItems change
  useEffect(() => {
    setDescriptionItems(prevItems =>
      prevItems.map(item => {
        const qty = parseFloat(item.qty) || 0;
        const rate = parseFloat(item.rate) || 0;
        const GST_RATE_PERCENTAGE = 0.18; // 18% GST (9% CGST + 9% SGST)
        const SINGLE_GST_PERCENTAGE = GST_RATE_PERCENTAGE / 2; // 9%

        let subtotal;
        let cgst;
        let sgst;
        let totalAmount;

        if (item.rateType === 'With GST') {
          // If rate includes GST, we need to reverse calculate the base subtotal
          const totalInclusivePrice = qty * rate;
          subtotal = totalInclusivePrice / (1 + GST_RATE_PERCENTAGE);
          cgst = subtotal * SINGLE_GST_PERCENTAGE;
          sgst = subtotal * SINGLE_GST_PERCENTAGE;
          totalAmount = totalInclusivePrice;
        } else { // Without GST
          // If rate is without GST, calculate GST on top
          subtotal = qty * rate;
          cgst = subtotal * SINGLE_GST_PERCENTAGE;
          sgst = subtotal * SINGLE_GST_PERCENTAGE;
          totalAmount = subtotal + cgst + sgst;
        }

        return { ...item, subtotal, cgst, sgst, totalAmount };
      })
    );
  }, [descriptionItems.map(item => `${item.qty}-${item.rate}-${item.rateType}`).join(',')]);


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

  const fetchHsnCodes = async () => {
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/hsn/get');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setHsnCodes(result);
      } else {
        throw new Error('API response for HSN codes was not an array.');
      }
    } catch (err) {
      console.error("Failed to fetch HSN codes:", err);
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

    const totalPieces = order.products.reduce((sum, product) => sum + (product.totalPiecesPerBox || 0), 0);
    setTotalPiecesPerBox(totalPieces);
    setDeliveredDate(order.statusHistory.find(status => status.status === "Delivered")?.timestamp || '');

    // Populate description items based on selected order's products
    if (order.products && order.products.length > 0) {
      setDescriptionItems(
        order.products.map((p, index) => {
          const qty = p.quantity || 1;
          const rate = p.priceAtPurchase || 0;
          const GST_RATE_PERCENTAGE = 0.18; // 18% GST

          // Assume priceAtPurchase from API is 'Without GST' for initial display
          const subtotal = qty * rate;
          const cgst = subtotal * (GST_RATE_PERCENTAGE / 2);
          const sgst = subtotal * (GST_RATE_PERCENTAGE / 2);
          const totalAmount = subtotal + cgst + sgst;

          return {
            id: index + 1,
            purchaseItem: p.productName || `Product ${index + 1}`,
            hsnSac: p.productId || '', // Initialize HSN/SAC as empty string or a default value
            qty: qty,
            rate: rate,
            rateType: 'Without GST', // Default to Without GST based on API data structure
            subtotal: subtotal,
            cgst: cgst,
            sgst: sgst,
            totalAmount: totalAmount,
          };
        })
      );
    } else {
      setDescriptionItems([{ id: 1, purchaseItem: '', hsnSac: '', qty: 0, rate: 0, rateType: 'Without GST', subtotal: 0, cgst: 0, sgst: 0, totalAmount: 0 }]);
    }
  };

  const handleBillSelectClick = () => {
    setShowCard(prev => !prev);
    if (!showCard) {
      fetchOrders();
    }
  };

  const handleSaveAndNext = () => {
    if (currentBillingPart === 1) {
      if (selectedOrder) {
        setCurrentBillingPart(2);
        console.log("Proceeding to next billing part for order:", selectedOrder.orderId);
      } else {
        alert("Please select an order before proceeding.");
      }
    } else if (currentBillingPart === 2) {
      setCurrentBillingPart(3);
    } else if (currentBillingPart === 3) {
      // Handle final save or submission
      alert("Billing process complete! (This is where you'd submit the final data)");
      // Log the final descriptionItems for debugging
      console.log("Final Description Items:", descriptionItems);
      console.log("Grand Total:", calculateGrandTotal());
      console.log("Total CGST:", calculateTotalCGST());
      console.log("Total SGST:", calculateTotalSGST());
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

      fetchTransportPartners();

      setTransporterName('');
      setTransporterNumber('');
      setTransporterAddress('');
      setShowTransporterModal(false);

    } catch (err) {
      console.error("Failed to add transporter:", err);
      alert(`Failed to add transporter: ${err.message}`);
    }
  };

  const handleItemChange = (id, field, value) => {
    setDescriptionItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateGrandTotal = () => {
    return descriptionItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  };

  const calculateTotalSubtotal = () => {
    return descriptionItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const calculateTotalCGST = () => {
    return descriptionItems.reduce((sum, item) => sum + (item.cgst || 0), 0);
  };

  const calculateTotalSGST = () => {
    return descriptionItems.reduce((sum, item) => sum + (item.sgst || 0), 0);
  };

  const convertNumberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const numStr = Math.floor(num).toString(); // Get integer part
    let str = '';

    // Handle lakhs and crores for Indian numbering system
    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (n) {
      str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
      str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
      str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
      str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
      str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    }

    // Handle decimal part (paise)
    const decimalPart = Math.round((num - Math.floor(num)) * 100);
    if (decimalPart > 0) {
      str += (str ? ' and ' : '') + convertNumberToWords(decimalPart).replace(' only.', '') + ' paise';
    }

    return str ? str.trim() + ' only.' : 'Zero only.';
  };

  const updateBankDetails = () => {
    alert("Bank details updated! (In a real application, this would save to a backend.)");
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
                    {`${item.orderId} - User: ${item.user?.name || 'N/A'}`}
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
              <input type="text" value={selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Doc Dispatch No:</label>
              <input type="text" value={selectedOrder?.orderId || ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Delivery Date:</label>
              <input type="text" value={deliveredDate ? new Date(deliveredDate).toLocaleDateString() : ''} readOnly style={styles.inputField} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Dispatch Through:</label>
              <select
                style={styles.inputField}
                value={selectedTransportPartner}
                onChange={(e) => setSelectedTransportPartner(e.target.value)}
              >
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

        {currentBillingPart === 3 && (
          <div style={styles.nextPartContent}>
            <h3 style={styles.invoiceHeader}>Description of Goods</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Sr No.</th>
                  <th style={styles.tableHeader}>Purchase Item</th>
                  <th style={styles.tableHeader}>HSN/SAC No.</th> {/* Now a dropdown */}
                  <th style={styles.tableHeader}>Qty</th>
                  <th style={styles.tableHeader}>Rate (per unit)</th>
                  <th style={styles.tableHeader}>Rate Type</th>
                  <th style={styles.tableHeader}>Subtotal</th>
                  <th style={styles.tableHeader}>CGST (9%)</th>
                  <th style={styles.tableHeader}>SGST (9%)</th>
                  <th style={styles.tableHeader}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {descriptionItems.map((item, index) => (
                  <tr key={item.id}>
                    <td style={styles.tableCell}>{index + 1}</td>
                    <td style={styles.tableCell}>
                      <input
                        type="text"
                        value={item.purchaseItem}
                        onChange={(e) => handleItemChange(item.id, 'purchaseItem', e.target.value)}
                        style={styles.tableInput}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(item.id, 'hsnSac', e.target.value)}
                        style={styles.tableInput} // Reusing tableInput style for consistency
                      >
                        <option value="">Select HSN</option>
                        {hsnCodes.map((hsn) => (
                          <option key={hsn._id} value={hsn.hsnNumber}>
                            {hsn.hsnNumber} - {hsn.goodsName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                        style={styles.tableInput}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                        style={styles.tableInput}
                      />
                    </td>
                    <td style={styles.tableCell}>
                      <select
                        value={item.rateType}
                        onChange={(e) => handleItemChange(item.id, 'rateType', e.target.value)}
                        style={styles.rateDropdown}
                      >
                        <option value="Without GST">With GST</option>
                        <option value="With GST">Without GST</option>
                      </select>
                    </td>
                    <td style={styles.tableCell}>{item.subtotal !== undefined ? item.subtotal.toFixed(2) : '0.00'}</td>
                    <td style={styles.tableCell}>{item.cgst !== undefined ? item.cgst.toFixed(2) : '0.00'}</td>
                    <td style={styles.tableCell}>{item.sgst !== undefined ? item.sgst.toFixed(2) : '0.00'}</td>
                    <td style={styles.tableCell}>{item.totalAmount !== undefined ? item.totalAmount.toFixed(2) : '0.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.totalAmountText}>Total Subtotal: ₹ {calculateTotalSubtotal().toFixed(2)}</div>
            <div style={styles.totalAmountText}>Total CGST: ₹ {calculateTotalCGST().toFixed(2)}</div>
            <div style={styles.totalAmountText}>Total SGST: ₹ {calculateTotalSGST().toFixed(2)}</div>
            <div style={styles.totalAmountText}>Grand Total: ₹ {calculateGrandTotal().toFixed(2)}</div>
            <div style={styles.amountInWords}>Amount in Words: {convertNumberToWords(calculateGrandTotal())}</div>

            <div style={styles.companyDetails}>
              <h4 style={styles.sectionTitle}>Company Bank Details</h4>
              <textarea
                style={styles.textArea}
                value={companyBankDetails}
                onChange={(e) => setCompanyBankDetails(e.target.value)}
              />
              <button onClick={updateBankDetails} style={{ ...styles.saveNextButton, margin: '10px 0' }}>Update Bank Details</button>
            </div>

            <div style={styles.declarationContainer}>
              <h4 style={styles.sectionTitle}>Declaration</h4>
              <label>
                <input
                  type="checkbox"
                  checked={isDeclarationChecked}
                  onChange={(e) => setIsDeclarationChecked(e.target.checked)}
                />
                <span style={styles.declarationText}>
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                </span>
              </label>
            </div>

            <div style={styles.authoritySign}>
              For 3B PROFILES PRIVATE LIMITED
              <br />
              Authorised Signatory
            </div>

            <div style={styles.buttonContainer}>
              <button onClick={() => setCurrentBillingPart(2)} style={styles.prevButton}>Prev</button>
              <button onClick={handleSaveAndNext} style={styles.saveNextButton} disabled={!isDeclarationChecked}>Submit Bill</button>
            </div>
          </div>
        )}

      </div>

      {showTransporterModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h4 style={styles.cardHeader}>Add New Transport Partner</h4>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Name:</label>
              <input
                type="text"
                style={styles.inputField}
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Number:</label>
              <input
                type="text"
                style={styles.inputField}
                value={transporterNumber}
                onChange={(e) => setTransporterNumber(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputGroupLabel}>Address:</label>
              <input
                type="text"
                style={styles.inputField}
                value={transporterAddress}
                onChange={(e) => setTransporterAddress(e.target.value)}
              />
            </div>
            <div style={styles.modalButtonContainer}>
              <button onClick={() => setShowTransporterModal(false)} style={styles.cancelButton}>Cancel</button>
              <button onClick={handleAddTransporter} style={styles.saveButton}>Add Transporter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billings;