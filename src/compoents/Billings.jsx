import React, { useState } from 'react';

const Billings = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateBillClick = async () => {
    setShowDropdown(true);
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
        // --- FIX #1: Simplified the filter ---
        // We only need to check if 'item.orderId' exists and is a string.
        const validOrders = result.orders.filter(item => typeof item.orderId === 'string');
        setOrders(validOrders);
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

  const handleOrderSelect = (event) => {
    setSelectedOrder(event.target.value);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Create a New Bill</h2>
      
      {!showDropdown ? (
        <button onClick={handleCreateBillClick} style={styles.button}>
          Create Bill
        </button>
      ) : (
        <div style={styles.dropdownContainer}>
          {isLoading && <p>Loading orders...</p>}
          {error && <p style={styles.errorText}>{error}</p>}
          
          {!isLoading && !error && orders.length > 0 && (
            <>
              <label htmlFor="order-select" style={styles.label}>
                Select an Order:
              </label>
              <select 
                id="order-select" 
                value={selectedOrder} 
                onChange={handleOrderSelect} 
                style={styles.select}
              >
                <option value="">-- Please choose an order --</option>
                {orders.map((item) => (
                  <option key={item._id} value={item.orderId}>
                    {/* --- FIX #2: Displaying the User's Name ---
                        We can now access item.user.name.
                    */}
                    {`${item.orderId} - (User: ${item.user?.name || 'N/A'})`}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {selectedOrder && (
        <div style={styles.selectionInfo}>
          <p>You have selected: <strong>{selectedOrder}</strong></p>
          <p>You can now proceed to generate the bill for this order.</p>
        </div>
      )}
    </div>
  );
};

// ... (keep the styles object as it was)
const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '2rem auto',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  button: {
    display: 'block',
    margin: '0 auto',
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
  },
  dropdownContainer: {
    marginTop: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  select: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  selectionInfo: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#e9f7ef',
    border: '1px solid #b7e4c7',
    borderRadius: '5px',
    textAlign: 'center',
  }
};

export default Billings;