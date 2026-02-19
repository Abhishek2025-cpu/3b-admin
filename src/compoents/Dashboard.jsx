// src/components/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- STYLES ---
const styles = {
  dashboardContainer: { padding: '20px', fontFamily: "'Poppins', sans-serif", backgroundColor: '#f4f6f8', minHeight: '100vh' },
  userInfo: { backgroundColor: '#fff', padding: '20px', textAlign: 'center', borderBottom: '2px solid #7853C2', marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  // --- GREETING MODAL STYLES ---
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    animation: 'fadeIn 0.5s ease-out'
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '40px 60px', borderRadius: '24px', textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    transform: 'scale(1)', animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  greetingIcon: { fontSize: '4rem', marginBottom: '15px', display: 'block' },
  greetingText: { fontSize: '2.5rem', fontWeight: 'bold', color: '#333', margin: 0, fontFamily: "'Dancing Script', cursive" },
  subGreeting: { fontSize: '1.1rem', color: '#666', marginTop: '10px', letterSpacing: '1px', textTransform: 'uppercase' },

  // Rest of your existing styles...
  controlsContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  dateInput: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', marginLeft: '5px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', textAlign: 'center' },
  statValue: { fontSize: '1.8rem', fontWeight: 'bold', color: '#6f42c1', margin: '10px 0' },
  statLabel: { color: '#666', fontSize: '0.9rem' },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
  chartWrapper: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '350px' },
  chartTitle: { fontSize: '1.2rem', marginBottom: '15px', color: '#333', borderLeft: '4px solid #6f42c1', paddingLeft: '10px' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '15px', color: '#6f42c1' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' },
  recentActivityContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
  recentTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#6f42c1', fontFamily: "'Dancing Script', cursive" },
  activityList: { listStyle: 'none', padding: 0, margin: 0 },
  activityItem: { padding: '10px 0', borderBottom: '1px solid #eee' },
  activityText: { fontSize: '1rem', color: '#333' },
  timestamp: { fontSize: '0.8rem', color: '#777', marginLeft: '8px' }
};

// CSS Animations as a Global Style string
const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn { 
    0% { transform: scale(0.5); opacity: 0; } 
    100% { transform: scale(1); opacity: 1; } 
  }
`;

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const Card = ({ icon, title, onClick }) => (
  <div style={styles.card} onClick={onClick}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={styles.cardTitle}>{title}</div>
  </div>
);

function Dashboard() {
  const userName = localStorage.getItem('userName') || 'Manager';
  const navigate = useNavigate();

  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true); // Control Greeting Visibility
  const [greetingInfo, setGreetingInfo] = useState({ text: '', icon: '' });

  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- LOGIC FOR GREETING ---
  useEffect(() => {
    const hour = new Date().getHours();
    let welcome = { text: '', icon: '' };

    if (hour < 12) welcome = { text: 'Good Morning', icon: '☀️' };
    else if (hour < 17) welcome = { text: 'Good Afternoon', icon: '🌤️' };
    else if (hour < 21) welcome = { text: 'Good Evening', icon: '🌆' };
    else welcome = { text: 'Good Night', icon: '🌙' };

    setGreetingInfo(welcome);

    // Auto-hide popup after 3.5 seconds
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
        const data = await response.json();
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const stored = JSON.parse(sessionStorage.getItem("activities") || "[]");
    setActivities(stored);

    const handleNewActivity = (e) => {
      const newActivity = { id: Date.now(), ...e.detail };
      setActivities(prev => [newActivity, ...prev]);
    };
    window.addEventListener("recent-activity", handleNewActivity);
    return () => window.removeEventListener("recent-activity", handleNewActivity);
  }, []);

  // --- DATA PROCESSING (useMemo) ---
  const processedData = useMemo(() => {
    if (!orders.length) return { statusData: [], salesData: [], productData: [], returnData: [], totalRevenue: 0, totalOrders: 0 };
    const filteredOrders = orders.filter(o => {
        const d = o.createdAt.split('T')[0];
        return d >= startDate && d <= endDate;
    });

    let revenue = 0;
    const statusCounts = {};
    const productCounts = {};
    const salesTimeline = {};
    let returns = 0;

    filteredOrders.forEach(order => {
      revenue += (order.totalAmount || 0);
      statusCounts[order.currentStatus] = (statusCounts[order.currentStatus] || 0) + 1;
      const date = order.createdAt.split('T')[0];
      salesTimeline[date] = (salesTimeline[date] || 0) + (order.totalAmount || 0);
      if (order.returnEligible) returns++;
      if (order.products) {
        order.products.forEach(p => {
          productCounts[p.productName] = (productCounts[p.productName] || 0) + (p.quantity || 1);
        });
      }
    });

    return {
      statusData: Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] })),
      salesData: Object.keys(salesTimeline).sort().map(d => ({ date: d, sales: salesTimeline[d] })),
      productData: Object.keys(productCounts).map(k => ({ name: k, count: productCounts[k] })).sort((a,b) => b.count-a.count).slice(0,5),
      returnData: [{name: 'Returnable', value: returns}, {name: 'Non-Returnable', value: filteredOrders.length - returns}],
      totalRevenue: revenue,
      totalOrders: filteredOrders.length
    };
  }, [orders, startDate, endDate]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div style={styles.dashboardContainer}>
      <style>{animationStyles}</style>

      {/* --- PREMIUM GREETING MODAL --- */}
      {showGreeting && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <span style={styles.greetingIcon}>{greetingInfo.icon}</span>
            <h1 style={styles.greetingText}>
              {greetingInfo.text}, <span style={{color: '#6f42c1'}}>{userName}!</span>
            </h1>
            <p style={styles.subGreeting}>System is ready for your operations</p>
          </div>
        </div>
      )}

      <div style={styles.userInfo}>
        <h2 style={{fontFamily: "'Dancing Script', cursive", fontSize: '2rem'}}>Welcome back, {userName}!</h2>
        <p>Sales Analytics & Operations Overview</p>
      </div>

      {/* --- DATE FILTERS --- */}
      <div style={styles.controlsContainer}>
        <h3 style={{ margin: 0, color: '#6f42c1' }}>📊 Performance Insights</h3>
        <div>
          <label>From: <input type="date" style={styles.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label style={{ marginLeft: '15px' }}>To: <input type="date" style={styles.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
        </div>
      </div>

      {loading ? <p style={{ textAlign: 'center' }}>Loading Analytics...</p> : (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Revenue</div>
              <div style={styles.statValue}>{formatCurrency(processedData.totalRevenue)}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Total Orders</div>
              <div style={styles.statValue}>{processedData.totalOrders}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Avg Order Value</div>
              <div style={styles.statValue}>{formatCurrency(processedData.totalRevenue / (processedData.totalOrders || 1))}</div>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            {/* Sales Trend */}
            <div style={styles.chartWrapper}>
              <h4 style={styles.chartTitle}>📅 Sales Trend</h4>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={processedData.salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status */}
            <div style={styles.chartWrapper}>
              <h4 style={styles.chartTitle}>📦 Order Status</h4>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={processedData.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                    {processedData.statusData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <h3 style={{...styles.recentTitle, marginTop: '40px'}}>Operations</h3>
      <div style={styles.dashboardGrid}>
        <Card icon="📦" title="Inventory Management" onClick={() => navigate('/manager/view-items')} />
        <Card icon="⚙️" title="Assign Machines" />
        <Card icon="📝" title="View Reports" />
        <Card icon="👥" title="Add Staff" onClick={() => navigate('/manager/manage-staff')} />
      </div>

      <div style={styles.recentActivityContainer}>
        <h3 style={styles.recentTitle}>Recent Activity</h3>
        <ul style={styles.activityList}>
          {activities.length > 0 ? activities.slice(0,5).map(activity => (
            <li key={activity.id} style={styles.activityItem}>
              <span style={styles.activityText}>{activity.text}</span>
              <span style={styles.timestamp}>({activity.time})</span>
            </li>
          )) : <p style={{color: '#999'}}>No recent system activity.</p>}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;