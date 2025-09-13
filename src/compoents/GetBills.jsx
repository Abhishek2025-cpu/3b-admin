import React, { Component } from 'react';

class GetBills extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bills: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchBills();
  }

  fetchBills = async () => {
    try {
      const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/billings/get');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({ bills: data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
      console.error("Error fetching bills:", error);
    }
  };

  render() {
    const { bills, loading, error } = this.state;

    // Inline styles as JavaScript objects
    const styles = {
      container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f7f6', // Light background for the whole page
        minHeight: '100vh',
      },
      loadingError: {
        textAlign: 'center',
        padding: '20px',
        fontSize: '1.2em',
        color: '#555',
      },
      error: {
        color: 'red',
      },
      billList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto', // Center the grid
      },
      billCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
        transition: 'transform 0.2s ease-in-out',
      },
      billCardHover: { // Example of how to handle hover if using a library like styled-components
        // Note: Direct inline style doesn't support :hover pseudo-classes easily.
        // This is purely for conceptual illustration of styles.
        transform: 'translateY(-3px)',
      },
      cardTitle: {
        color: '#2c3e50',
        marginTop: '0',
        marginBottom: '10px',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        fontSize: '1.4em',
      },
      cardParagraph: {
        margin: '5px 0',
        fontSize: '0.95em',
        lineHeight: '1.4',
        color: '#34495e',
      },
      strongText: {
        color: '#2c3e50',
        fontWeight: 'bold',
      },
      goodsSectionTitle: {
        color: '#2c3e50',
        marginTop: '15px',
        marginBottom: '8px',
        borderTop: '1px dashed #eee',
        paddingTop: '10px',
        fontSize: '1.2em',
      },
      goodsList: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
      },
      goodItem: {
        backgroundColor: '#ecf0f1', // Light grey for item background
        border: '1px solid #e0e6e7',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '8px',
        fontSize: '0.9em',
        lineHeight: '1.3',
      },
      goodItemParagraph: {
        margin: '3px 0',
        color: '#34495e',
      }
    };

    if (loading) {
      return <div style={styles.loadingError}>Loading bills...</div>;
    }

    if (error) {
      return <div style={{...styles.loadingError, ...styles.error}}>Error: {error}</div>;
    }

    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>All Bills</h2>
        {bills.length === 0 ? (
          <p style={styles.loadingError}>No bills found.</p>
        ) : (
          <div style={styles.billList}>
            {bills.map((bill) => (
              <div key={bill._id} style={styles.billCard}>
                <h3 style={styles.cardTitle}>Invoice Number: {bill.invoiceNumber}</h3>
                <p style={styles.cardParagraph}><strong style={styles.strongText}>Seller Details:</strong> {bill.sellerDetails}</p>
                <p style={styles.cardParagraph}><strong style={styles.strongText}>Buyer Details:</strong> {bill.buyerDetails}</p>
                <p style={styles.cardParagraph}><strong style={styles.strongText}>Bill Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</p>
                <p style={styles.cardParagraph}><strong style={styles.strongText}>Grand Total:</strong> ₹{bill.grandTotal.toFixed(2)}</p>

                <h4 style={styles.goodsSectionTitle}>Goods:</h4>
                <ul style={styles.goodsList}>
                  {bill.goods.map((item) => (
                    <li key={item._id} style={styles.goodItem}>
                      <p style={styles.goodItemParagraph}>Item: <strong style={styles.strongText}>{item.purchaseItem}</strong> (HSN/SAC: {item.hsnSacNo || 'N/A'})</p>
                      <p style={styles.goodItemParagraph}>Qty: {item.qty} @ ₹{item.rate} {item.rateType === 'per_unit' ? 'each' : ''}</p>
                      <p style={styles.goodItemParagraph}>Subtotal: ₹{item.subtotal.toFixed(2)}</p>
                      <p style={styles.goodItemParagraph}>CGST: ₹{item.cgst.toFixed(2)}, SGST: ₹{item.sgst.toFixed(2)}</p>
                      <p style={styles.goodItemParagraph}>Total Amount: <strong style={styles.strongText}>₹{item.totalAmount.toFixed(2)}</strong></p>
                    </li>
                  ))}
                </ul>
                <p style={styles.cardParagraph}><strong style={styles.strongText}>Company Bank Details:</strong> {bill.companyBankDetails}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default GetBills;