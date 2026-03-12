import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTag, faPlus, faTrash, faPaperPlane, 
  faSearch, faBell, faTimes, faCheck, faUser,
  faFilter, faCircle, faUsers
} from '@fortawesome/free-solid-svg-icons';
// API Controller Import
import { fetchUserProfiles } from '../compoents/Services/userController'; 

const LabelNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Harsh Kumar', label: 'Offer', date: '2023-10-25', status: 'Sent' },
    { id: 2, title: 'Vishali Sharma', label: 'Alert', date: '2023-10-24', status: 'Pending' },
  ]);

  const [users, setUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearch, setModalSearch] = useState(""); // Modal ke andar search ke liye
  const [selectedUsers, setSelectedUsers] = useState([]); // Multiple names store karne ke liye
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    label: 'Offer'
  });

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfiles();
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const deleteItem = (id) => {
    setNotifications(notifications.filter(item => item.id !== id));
  };

  // Checkbox toggle logic
  const handleUserToggle = (userName) => {
    if (selectedUsers.includes(userName)) {
      setSelectedUsers(selectedUsers.filter(u => u !== userName));
    } else {
      setSelectedUsers([...selectedUsers, userName]);
    }
  };

  // Select All logic
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.name));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return alert("Please select at least one Client");

    // Har selected user ke liye ek naya object banega
    const newEntries = selectedUsers.map((userName, index) => ({
      id: Date.now() + index, // Unique ID for each
      title: userName,
      label: formData.label,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Pending'
    }));

    setNotifications([...newEntries, ...notifications]);
    setSelectedUsers([]); // Reset selection
    setFormData({ label: 'Offer' }); 
    setIsModalOpen(false); 
  };

  const filteredNotifications = notifications.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // UI Styles
  const styles = {
    wrapper: { minHeight: '100vh', background: 'linear-gradient(135deg, #f6f8fb 0%, #e9effd 100%)', padding: '40px 20px', fontFamily: "'Inter', sans-serif", color: '#1e293b' },
    mainContainer: { maxWidth: '1100px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    iconBox: { background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', width: '50px', height: '50px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' },
    createBtn: { background: '#6366f1', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' },
    card: { background: '#ffffff', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9' },
    searchInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' },
    th: { padding: '12px 20px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' },
    td: { padding: '16px 20px', fontSize: '15px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
    statusBadge: (status) => ({ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: status === 'Sent' ? '#ecfdf5' : '#fff7ed', color: status === 'Sent' ? '#059669' : '#d97706' }),
    labelBadge: (type) => {
      const colors = { Offer: { bg: '#eef2ff', text: '#4f46e5' }, Alert: { bg: '#fef2f2', text: '#dc2626' }, Promo: { bg: '#faf5ff', text: '#9333ea' }, Update: { bg: '#f0fdfa', text: '#0d9488' } };
      const style = colors[type] || colors.Offer;
      return { padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: style.bg, color: style.text };
    },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
    modalContent: { background: '#fff', padding: '30px', borderRadius: '28px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
    userListScroll: { maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', marginTop: '10px', background: '#f8fafc' },
    userItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
    actionBtn: { width: '38px', height: '38px', borderRadius: '10px', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '8px' }
  };

  return (
    <div style={styles.wrapper}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.mainContainer}>
        
        {/* HEADER */}
        <header style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={styles.iconBox}><FontAwesomeIcon icon={faBell} size="lg" /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Notifications</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Multi-select clients and send labels</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} style={styles.createBtn} onClick={() => setIsModalOpen(true)}>
            <FontAwesomeIcon icon={faPlus} /> Create Campaign
          </motion.button>
        </header>

        {/* SEARCH & TABLE */}
        <div style={styles.card}>
          <div style={{ position: 'relative', marginBottom: '25px', maxWidth: '400px' }}>
            <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '16px', top: '15px', color: '#94a3b8' }} />
            <input type="text" placeholder="Search notifications..." style={styles.searchInput} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Client Name</th>
                <th style={styles.th}>Label Type</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filteredNotifications.map((note) => (
                  <motion.tr key={note.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ backgroundColor: '#fff' }}>
                    <td style={{ ...styles.td, fontWeight: '700' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FontAwesomeIcon icon={faUser} style={{ fontSize: '12px', color: '#94a3b8' }} />
                        </div>
                        {note.title}
                      </div>
                    </td>
                    <td style={styles.td}><span style={styles.labelBadge(note.label)}>{note.label}</span></td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{note.date}</td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(note.status)}>
                        <FontAwesomeIcon icon={faCircle} style={{ fontSize: '6px' }} /> {note.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button onClick={() => deleteItem(note.id)} style={{ ...styles.actionBtn, color: '#ef4444', background: '#fef2f2' }}><FontAwesomeIcon icon={faTrash} /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MULTI-SELECT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={styles.modalContent}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '20px', top: '20px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '800' }}>Create Labels</h3>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Select multiple clients from your database.</p>
              
              <form onSubmit={handleSubmit}>
                {/* User Search inside Modal */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <FontAwesomeIcon icon={faSearch} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    style={{ ...styles.searchInput, padding: '10px 10px 10px 35px', fontSize: '14px' }} 
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                   <label style={{ fontWeight: '600', fontSize: '14px' }}>Select Clients ({selectedUsers.length})</label>
                   <button type="button" onClick={handleSelectAll} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                     {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                   </button>
                </div>

                <div style={styles.userListScroll}>
                  {loading ? <p style={{ textAlign: 'center', fontSize: '12px' }}>Loading users...</p> : 
                    filteredUsers.map(user => (
                      <div key={user._id} style={styles.userItem} onClick={() => handleUserToggle(user.name)}>
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user.name)} 
                          onChange={() => {}} // Controlled via div click
                          style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '14px', color: '#334155' }}>{user.name}</span>
                      </div>
                    ))
                  }
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontWeight: '600', fontSize: '14px' }}>Choose Label Category</label>
                  <select 
                    style={{ ...styles.searchInput, padding: '12px', marginTop: '8px', appearance: 'auto' }}
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  >
                    <option value="Offer">🎁 Offer</option>
                    <option value="Alert">⚠️ Alert</option>
                    <option value="Promo">🚀 Promo</option>
                    <option value="Update">🔄 Update</option>
                  </select>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  type="submit" 
                  style={{ ...styles.createBtn, width: '100%', justifyContent: 'center', padding: '16px', marginTop: '25px' }}
                >
                  <FontAwesomeIcon icon={faCheck} /> Confirm & Generate {selectedUsers.length} Labels
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LabelNotifications;