import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive } from '@fortawesome/free-solid-svg-icons';

const ArchivedClients = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch archived users
  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        const res = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/auth/users/archived');
        const data = await res.json();
        if (data.archivedUsers) {
          setClients(data.archivedUsers);
          setFilteredClients(data.archivedUsers);
        }
      } catch (error) {
        console.error('Error fetching archived users:', error);
      }
    };
    fetchArchivedUsers();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.deletedUserData.name.toLowerCase().includes(search.toLowerCase()) ||
      client.deletedUserData.email.toLowerCase().includes(search.toLowerCase()) ||
      client.deletedUserData.number.includes(search)
    );
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [search, clients]);

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentData = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
    },
    header: {
      textAlign: 'center',
      borderBottom: '2px solid #7853C2',
      marginBottom: '20px',
      paddingBottom: '10px',
      color: '#333',
    },
    searchBar: {
      padding: '8px 12px',
      width: '100%',
      maxWidth: '350px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    th: {
      backgroundColor: '#7853C2',
      color: '#fff',
      padding: '12px',
      textAlign: 'center',
    },
    td: {
      padding: '10px',
      textAlign: 'center',
      borderBottom: '1px solid #ddd',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      gap: '10px',
    },
    pageBtn: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #7853C2',
      backgroundColor: '#fff',
      color: '#7853C2',
      cursor: 'pointer',
    },
    activeBtn: {
      backgroundColor: '#7853C2',
      color: '#fff',
    },
    cardIcon: {
      fontSize: '2.5rem',
      marginBottom: '15px',
      color: '#6f42c1',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FontAwesomeIcon icon={faArchive} style={styles.cardIcon} />
        <h2>Archived Clients</h2>
      </div>

      <div style={{ textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, email, or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchBar}
        />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Sr. No.</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Number</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Deleted At</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((client, index) => (
              <tr key={client._id}>
                <td style={styles.td}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td style={styles.td}>{client.deletedUserData.name}</td>
                <td style={styles.td}>{client.deletedUserData.number}</td>
                <td style={styles.td}>{client.deletedUserData.email}</td>
                <td style={styles.td}>{client.deletedUserData.role}</td>
                <td style={styles.td}>
                  {new Date(client.deletedAt).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={styles.td} colSpan="6">
                No archived clients found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              style={{
                ...styles.pageBtn,
                ...(currentPage === i + 1 ? styles.activeBtn : {}),
              }}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedClients;
