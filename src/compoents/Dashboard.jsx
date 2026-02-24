import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const responsiveStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Poppins:wght@300;400;600&display=swap');

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes popIn { 
    0% { transform: scale(0.5); opacity: 0; } 
    100% { transform: scale(1); opacity: 1; } 
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
  }

  .ops-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: 1fr; }
    .ops-grid { grid-template-columns: repeat(2, 1fr); }
    .chart-wrapper { height: 300px !important; }
    .modal-content { width: 85% !important; padding: 30px 20px !important; }
    .greeting-text { font-size: 1.8rem !important; }
    .controls-container { flex-direction: column; align-items: flex-start !important; gap: 15px !important; }
  }
`;

const styles = {
  container: { padding: '15px', fontFamily: "'Poppins', sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { backgroundColor: '#fff', padding: '25px 15px', textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.4s ease' },
  modalContent: { backgroundColor: '#fff', padding: '50px', borderRadius: '28px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  greetingIcon: { fontSize: '3.5rem', marginBottom: '10px', display: 'block' },
  greetingText: { fontSize: '2.4rem', fontWeight: 'bold', color: '#333', margin: 0, fontFamily: "'Dancing Script', cursive" },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  dateInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', marginTop: '5px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', transition: 'transform 0.2s', border: '1px solid #f0f0f0' },
  statValue: { fontSize: '1.6rem', fontWeight: 'bold', color: '#6f42c1', margin: '8px 0' },
  chartBox: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '380px' },
  opCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', transition: 'all 0.3s' },
  activityBox: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }
};

const Card = ({ icon, title, onClick }) => (
  <div style={styles.opCard} onClick={onClick} className="op-item">
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#444' }}>{title}</div>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Manager';
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingInfo, setGreetingInfo] = useState({ text: '', icon: '' });
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreetingInfo({ text: 'Good Morning', icon: '☀️' });
    else if (hour < 17) setGreetingInfo({ text: 'Good Afternoon', icon: '🌤️' });
    else if (hour < 21) setGreetingInfo({ text: 'Good Evening', icon: '🌆' });
    else setGreetingInfo({ text: 'Good Night', icon: '🌙' });

    const timer = setTimeout(() => setShowGreeting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/orders/get-orders');
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
    setActivities(JSON.parse(sessionStorage.getItem("activities") || "[]"));
  }, []);

  const data = useMemo(() => {
    const filtered = orders.filter(o => {
      const d = o.createdAt.split('T')[0];
      return d >= startDate && d <= endDate;
    });

    let rev = 0;
    const stats = {}, sales = {};
    filtered.forEach(o => {
      rev += (o.totalAmount || 0);
      stats[o.currentStatus] = (stats[o.currentStatus] || 0) + 1;
      const d = o.createdAt.split('T')[0];
      sales[d] = (sales[d] || 0) + (o.totalAmount || 0);
    });

    return {
      statusData: Object.keys(stats).map(k => ({ name: k, value: stats[k] })),
      salesData: Object.keys(sales).sort().map(d => ({ date: d, sales: sales[d] })),
      totalRev: rev,
      totalOrders: filtered.length
    };
  }, [orders, startDate, endDate]);

  const formatINR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      {showGreeting && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="modal-content">
            <span style={styles.greetingIcon}>{greetingInfo.icon}</span>
            <h1 style={styles.greetingText} className="greeting-text">
              {greetingInfo.text}, <span style={{ color: '#6f42c1' }}>{userName}</span>
            </h1>
            <p style={{ color: '#888', marginTop: '10px', fontSize: '0.9rem' }}>LOADING YOUR COMMAND CENTER</p>
          </div>
        </div>
      )}

      <header style={styles.header}>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.2rem', color: '#333', margin: 0 }}>Hello, {userName}!</h2>
        <p style={{ color: '#777', margin: '5px 0 0', fontSize: '0.9rem' }}>Business Overview & Analytics</p>
      </header>

      <div style={styles.controls} className="controls-container">
        <h3 style={{ margin: 0, color: '#6f42c1', fontSize: '1.1rem' }}>📈 Performance</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>From <br/><input type="date" style={styles.dateInput} value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
          <label style={{ fontSize: '0.8rem', color: '#666' }}>To <br/><input type="date" style={styles.dateInput} value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading Analytics...</div> : (
        <>
          <div className="stats-grid">
            <div style={styles.card}>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Total Revenue</div>
              <div style={styles.statValue}>{formatINR(data.totalRev)}</div>
            </div>
            <div style={styles.card}>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Total Orders</div>
              <div style={styles.statValue}>{data.totalOrders}</div>
            </div>
            <div style={styles.card}>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Avg. Order Value</div>
              <div style={styles.statValue}>{formatINR(data.totalRev / (data.totalOrders || 1))}</div>
            </div>
          </div>

          <div className="charts-grid">
            <div style={styles.chartBox} className="chart-wrapper">
              <h4 style={{ margin: '0 0 15px', color: '#444' }}>Sales Trend</h4>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={data.salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="url(#colorSales)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.chartBox} className="chart-wrapper">
              <h4 style={{ margin: '0 0 15px', color: '#444' }}>Order Status</h4>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={data.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {data.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#333' }}>Quick Actions</h3>
      <div className="ops-grid">
        <Card icon="📦" title="Inventory" onClick={() => navigate('/manager/view-items')} />
        <Card icon="⚙️" title="Machines" />
        <Card icon="📝" title="Reports" />
        <Card icon="👥" title="Staff" onClick={() => navigate('/manager/manage-staff')} />
      </div>

      <div style={styles.activityBox}>
        <h3 style={{ margin: '0 0 15px', fontSize: '1.1rem', color: '#6f42c1' }}>Recent Activity</h3>
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.slice(0, 5).map(a => (
              <div key={a.id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#333' }}>{a.text}</span>
                <span style={{ color: '#aaa', fontSize: '0.75rem', marginLeft: '10px' }}>{a.time}</span>
              </div>
            ))}
          </div>
        ) : <p style={{ color: '#999', fontSize: '0.9rem' }}>No recent activities found.</p>}
      </div>
    </div>
  );
}

export default Dashboard;