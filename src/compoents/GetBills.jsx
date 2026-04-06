import React, { Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Building2, 
  CreditCard, 
  Package,
  Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.setState({ bills: data, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  };

  toggleRow = (id) => {
    this.setState((prev) => ({
      expandedRow: prev.expandedRow === id ? null : id,
    }));
  };

  // --- PDF GENERATION LOGIC ---
  downloadPDF = (bill) => {
    const doc = new jsPDF();
    const dateStr = new Date(bill.billDate).toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(69, 102, 241); // Indigo color
    doc.text("TAX INVOICE", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: INV-${bill.invoiceNumber}`, 14, 25);
    doc.text(`Date: ${dateStr}`, 14, 30);

    // Seller & Buyer Details
    doc.setFont(undefined, 'bold');
    doc.text("Seller Details:", 14, 45);
    doc.text("Buyer Details:", 105, 45);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    // Split text to fit in columns
    const sellerLines = doc.splitTextToSize(bill.sellerDetails, 80);
    const buyerLines = doc.splitTextToSize(bill.buyerDetails, 80);
    doc.text(sellerLines, 14, 50);
    doc.text(buyerLines, 105, 50);

    // Items Table
    const tableRows = bill.goods.map(item => [
      item.purchaseItem,
      item.hsnSacNo || '-',
      item.qty,
      `Rs. ${item.rate}`,
      `Rs. ${(item.cgst + item.sgst).toFixed(2)}`,
      `Rs. ${item.totalAmount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Description', 'HSN/SAC', 'Qty', 'Rate', 'Tax (GST)', 'Total']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: Rs. ${bill.grandTotal.toLocaleString()}`, 140, finalY);

    // Bank Details
    doc.setFontSize(10);
    doc.text("Bank Details:", 14, finalY + 10);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    const bankLines = doc.splitTextToSize(bill.companyBankDetails, 180);
    doc.text(bankLines, 14, finalY + 15);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generated via Billing Dashboard", 105, 285, { align: "center" });

    // Save File
    doc.save(`Invoice_${bill.invoiceNumber}.pdf`);
  };

  render() {
    const { bills, loading, error, expandedRow } = this.state;

    if (loading) {
      return (
        <div style={styles.loaderContainer}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={styles.spinner}
          />
          <p style={styles.loadingText}>Preparing Your Dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <h3>⚠️ Error Fetching Bills</h3>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.header}
          >
            <div style={styles.headerContent}>
              <div style={styles.iconCircle}><FileText size={28} color="#fff" /></div>
              <div>
                <h2 style={styles.titleText}>My Invoices</h2>
                <p style={styles.subtitle}>Track and download your billing records</p>
              </div>
            </div>
          </motion.header>

          <div style={styles.contentWrapper}>
            {bills.length === 0 ? (
              <div style={styles.emptyState}>No bills found.</div>
            ) : (
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Invoice</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Amount</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, idx) => (
                      <React.Fragment key={bill._id}>
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          style={{
                            ...styles.tr,
                            backgroundColor: expandedRow === bill._id ? '#f5f7ff' : 'transparent'
                          }}
                        >
                          <td style={styles.td}>
                            <span style={styles.invoiceBadge}>#{bill.invoiceNumber}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.flexCenter}>
                              <Calendar size={14} style={{ marginRight: 8, color: '#64748b' }}/> 
                              {new Date(bill.billDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.amountText}>₹{bill.grandTotal.toLocaleString()}</div>
                          </td>
                          <td style={{ ...styles.td, textAlign: 'right' }}>
                            <div style={styles.actionContainer}>
                              <button onClick={() => this.toggleRow(bill._id)} style={styles.viewBtn}>
                                {expandedRow === bill._id ? 'Hide' : 'Details'}
                              </button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={styles.downloadBtn} 
                                onClick={() => this.downloadPDF(bill)}
                              >
                                <Download size={18} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Expandable Animation */}
                        <AnimatePresence>
                          {expandedRow === bill._id && (
                            <tr>
                              <td colSpan="4" style={{ padding: 0, border: 'none' }}>
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div style={styles.expandedWrapper}>
                                    <div style={styles.grid}>
                                      <DetailCard icon={<Building2 size={16}/>} label="Seller" value={bill.sellerDetails} />
                                      <DetailCard icon={<User size={16}/>} label="Buyer" value={bill.buyerDetails} />
                                      <DetailCard icon={<CreditCard size={16}/>} label="Bank" value={bill.companyBankDetails} />
                                    </div>

                                    <div style={styles.itemsTableContainer}>
                                      <table style={styles.innerTable}>
                                        <thead>
                                          <tr style={styles.innerThRow}>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Rate</th>
                                            <th>Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {bill.goods.map((item) => (
                                            <tr key={item._id} style={styles.innerTr}>
                                              <td>{item.purchaseItem}</td>
                                              <td>{item.qty}</td>
                                              <td>₹{item.rate}</td>
                                              <td style={{fontWeight: '700'}}>₹{item.totalAmount.toFixed(2)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// Sub-component for Details
const DetailCard = ({ icon, label, value }) => (
  <div style={styles.detailCard}>
    <div style={styles.detailHeader}>{icon} {label}</div>
    <div style={styles.detailValue}>{value}</div>
  </div>
);

const styles = {
  pageWrapper: { backgroundColor: '#f4f7fa', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: { marginBottom: '30px' },
  headerContent: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconCircle: { width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  titleText: { fontSize: '22px', fontWeight: '800', margin: 0 },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
  tableCard: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px 20px' },
  invoiceBadge: { fontWeight: '700', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '6px' },
  amountText: { fontWeight: '700', fontSize: '15px' },
  actionContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  viewBtn: { padding: '8px 15px', borderRadius: '8px', border: 'none', backgroundColor: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: '600' },
  downloadBtn: { padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', color: '#475569', cursor: 'pointer' },
  expandedWrapper: { padding: '20px', backgroundColor: '#fcfcfe' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' },
  detailCard: { padding: '15px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #f1f5f9' },
  detailHeader: { fontSize: '11px', fontWeight: '800', color: '#6366f1', marginBottom: '5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' },
  detailValue: { fontSize: '12px', color: '#475569', whiteSpace: 'pre-line' },
  itemsTableContainer: { borderRadius: '10px', overflow: 'hidden', border: '1px solid #f1f5f9' },
  innerTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  innerThRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  innerTr: { borderBottom: '1px solid #f1f5f9' },
  loaderContainer: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%' },
  loadingText: { marginTop: '10px', fontWeight: '600', color: '#6366f1' },
  flexCenter: { display: 'flex', alignItems: 'center' }
};

export default GetBills;