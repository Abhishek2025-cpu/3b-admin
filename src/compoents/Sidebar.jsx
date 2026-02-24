import React, { useState, useEffect } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileInvoiceDollar, faTachometerAlt, faStickyNote, faPlusSquare, faList, 
  faUsers, faUserTie, faUserFriends, faComments, faUserPlus, faUsersCog, 
  faThLarge, faBoxOpen, faBox, faShoppingCart, faCog, faChevronDown, 
  faGlobe, faUserShield, faUndo, faBell, faCogs, faTasks, faArchive, faBarcode 
} from '@fortawesome/free-solid-svg-icons';
import profilePic from '../assets/3b.png';

const styles = {
    sideMenu: { position: 'fixed', top: 0, left: 0, width: '260px', height: '100%', backgroundColor: '#f5f5f5', boxShadow: '2px 0 5px rgba(0,0,0,0.2)', padding: '20px', zIndex: 2000, transform: 'translateX(-100%)', transition: 'transform 0.3s ease', overflowY: 'auto' },
    sideMenuOpen: { transform: 'translateX(0)' },
    closeBtn: { fontSize: '24px', cursor: 'pointer', fontWeight: 'bold', color: '#6f42c1', textAlign: 'right', marginBottom: '10px' },
    sideProfile: { textAlign: 'center', marginBottom: '20px' },
    profileImg: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto' },
    profileName: { margin: '5px 0 2px', fontSize: '18px', color: '#6f42c1' },
    profileEmail: { fontSize: '13px', color: '#6f42c1' },
    menuList: { listStyle: 'none', padding: 0, margin: 0 },
    menuItem: { padding: '12px 10px', fontSize: '16px', color: '#6f42c1', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'background-color 0.2s', borderRadius: '5px' },
    activeMenuItem: { backgroundColor: '#e0d8f0', fontWeight: 'bold' },
    nested: { listStyle: 'none', paddingLeft: '0px', maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' },
    nestedOpen: { maxHeight: '800px' },
    arrow: { marginLeft: 'auto', transition: 'transform 0.3s ease' },
    arrowRotated: { transform: 'rotate(180deg)' },
    icon: { width: '20px', textAlign: 'center' }
};

const LinkMenuItem = ({ icon, text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <li style={{ ...styles.menuItem, ...(isActive && styles.activeMenuItem) }}>
        <FontAwesomeIcon icon={icon} style={styles.icon} />
        <span>{text}</span>
      </li>
    </Link>
  );
};

const DropdownMenuItem = ({ icon, text, isOpen, onClick }) => (
  <li style={styles.menuItem} onClick={onClick}>
    <FontAwesomeIcon icon={icon} style={styles.icon} />
    <span>{text}</span>
    <FontAwesomeIcon icon={faChevronDown} style={{ ...styles.arrow, ...(isOpen ? styles.arrowRotated : {}) }} />
  </li>
);

function Sidebar({ isOpen, onClose, searchQuery = "" }) {
  const [openMenus, setOpenMenus] = useState({});
  const [userRole, setUserRole] = useState(null); 

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setUserRole(storedRole);
  }, []); 

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      setOpenMenus({
        sticker: true, machines: true, users: true, clients: true,
        staff: true, categories: true, products: true
      });
    }
  }, [searchQuery]);

  const toggleNested = (e, menuId) => {
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const userName = localStorage.getItem('userName') || 'Manager';
  const userEmail = "manager@3bprofiles.com"; 

  const matches = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const shouldShowGroup = (parentText, childrenArray = []) => {
    if (!searchQuery) return true;
    if (matches(parentText)) return true;
    return childrenArray.some(child => matches(child));
  };

  const isSidebarActive = isOpen || searchQuery.trim() !== "";

  return (
    <div style={{ ...styles.sideMenu, ...(isSidebarActive ? styles.sideMenuOpen : {}) }}>
      <div style={styles.closeBtn} onClick={onClose}>×</div>
      <div style={styles.sideProfile}>
        <img src={profilePic} alt="Profile" style={styles.profileImg} />
        <h4 style={styles.profileName}>{userName}</h4>
        <p style={styles.profileEmail}>{userEmail}</p>
      </div>
      <ul style={styles.menuList}>
        {matches("Dashboard") && <LinkMenuItem icon={faTachometerAlt} text="Dashboard" to="/manager/dashboard" />}
        {shouldShowGroup("Sticker", ["Add", "View"]) && (
          <>
            <DropdownMenuItem icon={faStickyNote} text="Sticker" isOpen={openMenus.sticker} onClick={(e) => toggleNested(e, 'sticker')} />
            <ul style={{ ...styles.nested, ...(openMenus.sticker ? styles.nestedOpen : {}) }}>
              {matches("Add") && <LinkMenuItem icon={faPlusSquare} text="Add" to="/manager/add-item" />}
              {matches("View") && <LinkMenuItem icon={faList} text="View" to="view-items" />}
            </ul>
          </>
        )}
        {shouldShowGroup("Machines", ["Operator Table", "Mixture Table"]) && (
          <>
            <DropdownMenuItem icon={faCogs} text="Machines" isOpen={openMenus.machines} onClick={(e) => toggleNested(e, 'machines')} /> 
            <ul style={{ ...styles.nested, ...(openMenus.machines ? styles.nestedOpen : {}) }}>
              {matches("Operator Table") && <LinkMenuItem icon={faPlusSquare} text="Operator Table" to="/manager/operators" />}
              {matches("Mixture Table") && <LinkMenuItem icon={faTasks} text="Mixture Table" to="/manager/add-machine" />}
            </ul>    
          </>
        )}
        {shouldShowGroup("Users", ["Clients", "View Clients", "Chats", "Staff", "Add Staff", "View Staff"]) && (
          <>
            <DropdownMenuItem icon={faUsers} text="Users" isOpen={openMenus.users} onClick={(e) => toggleNested(e, 'users')} />
            <ul style={{ ...styles.nested, ...(openMenus.users ? styles.nestedOpen : {}) }}>
              {shouldShowGroup("Clients", ["View Clients", "Chats"]) && (
                <>
                  <DropdownMenuItem icon={faUserTie} text="Clients" isOpen={openMenus.clients} onClick={(e) => toggleNested(e, 'clients')} />
                  <ul style={{ ...styles.nested, ...(openMenus.clients ? styles.nestedOpen : {}) }}>
                    {matches("View Clients") && <LinkMenuItem icon={faUserFriends} text="View Clients" to="/manager/view-clients" />}
                    {matches("Chats") && <LinkMenuItem icon={faComments} text="Chats" to="/manager/chats" />}
                  </ul>
                </>
              )}
              {shouldShowGroup("Staff", ["Add Staff", "View Staff"]) && (
                <>
                  <DropdownMenuItem icon={faUsersCog} text="Staff" isOpen={openMenus.staff} onClick={(e) => toggleNested(e, 'staff')} />
                  <ul style={{ ...styles.nested, ...(openMenus.staff ? styles.nestedOpen : {}) }}>
                    {matches("Add Staff") && <LinkMenuItem icon={faUserPlus} text="Add Staff" to="/manager/add-staff" />}
                    {matches("View Staff") && <LinkMenuItem icon={faUsersCog} text="View Staff" to="/manager/manage-staff" />}
                  </ul>
                </>
              )}
            </ul>
          </>
        )}
        {shouldShowGroup("Categories", ["New Category", "All Categories", "Other Categories"]) && (
          <>
            <DropdownMenuItem icon={faThLarge} text="Categories" isOpen={openMenus.categories} onClick={(e) => toggleNested(e, 'categories')} />
            <ul style={{ ...styles.nested, ...(openMenus.categories ? styles.nestedOpen : {}) }}>
              {matches("New Category") && <LinkMenuItem icon={faPlusSquare} text="New Category" to="/manager/add-category" />}
              {matches("All Categories") && <LinkMenuItem icon={faList} text="All Categories" to="/manager/view-categories" />}
              {matches("Other Categories") && <LinkMenuItem icon={faList} text="Other Categories" to="/manager/other-categories" />}
            </ul>
          </>
        )}
        {shouldShowGroup("Products", ["All Products", "Scan QR", "View Inventory", "Other Products", "Product Dimensions"]) && (
          <>
            <DropdownMenuItem icon={faBoxOpen} text="Products" isOpen={openMenus.products} onClick={(e) => toggleNested(e, 'products')} />
            <ul style={{ ...styles.nested, ...(openMenus.products ? styles.nestedOpen : {}) }}>
              {matches("All Products") && <LinkMenuItem icon={faBox} text="All Products" to="/manager/view-products" />}
              {matches("Scan QR") && <LinkMenuItem icon={faBarcode} text="Scan QR" to="/manager/scan-qr" />}
              {matches("View Inventory") && <LinkMenuItem icon={faList} text="View Inventory" to="/manager/inventory-log" />}
              {matches("Other Products") && <LinkMenuItem icon={faList} text="Other Products" to="/manager/other-products"/>}
              {matches("Product Dimensions") && <LinkMenuItem icon={faStickyNote} text = 'Product Dimensions' to = '/manager/product-dimensions'/>}
            </ul>
          </>
        )}
        {matches("Orders") && <LinkMenuItem icon={faShoppingCart} text="Orders" to="/manager/orders" />}
        {matches("Billing") && <LinkMenuItem icon={faFileInvoiceDollar} text="Billing" to="/manager/billing" />}
        {matches("All Bills") && <LinkMenuItem icon={faFileInvoiceDollar} text="All Bills" to="/manager/get-bills" />}
        {matches("Order Returns") && <LinkMenuItem icon={faUndo} text="Order Returns" to="/manager/order-returns" />}
        {matches("Companies") && <LinkMenuItem icon={faGlobe} text="Companies" to="/manager/company" />}
        {userRole === 'admin' && matches("Admins") && <LinkMenuItem icon={faUserShield} text="Admins" to="/manager/admins" />}
        {matches("Push Notifications") && <LinkMenuItem text="Push Notifications" to="/manager/notifications" icon={faBell} />}
        {matches("App Feedback") && <LinkMenuItem icon={faComments} text="App Feedback" to="/manager/feedback" />}
        {matches("Archive Clients") && <LinkMenuItem icon={faArchive} text="Archive Clients" to="/manager/archive-clients" />}
        {matches("Settings") && <LinkMenuItem icon={faCog} text="Settings" to="/manager/settings" />}
      </ul>
    </div>
  );
}

export default Sidebar;