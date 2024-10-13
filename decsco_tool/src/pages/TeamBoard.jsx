import React, { useState, useEffect } from 'react';
import './TeamBoard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteModal from '../components/DeleteModal';

function TeamBoard() {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '' });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadStaffData();
  }, [startDate, endDate]);

  const loadStaffData = () => {
    const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    
    const staffWithWorkingHours = validUsers.map(user => {
      let totalWorkingTime = 0;

      storedSprints.forEach(sprint => {
        const sprintTasks = sprint.tasks || [];
        sprintTasks.forEach(task => {
          task.history.forEach(historyEntry => {
            if (isWithinDateRange(historyEntry.date) && historyEntry.activity.startsWith('In progress for') && historyEntry.staff == user.username) {
              const timeString = historyEntry.activity.split('In progress for ')[1];
              totalWorkingTime += convertTimeStringToMs(timeString);
            }
          });
        });
      });
      
      return {
        username: user.username,
        email: user.email || `${user.username.toLowerCase()}@gmail.com`,
        totalWorkingHours: formatTime(totalWorkingTime)
      };
    });
    
    setStaff(staffWithWorkingHours);
  };

  const isWithinDateRange = (dateString) => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateString);
    return date >= startDate && date <= endDate;
  };

  const convertTimeStringToMs = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 3600 + minutes * 60) * 1000;
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleAddStaff = () => {
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (newStaff.username && newStaff.email && newStaff.password) {
      const updatedStaff = [...staff, { 
        username: newStaff.username, 
        email: newStaff.email,
        totalWorkingHours: '0h 0m 0s'
      }];
      setStaff(updatedStaff);
      
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


  const toggleDeleteButtons = () => {
    setShowDeleteButtons(!showDeleteButtons);
  };

  const handleDeleteClick = (staffMember) => {
    setStaffToDelete(staffMember);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      const updatedStaff = staff.filter(member => member.username !== staffToDelete.username);
      setStaff(updatedStaff);
      
      const existingUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
      const updatedUsers = existingUsers.filter(user => user.username !== staffToDelete.username);
      localStorage.setItem('validUsers', JSON.stringify(updatedUsers));
      
      setStaffToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setStaffToDelete(null);
    setIsDeleteModalOpen(false);
  };


  return (
    <div className="team-board">
      <header className="page-header">
        <h1>Team Board</h1>
        <button className="add-staff-button" onClick={handleAddStaff}>+ Add Staff</button>
      </header>
      <div className="date-filter">
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date "
        />
        <div className="filter-icon"></div>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date "
        />
      </div>
      <div className="team-table-container">
        <button className="delete-staff-btn" onClick={toggleDeleteButtons}>
          {showDeleteButtons}
        </button>
        <table className="team-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Email</th>
              <th>Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member, index) => (
              <tr key={index}>
                <td>
                  {member.username}
                  {showDeleteButtons && (
                    <button className="delete-staff-round-btn" onClick={() => handleDeleteClick(member)}>
                      -
                    </button>
                  )}
                </td>
                <td>{member.email}</td>
                <td>{member.totalWorkingHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {isDeleteModalOpen && (
        <DeleteModal
          staff={staffToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default TeamBoard;