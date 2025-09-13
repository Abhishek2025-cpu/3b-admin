// src/components/Sidebar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";

import {
  faTachometerAlt, faStickyNote, faPlusSquare, faList, faUsers, faUserTie, faUserFriends,
  faComments, faUserPlus, faUsersCog, faThLarge, faBoxOpen, faBox,
  faShoppingCart, faCog, faChevronDown,faGlobe,faUserShield,faUndo
} from '@fortawesome/free-solid-svg-icons';

import profilePic from '../assets/3b.png'; 

const styles = {
    sideMenu: { position: 'fixed', top: 0, left: 0, width: '260px', height: '100%', backgroundColor: '#f5f5f5', boxShadow: '2px 0 5px rgba(0,0,0,0.2)', padding: '20px', zIndex: 2000, transform: 'translateX(-100%)', transition: 'transform 0.3s ease', overflowY: 'auto' },
    sideMenuOpen: { transform: 'translateX(0)' },
    closeBtn: { fontSize: '24px', cursor: 'pointer', fontWeight: 'bold', color: '#6f42c1', textAlign: 'right', marginBottom: '10px' },
    sideProfile: { textAlign: 'center', marginBottom: '20px' },
  profileImg: {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '10px',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
},

    profileName: { margin: '5px 0 2px', fontSize: '18px', color: '#6f42c1' },
    profileEmail: { fontSize: '13px', color: '#6f42c1' },
    menuList: { listStyle: 'none', padding: 0, margin: 0 },
    menuItem: { padding: '12px 10px', fontSize: '16px', color: '#6f42c1', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'background-color 0.2s', borderRadius: '5px' },
    activeMenuItem: { backgroundColor: '#e0d8f0', fontWeight: 'bold' },
    nested: { listStyle: 'none', paddingLeft: '0px', maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' },
    nestedOpen: { maxHeight: '500px' },
    arrow: { marginLeft: 'auto', transition: 'transform 0.3s ease' },
    arrowRotated: { transform: 'rotate(180deg)' },
    icon: { width: '20px', textAlign: 'center' }
};

// Component for items that are navigation links
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

// Component for items that open a dropdown menu
const DropdownMenuItem = ({ icon, text, isOpen, onClick }) => (
  <li style={styles.menuItem} onClick={onClick}>
    <FontAwesomeIcon icon={icon} style={styles.icon} />
    <span>{text}</span>
    <FontAwesomeIcon icon={faChevronDown} style={{ ...styles.arrow, ...(isOpen ? styles.arrowRotated : {}) }} />
  </li>
);

function Sidebar({ isOpen, onClose }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleNested = (e, menuId) => {
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };
  
  const userName = localStorage.getItem('userName') || 'Manager';
  const userEmail = "manager@3bprofiles.com";

  return (
    <div style={{ ...styles.sideMenu, ...(isOpen ? styles.sideMenuOpen : {}) }}>
      <div style={styles.closeBtn} onClick={onClose}>×</div>
      <div style={styles.sideProfile}>
        <img src={profilePic} alt="Profile" style={styles.profileImg} />
        <h4 style={styles.profileName}>{userName}</h4>
        <p style={styles.profileEmail}>{userEmail}</p>
      </div>
      <ul style={styles.menuList}>
        <LinkMenuItem icon={faTachometerAlt} text="Dashboard" to="/manager/dashboard" />

        {/* Sticker Menu */}
        <DropdownMenuItem icon={faStickyNote} text="Sticker" isOpen={openMenus.sticker} onClick={(e) => toggleNested(e, 'sticker')} />
        <ul style={{ ...styles.nested, ...(openMenus.sticker ? styles.nestedOpen : {}) }}>
          <LinkMenuItem icon={faPlusSquare} text="Add" to="/manager/add-item" />
          <LinkMenuItem icon={faList} text="View" to="/manager/view-items" />
        </ul>

        {/* Users Menu */}
        <DropdownMenuItem icon={faUsers} text="Users" isOpen={openMenus.users} onClick={(e) => toggleNested(e, 'users')} />
        <ul style={{ ...styles.nested, ...(openMenus.users ? styles.nestedOpen : {}) }}>
          <DropdownMenuItem icon={faUserTie} text="Clients" isOpen={openMenus.clients} onClick={(e) => toggleNested(e, 'clients')} />
          <ul style={{ ...styles.nested, ...(openMenus.clients ? styles.nestedOpen : {}) }}>
            <LinkMenuItem icon={faUserFriends} text="View Clients" to="/manager/view-clients" />
            <LinkMenuItem icon={faComments} text="Chats" to="/manager/chats" />
          </ul>
          <DropdownMenuItem icon={faUsersCog} text="Staff" isOpen={openMenus.staff} onClick={(e) => toggleNested(e, 'staff')} />
          <ul style={{ ...styles.nested, ...(openMenus.staff ? styles.nestedOpen : {}) }}>
            <LinkMenuItem icon={faUserPlus} text="Add Staff" to="/manager/add-staff" />
            <LinkMenuItem icon={faUsersCog} text="View Staff" to="/manager/manage-staff" />
          </ul>
        </ul>

        {/* --- ADDED: Categories Menu --- */}
        <DropdownMenuItem icon={faThLarge} text="Categories" isOpen={openMenus.categories} onClick={(e) => toggleNested(e, 'categories')} />
        <ul style={{ ...styles.nested, ...(openMenus.categories ? styles.nestedOpen : {}) }}>
          <LinkMenuItem icon={faPlusSquare} text="New Category" to="/manager/add-category" />
          <LinkMenuItem icon={faList} text="All Categories" to="/manager/view-categories" />
           <LinkMenuItem icon={faList} text="Other Categories" to="/manager/other-categories" />
        </ul>

        {/* --- ADDED: Products Menu --- */}
        <DropdownMenuItem icon={faBoxOpen} text="Products" isOpen={openMenus.products} onClick={(e) => toggleNested(e, 'products')} />
        <ul style={{ ...styles.nested, ...(openMenus.products ? styles.nestedOpen : {}) }}>
          {/* <LinkMenuItem icon={faBox} text="Add Products" to="/manager/add-product" /> */}
          <LinkMenuItem icon={faBox} text="All Products" to="/manager/view-products" />
           <LinkMenuItem icon={faList} text="Other Products" to="/manager/other-products"/>
        </ul>

        {/* Static Items */}
        <LinkMenuItem icon={faShoppingCart} text="Orders" to="/manager/orders" />
    <LinkMenuItem icon={faFileInvoiceDollar} text="Billing" to="/manager/billing" />
      <LinkMenuItem icon={faFileInvoiceDollar} text="All Bills" to="/manager/get-bills" />

        <LinkMenuItem icon={faUndo} text="Order Returns" to="/manager/order-returns" />
         <LinkMenuItem icon={faGlobe} text="Companies" to="/manager/company" />
         <LinkMenuItem icon={faUserShield} text="Admins" to="/manager/admins" />

        <LinkMenuItem icon={faComments} text="App Feedback" to="/manager/feedback" />
        <LinkMenuItem icon={faCog} text="Settings" to="/manager/settings" />
      </ul>
    </div>
  );
}

export default Sidebar;