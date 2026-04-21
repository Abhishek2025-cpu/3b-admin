import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoiceDollar, faTachometerAlt, faStickyNote, faPlusSquare, faList,
  faUsers, faUserTie, faUserFriends, faComments, faUserPlus, faUsersCog,
  faThLarge, faBoxOpen, faBox, faShoppingCart, faChevronDown, faQrcode,
  faGlobe, faUserShield, faUndo, faArchive, faBarcode, faCogs, faTasks
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
  nestedOpen: { maxHeight: '1000px' },
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
  const location = useLocation();

  const userRole = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';
  const userEmail = localStorage.getItem('userEmail') || '';
  const permissions = JSON.parse(localStorage.getItem('permissions') || '{}');

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

  const hasAccess = (path) => {
    if (userRole === 'admin') return true;
    const keys = path.split('.');
    let current = permissions;
    for (const key of keys) {
      if (current === undefined || current === null) return false;
      current = current[key];
    }
    return current === true;
  };

  const matches = (text) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
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
        
        {hasAccess('dashboard') && matches("Dashboard") && (
          <LinkMenuItem icon={faTachometerAlt} text="Dashboard" to="/manager/dashboard" />
        )}

        {(hasAccess('stickers.add') || hasAccess('stickers.view')) && (
          <>
            <DropdownMenuItem icon={faStickyNote} text="Sticker" isOpen={openMenus.sticker} onClick={(e) => toggleNested(e, "sticker")} />
            <ul style={{ ...styles.nested, ...(openMenus.sticker ? styles.nestedOpen : {}) }}>
              {hasAccess('stickers.add') && matches("Add") && <LinkMenuItem icon={faPlusSquare} text="Add" to="/manager/add-item" />}
              {hasAccess('stickers.view') && matches("View") && <LinkMenuItem icon={faList} text="View" to="/manager/view-items" />}
              {hasAccess('stickers.view') && matches("Scan") && <LinkMenuItem icon={faQrcode} text="Scan BarCode" to="/manager/scan-sticker" />}
            </ul>
          </>
        )}

        {(hasAccess('machines.operatorTable') || hasAccess('machines.mixtureTable') || hasAccess('machines.helperTable')) && (
          <>
            <DropdownMenuItem icon={faCogs} text="Machines" isOpen={openMenus.machines} onClick={(e) => toggleNested(e, 'machines')} />
            <ul style={{ ...styles.nested, ...(openMenus.machines ? styles.nestedOpen : {}) }}>
              {hasAccess('machines.operatorTable') && matches("Operator Table") && <LinkMenuItem icon={faPlusSquare} text="Operator Table" to="/manager/operators" />}
              {hasAccess('machines.helperTable') && matches("Worker Table") && <LinkMenuItem icon={faPlusSquare} text="Helper Table" to="/manager/worker" />}
              {hasAccess('machines.mixtureTable') && matches("Mixture Table") && <LinkMenuItem icon={faTasks} text="Mixture Table" to="/manager/add-machine" />}
            </ul>
          </>
        )}

        {(hasAccess('users.clients') || hasAccess('users.staff')) && (
          <>
            <DropdownMenuItem icon={faUsers} text="Users" isOpen={openMenus.users} onClick={(e) => toggleNested(e, 'users')} />
            <ul style={{ ...styles.nested, ...(openMenus.users ? styles.nestedOpen : {}) }}>
              {(hasAccess('users.clients.view') || hasAccess('users.clients.chat')) && (
                <>
                  <DropdownMenuItem icon={faUserTie} text="Clients" isOpen={openMenus.clients} onClick={(e) => toggleNested(e, 'clients')} />
                  <ul style={{ ...styles.nested, ...(openMenus.clients ? styles.nestedOpen : {}) }}>
                    {hasAccess('users.clients.view') && matches("View Clients") && <LinkMenuItem icon={faUserFriends} text="View Clients" to="/manager/view-clients" />}
                    {hasAccess('users.clients.chat') && matches("Chats") && <LinkMenuItem icon={faComments} text="Chats" to="/manager/chats" />}
                  </ul>
                </>
              )}
              {(hasAccess('users.staff.add') || hasAccess('users.staff.view')) && (
                <>
                  <DropdownMenuItem icon={faUsersCog} text="Staff" isOpen={openMenus.staff} onClick={(e) => toggleNested(e, 'staff')} />
                  <ul style={{ ...styles.nested, ...(openMenus.staff ? styles.nestedOpen : {}) }}>
                    {hasAccess('users.staff.add') && matches("Add Staff") && <LinkMenuItem icon={faUserPlus} text="Add Staff" to="/manager/add-staff" />}
                    {hasAccess('users.staff.view') && matches("View Staff") && <LinkMenuItem icon={faUsersCog} text="View Staff" to="/manager/manage-staff" />}
                  </ul>
                </>
              )}
            </ul>
          </>
        )}

        {(hasAccess('categories.newCategory') || hasAccess('categories.allCategories') || hasAccess('categories.otherCategories')) && (
          <>
            <DropdownMenuItem icon={faThLarge} text="Categories" isOpen={openMenus.categories} onClick={(e) => toggleNested(e, 'categories')} />
            <ul style={{ ...styles.nested, ...(openMenus.categories ? styles.nestedOpen : {}) }}>
              {hasAccess('categories.newCategory') && matches("New Category") && <LinkMenuItem icon={faPlusSquare} text="New Category" to="/manager/add-category" />}
              {hasAccess('categories.allCategories') && matches("All Categories") && <LinkMenuItem icon={faList} text="All Categories" to="/manager/view-categories" />}
              {hasAccess('categories.otherCategories') && matches("Other Categories") && <LinkMenuItem icon={faList} text="Other Categories" to="/manager/other-categories" />}
            </ul>
          </>
        )}

        {(hasAccess('products.allProducts') || hasAccess('products.scanQR') || hasAccess('products.inventory') || hasAccess('products.otherProducts') || hasAccess('products.dimensions')) && (
          <>
            <DropdownMenuItem icon={faBoxOpen} text="Products" isOpen={openMenus.products} onClick={(e) => toggleNested(e, 'products')} />
            <ul style={{ ...styles.nested, ...(openMenus.products ? styles.nestedOpen : {}) }}>
              {hasAccess('products.allProducts') && matches("All Products") && <LinkMenuItem icon={faBox} text="All Products" to="/manager/view-products" />}
              {hasAccess('products.scanQR') && matches("Scan QR") && <LinkMenuItem icon={faBarcode} text="Scan QR" to="/manager/scan-qr" />}
              {hasAccess('products.inventory') && matches("View Inventory") && <LinkMenuItem icon={faList} text="View Inventory" to="/manager/inventory-log" />}
              {hasAccess('products.otherProducts') && matches("Other Products") && <LinkMenuItem icon={faList} text="Other Products" to="/manager/other-products" />}
              {hasAccess('products.dimensions') && matches("Product Dimensions") && <LinkMenuItem icon={faStickyNote} text='Product Dimensions' to='/manager/product-dimensions' />}
            </ul>
          </>
        )}

        {hasAccess('orders') && matches("Orders") && <LinkMenuItem icon={faShoppingCart} text="Orders" to="/manager/orders" />}
        {hasAccess('billing') && matches("Billing") && <LinkMenuItem icon={faFileInvoiceDollar} text="Billing" to="/manager/billing" />}
        {hasAccess('allBills') && matches("All Bills") && <LinkMenuItem icon={faFileInvoiceDollar} text="All Bills" to="/manager/get-bills" />}
        {hasAccess('orderReturns') && matches("Order Returns") && <LinkMenuItem icon={faUndo} text="Order Returns" to="/manager/order-returns" />}
        {hasAccess('companies') && matches("Companies") && <LinkMenuItem icon={faGlobe} text="Companies" to="/manager/company" />}
        
        {userRole === 'admin' && matches("Admins") && <LinkMenuItem icon={faUserShield} text="Admins" to="/manager/admins" />}
        {hasAccess('admins') && matches("Permissions") && <LinkMenuItem icon={faUserShield} text="Permissions" to="/manager/permissions" />}
        
        {hasAccess('feedback') && matches("App Feedback") && <LinkMenuItem icon={faComments} text="App Feedback" to="/manager/feedback" />}
        {hasAccess('archivedClients') && matches("Archive Clients") && <LinkMenuItem icon={faArchive} text="Archive Clients" to="/manager/archive-clients" />}

      </ul>
    </div>
  );
}

export default Sidebar;