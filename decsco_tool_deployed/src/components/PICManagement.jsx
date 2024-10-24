import React, { createContext, useContext, useState, useEffect } from 'react';
import './PICManagement.css';

// Create context for PIC management
export const PICContext = createContext();

// Create custom hook for PIC updates
export const usePICUpdates = () => {
  const context = useContext(PICContext);
  if (!context) {
    throw new Error('usePICUpdates must be used within a PICProvider');
  }
  return context;
};

// Create context provider component
export const PICProvider = ({ children }) => {
  const [users, setUsers] = useState([]);

  const loadUsers = () => {
    const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    setUsers(validUsers.map(user => ({
      username: user.username,
      email: user.email
    })));
  };

  // Add a refresh function that can be called from other components
  const refreshUsers = () => {
    loadUsers();
  };

  useEffect(() => {
    loadUsers();

    // Listen for custom event for staff updates
    const handleStaffUpdate = () => {
      loadUsers();
    };

    window.addEventListener('staffUpdated', handleStaffUpdate);
    window.addEventListener('storage', loadUsers);

    return () => {
      window.removeEventListener('staffUpdated', handleStaffUpdate);
      window.removeEventListener('storage', loadUsers);
    };
  }, []);

  return (
    <PICContext.Provider value={{ users, refreshUsers }}>
      {children}
    </PICContext.Provider>
  );
};

// PIC Selection Component
export const PICSelection = ({ value, onChange, className, id, name }) => {
  const { users } = usePICUpdates();

  if (!users || users.length === 0) {
    return <div className="no-users">No users available</div>;
  }

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
    >
      <option value="">-Select a PIC-</option>
      {users.map((user, index) => (
        <option key={index} value={user.username}>
          {user.username}
        </option>
      ))}
    </select>
  );
};

export default { PICSelection, PICProvider, usePICUpdates };