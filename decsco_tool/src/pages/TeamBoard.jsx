import React, { useState, useEffect } from 'react';
import './TeamBoard.css';

function TeamBoard() {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '' });

  useEffect(() => {
    const loadStaffData = () => {
      const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
      const staffWithEmails = validUsers.map(user => ({
        username: user.username,
        email: user.email || `${user.username.toLowerCase()}@gmail.com`
      }));
      setStaff(staffWithEmails);
    };

    loadStaffData();
  }, []);

  const handleAddStaff = () => {
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (newStaff.username && newStaff.email && newStaff.password) {
      // Update staff state
      const updatedStaff = [...staff, { 
        username: newStaff.username, 
        email: newStaff.email 
      }];
      setStaff(updatedStaff);
      
      // Update validUsers in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
      const updatedUsers = [...existingUsers, { 
        username: newStaff.username, 
        password: newStaff.password,
        email: newStaff.email
      }];
      localStorage.setItem('validUsers', JSON.stringify(updatedUsers));
      
      setNewStaff({ username: '', email: '', password: '' });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="team-board">
      <header className="page-header">
        <h1>Team Board</h1>
        <button className="add-staff-button" onClick={handleAddStaff}>+ Add Staff</button>
      </header>
      <div className="team-table-container">
        {staff.length > 0 ? (
          <table className="team-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member, index) => (
                <tr key={index}>
                  <td>{member.username}</td>
                  <td>{member.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No staff members yet. Add some using the button below!</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Staff</h2>
            <input
              type="text"
              placeholder="Name"
              value={newStaff.username}
              onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              value={newStaff.password}
              onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
            />
            <div className="modal-buttons">
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamBoard;