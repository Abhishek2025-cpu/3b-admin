// // src/components/Dashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const styles = {
//   dashboardContainer: { padding: '20px', fontFamily: "'Dancing Script', cursive" },
//   userInfo: { backgroundColor: '#f8f9fa', padding: '20px', textAlign: 'center', borderBottom: '2px solid #7853C2', marginBottom: '20px' },
//   dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
//   card: { backgroundColor: '#f5f5f5', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, boxShadow 0.2s' },
//   cardIcon: { fontSize: '2.5rem', marginBottom: '15px', color: '#6f42c1' },
//   cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' },

//   // NEW STYLES FOR RECENT ACTIVITY
//   recentActivityContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' },
//   recentTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#6f42c1' },
//   activityList: { listStyle: 'none', padding: 0, margin: 0 },
//   activityItem: { padding: '10px 0', borderBottom: '1px solid #eee' },
//   activityText: { fontSize: '1rem', color: '#333' },
//   timestamp: { fontSize: '0.8rem', color: '#777', marginLeft: '8px' }
// };

// // Simple card component
// const Card = ({ icon, title, onClick }) => (
//   <div style={styles.card} onClick={onClick}>
//     <div style={styles.cardIcon}>{icon}</div>
//     <div style={styles.cardTitle}>{title}</div>
//   </div>
// );

// function Dashboard() {
//   const userName = localStorage.getItem('userName') || 'Manager';
//   const navigate = useNavigate();


//   const [activities, setActivities] = useState([]);


// useEffect(() => {
//   const stored = JSON.parse(sessionStorage.getItem("activities") || "[]");
//   setActivities(stored);

//   const handleNewActivity = (e) => {
//     const newActivity = { id: Date.now(), ...e.detail };
//     setActivities(prev => [newActivity, ...prev]);

//     // keep in sessionStorage too
//     sessionStorage.setItem("activities", JSON.stringify([newActivity, ...prev]));
//   };

//   window.addEventListener("recent-activity", handleNewActivity);
//   return () => window.removeEventListener("recent-activity", handleNewActivity);
// }, []);







//   return (
//     <div style={styles.dashboardContainer}>
//       <div style={styles.userInfo}>
//         <h2>Welcome back, {userName}!</h2>
//         <p>Here's your overview for today.</p>
//       </div>

//       <div style={styles.dashboardGrid}>
//         <Card icon="ℹ️" title="Inventory Management" onClick={() => navigate('/manager/view-items')} />
//         <Card icon="🚚" title="Assign Machines" />
//         <Card icon="📊" title="View Reports" />
//         <Card icon="➕" title="Add Staff" onClick={() => navigate('/manager/manage-staff')} />
//       </div>

//       {/* Recent Activity Section */}
//       <div style={styles.recentActivityContainer}>
//         <h3 style={styles.recentTitle}>Recent Activity</h3>
//         <ul style={styles.activityList}>
//           {activities.map(activity => (
//             <li key={activity.id} style={styles.activityItem}>
//               <span style={styles.activityText}>{activity.text}</span>
//               <span style={styles.timestamp}>({activity.time})</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;









// src/components/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- STYLES ---
const styles = {
  dashboardContainer: { padding: '20px', fontFamily: "'Dancing Script', cursive", backgroundColor: '#f4f6f8', minHeight: '100vh' },
  userInfo: { backgroundColor: '#fff', padding: '20px', textAlign: 'center', borderBottom: '2px solid #7853C2', marginBottom: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  
  // Controls Section
  controlsContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' },
  dateInput: { padding: '8px', borderRadius: '5px', border: '1px solid #ddd', marginLeft: '5px' },
  
  // Stats Cards
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', textAlign: 'center', fontFamily: 'sans-serif' },
  statValue: { fontSize: '1.8rem', fontWeight: 'bold', color: '#6f42c1', margin: '10px 0' },
  statLabel: { color: '#666', fontSize: '0.9rem' },

  // Charts Grid
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' },
  chartWrapper: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '350px', fontFamily: 'sans-serif' },
  chartTitle: { fontSize: '1.2rem', marginBottom: '15px', color: '#333', borderLeft: '4px solid #6f42c1', paddingLeft: '10px' },

  // Existing Dashboard Actions
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, boxShadow 0.2s' },
  cardIcon: { fontSize: '2.5rem', marginBottom: '15px', color: '#6f42c1' },
  cardTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333' },

  // Recent Activity
  recentActivityContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' },
  recentTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#6f42c1', fontFamily: "'Dancing Script', cursive" },
  activityList: { listStyle: 'none', padding: 0, margin: 0 },
  activityItem: { padding: '10px 0', borderBottom: '1px solid #eee' },
  activityText: { fontSize: '1rem', color: '#333' },
  timestamp: { fontSize: '0.8rem', color: '#777', marginLeft: '8px' }
};

// --- COLORS ---
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

// Simple card component
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
  
  // Date Filters (Default: Last 30 days)
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Recent Activity Logic
    const stored = JSON.parse(sessionStorage.getItem("activities") || "[]");
    setActivities(stored);

    const handleNewActivity = (e) => {
      const newActivity = { id: Date.now(), ...e.detail };
      setActivities(prev => [newActivity, ...prev]);
      sessionStorage.setItem("activities", JSON.stringify([newActivity, ...prev]));
    };

    window.addEventListener("recent-activity", handleNewActivity);
    return () => window.removeEventListener("recent-activity", handleNewActivity);
  }, []);

  // --- DATA PROCESSING FOR CHARTS ---
  const processedData = useMemo(() => {
    if (!orders.length) return { statusData: [], salesData: [], productData: [], returnData: [], totalRevenue: 0, totalOrders: 0 };

    // 1. Filter by Date
    const filteredOrders = orders.filter(order => {
      const orderDate = order.createdAt.split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });

    // 2. Aggregate Status Counts (Pie Chart)
    const statusCounts = {};
    let revenue = 0;
    
    // 3. Aggregate Top Products (Bar Chart)
    const productCounts = {};

    // 4. Aggregate Sales Over Time (Area/Line Chart)
    const salesTimeline = {};

    // 5. Returns
    let returnCount = 0;
    let nonReturnCount = 0;

    filteredOrders.forEach(order => {
      // Status
      const status = order.currentStatus || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Revenue
      revenue += (order.totalAmount || 0);

      // Timeline
      const date = order.createdAt.split('T')[0];
      salesTimeline[date] = (salesTimeline[date] || 0) + (order.totalAmount || 0);

      // Returns
      if (order.returnEligible) returnCount++;
      else nonReturnCount++;

      // Products
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach(p => {
          const pName = p.productName || "Unknown Item";
          productCounts[pName] = (productCounts[pName] || 0) + (p.quantity || 1);
        });
      }
    });

    // Format Data for Recharts
    const statusData = Object.keys(statusCounts).map(key => ({ name: key, value: statusCounts[key] }));
    
    const productData = Object.keys(productCounts)
      .map(key => ({ name: key, count: productCounts[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    const salesData = Object.keys(salesTimeline)
      .sort()
      .map(date => ({ date, sales: salesTimeline[date] }));

    const returnData = [
      { name: 'Return Eligible', value: returnCount },
      { name: 'Non-Returnable', value: nonReturnCount }
    ];

    return {
      statusData,
      salesData,
      productData,
      returnData,
      totalRevenue: revenue,
      totalOrders: filteredOrders.length
    };
  }, [orders, startDate, endDate]);


  // --- FORMAT CURRENCY ---
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(val);

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.userInfo}>
        <h2>Welcome back, {userName}!</h2>
        <p>Sales Analytics & Operations Overview</p>
      </div>

      {/* --- DATE FILTERS --- */}
      <div style={styles.controlsContainer}>
        <h3 style={{ margin: 0 }}>📊 Sales Dashboard</h3>
        <div>
          <label>From: 
            <input 
              type="date" 
              style={styles.dateInput} 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </label>
          <label style={{ marginLeft: '15px' }}>To: 
            <input 
              type="date" 
              style={styles.dateInput} 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </label>
        </div>
      </div>

      {loading ? <p style={{ textAlign: 'center' }}>Loading Analytics...</p> : (
        <>
          {/* --- SUMMARY CARDS --- */}
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
              <div style={styles.statValue}>
                {processedData.totalOrders > 0 
                  ? formatCurrency(processedData.totalRevenue / processedData.totalOrders) 
                  : '₹0'}
              </div>
            </div>
          </div>

          {/* --- CHARTS GRID --- */}
          <div style={styles.chartsGrid}>
            
            {/* 1. Sales Trend Graph */}
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

            {/* 2. Order Status Distribution */}
            <div style={styles.chartWrapper}>
              <h4 style={styles.chartTitle}>📦 Order Status</h4>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={processedData.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {processedData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 3. Top Selling Products */}
            <div style={styles.chartWrapper}>
              <h4 style={styles.chartTitle}>🏆 Top 5 Products</h4>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={processedData.productData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" radius={[0, 10, 10, 0]}>
                    {processedData.productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4. Returns Analytics */}
            <div style={styles.chartWrapper}>
              <h4 style={styles.chartTitle}>🔄 Return Eligibility</h4>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={processedData.returnData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#ff8042" /> {/* Returnable */}
                    <Cell fill="#00C49F" /> {/* Non-Returnable */}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </>
      )}

      {/* --- MANAGEMENT LINKS --- */}
      <h3 style={{...styles.recentTitle, marginTop: '40px'}}>Operations</h3>
      <div style={styles.dashboardGrid}>
        <Card icon="ℹ️" title="Inventory Management" onClick={() => navigate('/manager/view-items')} />
        <Card icon="🚚" title="Assign Machines" />
        <Card icon="📊" title="View Reports" />
        <Card icon="➕" title="Add Staff" onClick={() => navigate('/manager/manage-staff')} />
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div style={styles.recentActivityContainer}>
        <h3 style={styles.recentTitle}>Recent Activity</h3>
        <ul style={styles.activityList}>
          {activities.length > 0 ? activities.map(activity => (
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