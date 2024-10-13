import React, { useState } from 'react';
import './StaffDetails.css';

function StaffDetails({ staff, onClose, onUpdate }) {
  const [editedStaff, setEditedStaff] = useState({
    username: staff.username,
    email: staff.email,
    newPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedStaff(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedStaff = {
      ...staff,
      email: editedStaff.email,
      password: editedStaff.newPassword ? editedStaff.newPassword : staff.password
    };
    onUpdate(updatedStaff);
  };

  const togglePasswordVisibility = (passwordField) => {
    if (passwordField === 'current') {
      setShowCurrentPassword(!showCurrentPassword);
    } else if (passwordField === 'new') {
      setShowNewPassword(!showNewPassword);
    }
  };

  return (
    <div className="staff-details-overlay">
      <div className="staff-details-modal">
        <h2>Staff Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={editedStaff.username}
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedStaff.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password:</label>
            <div className="password-input-container">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={staff.password}
                readOnly
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <div className="password-input-container">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={editedStaff.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password to change"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showNewPassword}
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StaffDetails;