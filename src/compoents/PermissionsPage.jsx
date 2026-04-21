import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, faUserShield, faCheckCircle, faCogs, faBox, 
  faUsers, faTags, faChevronDown, faLayerGroup, faChartLine, 
  faFileInvoiceDollar, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const BASE_URL = "https://threebapi-1067354145699.asia-south1.run.app";

const fetchSubAdmins = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/sub-admin/sub-admins`);
        return response.data.subAdmins || response.data;
    } catch (error) {
        return [];
    }
};

export const setPermissionsAPI = async (adminId, subAdminId, permissions) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/sub-admin/set-permissions`, {
            adminId,
            subAdminId,
            permissions
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message };
    }
};

const PermissionsPage = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [permissions, setPermissions] = useState({
    dashboard: false,
    stickers: { add: false, view: false },
    machines: { operatorTable: false, helperTable: false, mixtureTable: false },
    users: {
      clients: { view: false, chat: false },
      staff: { add: false, view: false }
    },
    categories: { newCategory: false, allCategories: false, otherCategories: false },
    products: { allProducts: false, scanQR: false, inventory: false, otherProducts: false, dimensions: false },
    orders: false,
    billing: false,
    allBills: false,
    orderReturns: false,
    companies: false,
    admins: false,
    feedback: false,
    archivedClients: false
  });

  useEffect(() => {
    const getAdmins = async () => {
      setFetching(true);
      const data = await fetchSubAdmins();
      setSubAdmins(data);
      if (data && data.length > 0) {
        setSelectedAdminId(data[0]._id);
        setPermissions(data[0].permissions || permissions);
      }
      setFetching(false);
    };
    getAdmins();
  }, []);

  const handleAdminChange = (e) => {
    const adminId = e.target.value;
    setSelectedAdminId(adminId);
    const selectedAdmin = subAdmins.find(admin => admin._id === adminId);
    if (selectedAdmin && selectedAdmin.permissions) {
      setPermissions(selectedAdmin.permissions);
    }
  };

  const togglePermission = (path) => {
    const keys = path.split('.');
    setPermissions(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = !current[keys[keys.length - 1]];
      return newState;
    });
  };

  const handleSave = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    const loggedInAdminId = "679f6432f8f63583569c7336"; 
    
    const result = await setPermissionsAPI(loggedInAdminId, selectedAdminId, permissions);
    
    setLoading(false);
    if (result.success || result) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } else {
      alert("Error: " + result.message);
    }
  };

  const Toggle = ({ active, onToggle, label }) => (
    <div className="permission-row" onClick={onToggle}>
      <span className="label-text">{label}</span>
      <div className={`modern-switch ${active ? 'on' : 'off'}`}>
        <motion.div className="handle" layout transition={{ type: "spring", stiffness: 700, damping: 30 }} />
      </div>
    </div>
  );

  if (fetching) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6366f1', fontWeight: 'bold'}}>Loading Admins...</div>;

  return (
    <div className="app-container">
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="success-toast">
            <FontAwesomeIcon icon={faCheckCircle} />
            <div>
              <strong>Success!</strong>
              <p>Permissions updated successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="confirm-modal">
              <div className="modal-icon"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
              <h2>Confirm Update</h2>
              <p>Are you sure you want to update permissions for this admin?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={handleSave}>Yes, Update</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="glass-header">
        <div className="header-info">
          <div className="icon-box"><FontAwesomeIcon icon={faUserShield} /></div>
          <div>
            <h1>Role Control Center</h1>
            <div className="custom-dropdown">
              <select value={selectedAdminId} onChange={handleAdminChange}>
                {subAdmins.map(admin => (
                  <option key={admin._id} value={admin._id}>{admin.name} ({admin.phone})</option>
                ))}
              </select>
              <FontAwesomeIcon icon={faChevronDown} className="drop-icon" />
            </div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`save-btn ${loading ? 'loading' : ''}`} onClick={() => setShowConfirmModal(true)} disabled={loading}>
          {loading ? <div className="loader-dots"><span></span><span></span><span></span></div> : <><FontAwesomeIcon icon={faSave} /> Update Access</>}
        </motion.button>
      </header>

      <motion.div className="permissions-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="card">
          <div className="card-banner p-purple"><FontAwesomeIcon icon={faChartLine} /><h3>Core System</h3></div>
          <div className="card-content">
            <Toggle label="Main Dashboard" active={permissions.dashboard} onToggle={() => togglePermission('dashboard')} />
            <Toggle label="Order Tracking" active={permissions.orders} onToggle={() => togglePermission('orders')} />
            <Toggle label="Admin View Access" active={permissions.admins} onToggle={() => togglePermission('admins')} />
          </div>
        </div>

        <div className="card">
          <div className="card-banner p-blue"><FontAwesomeIcon icon={faUsers} /><h3>User Management</h3></div>
          <div className="card-content">
            <h4 className="group-title">Clients</h4>
            <Toggle label="View Directory" active={permissions.users?.clients?.view} onToggle={() => togglePermission('users.clients.view')} />
            <Toggle label="Chat Access" active={permissions.users?.clients?.chat} onToggle={() => togglePermission('users.clients.chat')} />
            <Toggle label="Archived List" active={permissions.archivedClients} onToggle={() => togglePermission('archivedClients')} />
            <h4 className="group-title">Staff</h4>
            <Toggle label="Register New Staff" active={permissions.users?.staff?.add} onToggle={() => togglePermission('users.staff.add')} />
            <Toggle label="Staff Records" active={permissions.users?.staff?.view} onToggle={() => togglePermission('users.staff.view')} />
          </div>
        </div>

        <div className="card">
          <div className="card-banner p-green"><FontAwesomeIcon icon={faBox} /><h3>Product Engine</h3></div>
          <div className="card-content">
            <Toggle label="All Products List" active={permissions.products?.allProducts} onToggle={() => togglePermission('products.allProducts')} />
            <Toggle label="QR Scanner System" active={permissions.products?.scanQR} onToggle={() => togglePermission('products.scanQR')} />
            <Toggle label="Inventory Logs" active={permissions.products?.inventory} onToggle={() => togglePermission('products.inventory')} />
            <Toggle label="Product Specs" active={permissions.products?.dimensions} onToggle={() => togglePermission('products.dimensions')} />
            <Toggle label="Other Products" active={permissions.products?.otherProducts} onToggle={() => togglePermission('products.otherProducts')} />
          </div>
        </div>

        <div className="card">
          <div className="card-banner p-orange"><FontAwesomeIcon icon={faLayerGroup} /><h3>Categories & Labels</h3></div>
          <div className="card-content">
            <h4 className="group-title">Categories</h4>
            <Toggle label="Create New" active={permissions.categories?.newCategory} onToggle={() => togglePermission('categories.newCategory')} />
            <Toggle label="All Categories" active={permissions.categories?.allCategories} onToggle={() => togglePermission('categories.allCategories')} />
            <h4 className="group-title">Stickers</h4>
            <Toggle label="Add Sticker" active={permissions.stickers?.add} onToggle={() => togglePermission('stickers.add')} />
            <Toggle label="View Stickers" active={permissions.stickers?.view} onToggle={() => togglePermission('stickers.view')} />
          </div>
        </div>

        <div className="card">
          <div className="card-banner p-red"><FontAwesomeIcon icon={faFileInvoiceDollar} /><h3>Finance & Billing</h3></div>
          <div className="card-content">
            <Toggle label="Active Billing" active={permissions.billing} onToggle={() => togglePermission('billing')} />
            <Toggle label="All Bills History" active={permissions.allBills} onToggle={() => togglePermission('allBills')} />
            <Toggle label="Order Returns" active={permissions.orderReturns} onToggle={() => togglePermission('orderReturns')} />
            <Toggle label="Company Accounts" active={permissions.companies} onToggle={() => togglePermission('companies')} />
          </div>
        </div>

        <div className="card">
          <div className="card-banner p-cyan"><FontAwesomeIcon icon={faCogs} /><h3>Operations</h3></div>
          <div className="card-content">
            <h4 className="group-title">Machine Tables</h4>
            <Toggle label="Operator Table" active={permissions.machines?.operatorTable} onToggle={() => togglePermission('machines.operatorTable')} />
            <Toggle label="Helper Table" active={permissions.machines?.helperTable} onToggle={() => togglePermission('machines.helperTable')} />
            <Toggle label="Mixture Table" active={permissions.machines?.mixtureTable} onToggle={() => togglePermission('machines.mixtureTable')} />
            <h4 className="group-title">Feedback</h4>
            <Toggle label="User Feedback" active={permissions.feedback} onToggle={() => togglePermission('feedback')} />
          </div>
        </div>
      </motion.div>

      <style>{`
        :root { --bg: #f0f4f8; --glass: rgba(255, 255, 255, 0.8); --primary: #6366f1; }
        .app-container { background: var(--bg); min-height: 100vh; padding: 30px 5%; font-family: sans-serif; }
        .glass-header { background: var(--glass); backdrop-filter: blur(12px); padding: 25px 40px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border: 1px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header-info { display: flex; gap: 20px; align-items: center; }
        .icon-box { width: 55px; height: 55px; background: var(--primary); border-radius: 16px; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        h1 { margin: 0; font-size: 24px; color: #1e293b; }
        .custom-dropdown { position: relative; margin-top: 5px; }
        .custom-dropdown select { appearance: none; background: #f1f5f9; border: none; padding: 8px 40px 8px 15px; border-radius: 8px; font-weight: 600; color: #475569; cursor: pointer; min-width: 250px; outline: none; }
        .drop-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-size: 12px; pointer-events: none; }
        .save-btn { background: #1e293b; color: white; border: none; padding: 14px 30px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease; }
        .save-btn:hover { background: var(--primary); transform: translateY(-2px); }
        .permissions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 25px; }
        .card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #eef2f6; transition: 0.3s ease; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .card-banner { padding: 15px 25px; display: flex; align-items: center; gap: 12px; color: white; }
        .p-purple { background: linear-gradient(45deg, #8b5cf6, #a78bfa); }
        .p-blue { background: linear-gradient(45deg, #3b82f6, #60a5fa); }
        .p-green { background: linear-gradient(45deg, #10b981, #34d399); }
        .p-orange { background: linear-gradient(45deg, #f59e0b, #fbbf24); }
        .p-red { background: linear-gradient(45deg, #ef4444, #f87171); }
        .p-cyan { background: linear-gradient(45deg, #06b6d4, #22d3ee); }
        .card-content { padding: 20px; }
        .group-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin: 15px 0 10px 5px; }
        .permission-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; border-radius: 12px; cursor: pointer; }
        .permission-row:hover { background: #f8fafc; }
        .label-text { font-size: 15px; color: #334155; font-weight: 500; }
        .modern-switch { width: 48px; height: 24px; border-radius: 20px; padding: 3px; display: flex; align-items: center; transition: 0.3s; }
        .modern-switch.on { background: #10b981; justify-content: flex-end; }
        .modern-switch.off { background: #cbd5e1; justify-content: flex-start; }
        .handle { width: 18px; height: 18px; background: white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success-toast { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); background: #1e293b; color: white; padding: 15px 30px; border-radius: 16px; display: flex; align-items: center; gap: 15px; z-index: 1000; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .confirm-modal { background: white; padding: 40px; border-radius: 28px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
        .modal-icon { font-size: 50px; color: #f59e0b; margin-bottom: 20px; }
        .confirm-modal h2 { margin: 0 0 10px; color: #1e293b; }
        .confirm-modal p { color: #64748b; margin-bottom: 30px; line-height: 1.5; }
        .modal-actions { display: flex; gap: 15px; }
        .modal-actions button { flex: 1; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; }
        .cancel-btn { background: #f1f5f9; color: #475569; }
        .confirm-btn { background: #1e293b; color: white; }
        .confirm-btn:hover { background: #000; }

        .loader-dots { display: flex; gap: 4px; }
        .loader-dots span { width: 6px; height: 6px; background: white; border-radius: 50%; animation: bounce 0.5s infinite alternate; }
        @keyframes bounce { to { transform: translateY(-5px); opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default PermissionsPage;