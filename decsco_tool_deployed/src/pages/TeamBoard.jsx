import React, { useState, useEffect } from 'react';
import './TeamBoard.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DeleteModal from '../components/DeleteModal';
import GraphModal from '../components/GraphModal';
import StaffDetails from '../components/StaffDetails';

function TeamBoard({ isAdmin, currentUser }) {
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '' });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDeleteButtons, setShowDeleteButtons] = useState(false);
  const [showGraphButtons, setShowGraphButtons] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [selectedStaffForGraph, setSelectedStaffForGraph] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isStaffDetailsOpen, setIsStaffDetailsOpen] = useState(false);

  useEffect(() => {
    loadStaffData();
  }, [startDate, endDate, isAdmin, currentUser]);

  const loadStaffData = () => {
    // Add Admin account if it doesn't exist
    const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    if (!validUsers.some(user => user.username === 'Admin')) {
      validUsers.push({
        username: 'Admin',
        password: 'Admin12345',
        email: 'admin@gmail.com'
      });
      localStorage.setItem('validUsers', JSON.stringify(validUsers));
    }
    console.log(validUsers);
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    
    let staffToDisplay = isAdmin ? validUsers : validUsers.filter(user => user.username === currentUser.username);

    const staffWithWorkingHours = staffToDisplay.map(user => {
      let totalWorkingTime = 0;

      storedSprints.forEach(sprint => {
        const sprintTasks = sprint.tasks || [];
        sprintTasks.forEach(task => {
          task.history.forEach(historyEntry => {
            if (isWithinDateRange(historyEntry.date) && historyEntry.activity.startsWith('In progress for') && historyEntry.staff === user.username) {
              const timeString = historyEntry.activity.split('In progress for ')[1];
              totalWorkingTime += convertTimeStringToMs(timeString);
            }
          });
        });
      });
      
      const averageWorkingHours = calculateAverageWorkingHours(totalWorkingTime);
      
      return {
        username: user.username,
        email: user.email || `${user.username.toLowerCase()}@gmail.com`,
        averageWorkingHours,
        password: user.password // Include password for admin functions
      };
    });
    
    setStaff(staffWithWorkingHours);
  };

  const calculateAverageWorkingHours = (totalWorkingTime) => {
    let numberOfDays = 7; // Default to 7 days if no filter is applied
    
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate - startDate);
      numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    }
    
    const averageHoursPerDay = (totalWorkingTime / (1000 * 60 * 60)) / numberOfDays;
    return averageHoursPerDay.toFixed(2);
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
        totalWorkingHours: '0h 0m 0s',
        password: newStaff.password
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
    setShowGraphButtons(false);
  };

  const toggleGraphButtons = () => {
    setShowGraphButtons(!showGraphButtons);
    setShowDeleteButtons(false);
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

  const handleGraphClick = (staffMember) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const workingHours = getStaffWorkingHours(staffMember.username, oneWeekAgo, new Date());
    setSelectedStaffForGraph({ ...staffMember, workingHours });
    setIsGraphModalOpen(true);
  };

  const getStaffWorkingHours = (username, startDate, endDate) => {
    const storedSprints = JSON.parse(localStorage.getItem('sprints')) || [];
    const workingHours = {};

    storedSprints.forEach(sprint => {
      const sprintTasks = sprint.tasks || [];
      sprintTasks.forEach(task => {
        task.history.forEach(historyEntry => {
          if (
            historyEntry.staff === username &&
            historyEntry.activity.startsWith('In progress for') &&
            isWithinDateRange(historyEntry.date, startDate, endDate)
          ) {
            const date = new Date(historyEntry.date).toISOString().split('T')[0];
            const timeString = historyEntry.activity.split('In progress for ')[1];
            const timeInMs = convertTimeStringToMs(timeString);

            if (workingHours[date]) {
              workingHours[date] += timeInMs;
            } else {
              workingHours[date] = timeInMs;
            }
          }
        });
      });
    });

    return workingHours;
  };

  const handleRowClick = (staffMember) => {
    if (isAdmin) {
      setSelectedStaff(staffMember);
      setIsStaffDetailsOpen(true);
    }
  };

  const handleStaffUpdate = (updatedStaff) => {
    const updatedStaffList = staff.map(member => 
      member.username === updatedStaff.username ? updatedStaff : member
    );
    setStaff(updatedStaffList);
    
    const existingUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    const updatedUsers = existingUsers.map(user => 
      user.username === updatedStaff.username ? updatedStaff : user
    );
    localStorage.setItem('validUsers', JSON.stringify(updatedUsers));
    
    setIsStaffDetailsOpen(false);
  };

  return (
    <div className="team-board">
      <header className="page-header">
        <h1>Team Board</h1>
        {isAdmin && (
          <button className="add-staff-button" onClick={handleAddStaff}>+ Add Staff</button>
        )}
      </header>
      <div className="date-filter">
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
        />
        <div className="filter-icon"></div>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
        />
      </div>
      <div className="team-table-container">
        {isAdmin && (
          <button className="delete-staff-btn" onClick={toggleDeleteButtons}>
            {showDeleteButtons}
          </button>
        )}
        <button className="graph-staff-btn-general" onClick={toggleGraphButtons}>
          {showGraphButtons}
        </button>
        <table className="team-table">
          <thead>
            <tr>
              <th>Staff</th>
              <th>Email</th>
              <th>Avg. Working Hours</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member, index) => (
              <tr key={index} onClick={() => handleRowClick(member)} className={isAdmin ? 'clickable' : ''}>
                <td>
                  {member.username}
                  {isAdmin && showDeleteButtons && (
                    <button className="delete-staff-round-btn" onClick={(e) => { e.stopPropagation(); handleDeleteClick(member); }}>
                      -
                    </button>
                  )}
                  {showGraphButtons && (
                    <button className="graph-staff-btn-small" onClick={(e) => { e.stopPropagation(); handleGraphClick(member); }}>
                    </button>
                  )}
                </td>
                <td>{member.email}</td>
                <td>{member.averageWorkingHours}</td>
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

      {isGraphModalOpen && (
        <GraphModal
          staff={selectedStaffForGraph}
          onClose={() => setIsGraphModalOpen(false)}
          formatTime={formatTime}
        />
      )}

      {isStaffDetailsOpen && (
        <StaffDetails
          staff={selectedStaff}
          onClose={() => setIsStaffDetailsOpen(false)}
          onUpdate={handleStaffUpdate}
        />
      )}
    </div>
  );
}

export default TeamBoard;