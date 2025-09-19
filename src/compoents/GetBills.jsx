import React, { Component } from 'react';

class GetBills extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bills: [],
      loading: true,
      error: null,
      expandedRow: null,
    };
  }

  componentDidMount() {
    this.fetchBills();
  }

  fetchBills = async () => {
    try {
      const response = await fetch(
        'https://threebapi-1067354145699.asia-south1.run.app/api/billings/get'
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.setState({ bills: data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
      console.error('Error fetching bills:', error);
    }
  };

  toggleRow = (id) => {
    this.setState((prev) => ({
      expandedRow: prev.expandedRow === id ? null : id,
    }));
  };

  downloadPDF = (bill) => {
    // Placeholder: Replace with actual PDF download logic
    alert(`Downloading PDF for Invoice #${bill.invoiceNumber}`);
  };

  render() {
    const { bills, loading, error, expandedRow } = this.state;

    const styles = {
      container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f7f6',
        minHeight: '100vh',
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fff',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      },
      th: {
        backgroundColor: '#452983',
        color: '#fff',
        padding: '12px',
        textAlign: 'left',
      },
      td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        verticalAlign: 'top',
      },
      stripedRow: {
        backgroundColor: '#fafafa',
      },
      button: {
        padding: '6px 12px',
        backgroundColor: '#452983',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
        marginRight: '6px',
        transition: 'background 0.3s ease',
      },
      buttonAlt: {
        backgroundColor: '#6a44b3',
      },
      collapseRow: {
        backgroundColor: '#f9f9f9',
      },
      goodsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
      },
      goodItem: {
        marginBottom: '6px',
        fontSize: '0.9em',
        lineHeight: '1.3',
      },
      detailBlock: {
        marginBottom: '10px',
        padding: '8px',
        backgroundColor: '#eef5f9',
        borderRadius: '6px',
      },
      detailHeading: {
        margin: '0 0 5px 0',
        fontWeight: 'bold',
        color: '#2c3e50',
      },
    };

    if (loading) {
      return <div style={{ textAlign: 'center' }}>Loading bills...</div>;
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', color: 'red' }}>Error: {error}</div>
      );
    }

    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: 'center', color: '#452983', marginBottom: '20px' }}>
          All Bills
        </h2>
        {bills.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No bills found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Invoice No</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Grand Total</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, idx) => (
                <React.Fragment key={bill._id}>
                  <tr style={idx % 2 === 0 ? styles.stripedRow : {}}>
                    <td style={styles.td}>{bill.invoiceNumber}</td>
                    <td style={styles.td}>
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>₹{bill.grandTotal.toFixed(2)}</td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.button,
                          ...(expandedRow === bill._id ? styles.buttonAlt : {}),
                        }}
                        onClick={() => this.toggleRow(bill._id)}
                      >
                        {expandedRow === bill._id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        style={styles.button}
                        onClick={() => this.downloadPDF(bill)}
                      >
                        Generate PDF
                      </button>
                    </td>
                  </tr>
                  {expandedRow === bill._id && (
                    <tr style={styles.collapseRow}>
                      <td colSpan="4" style={styles.td}>
                        <div style={styles.detailBlock}>
                          <p style={styles.detailHeading}>Seller Details</p>
                          <p>{bill.sellerDetails}</p>
                        </div>
                        <div style={styles.detailBlock}>
                          <p style={styles.detailHeading}>Buyer Details</p>
                          <p>{bill.buyerDetails}</p>
                        </div>
                        <div style={styles.detailBlock}>
                          <p style={styles.detailHeading}>Goods</p>
                          <ul style={styles.goodsList}>
                            {bill.goods.map((item) => (
                              <li key={item._id} style={styles.goodItem}>
                                <strong>{item.purchaseItem}</strong> (HSN/SAC:{' '}
                                {item.hsnSacNo || 'N/A'}) – Qty: {item.qty} @ ₹
                                {item.rate}{' '}
                                {item.rateType === 'per_unit' ? 'each' : ''}
                                <br />
                                Subtotal: ₹{item.subtotal.toFixed(2)} | CGST: ₹
                                {item.cgst.toFixed(2)} | SGST: ₹
                                {item.sgst.toFixed(2)} <br />
                                <strong>Total: ₹{item.totalAmount.toFixed(2)}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={styles.detailBlock}>
                          <p style={styles.detailHeading}>Company Bank Details</p>
                          <p>{bill.companyBankDetails}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default GetBills;

