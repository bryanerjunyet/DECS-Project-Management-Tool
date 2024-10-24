import React, { useState } from 'react';
import './AdminModal.css';

function AdminModal({ onClose, onAdminVerified, onStaffSelected }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUserTypeSelection = (userType) => {
    if (userType === 'staff') {
      onStaffSelected();
    } else {
      setIsAdmin(true);
    }
  };

  const handleAdminLogin = () => {
    const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    const adminUser = validUsers.find(user => user.username === 'Admin');
    
    if (username === 'Admin' && adminUser && adminUser.password === password) {
      onAdminVerified();
    } else {
      setError('Invalid admin credentials');
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        {!isAdmin ? (
          <>
            <h2>Select User Type</h2>
            <button onClick={() => handleUserTypeSelection('admin')}>Admin</button>
            <button onClick={() => handleUserTypeSelection('staff')}>Staff</button>
          </>
        ) : (
          <>
            <h2>Admin Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-message">{error}</p>}
            <button onClick={handleAdminLogin}>Login</button>
          </>
        )}
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default AdminModal;