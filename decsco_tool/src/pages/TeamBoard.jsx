import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VegaLite } from 'react-vega';
import './TeamBoard.css';

const TeamBoard = ({ userToken }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { userType } = useParams();
    const isAdmin = userType === 'admin';

    const [teamMembers, setTeamMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [tasksToReassign, setTasksToReassign] = useState([]);
    const [showGraphModal, setShowGraphModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
    const [showStaffPasswordChangeModal, setShowStaffPasswordChangeModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedStaffMember, setSelectedStaffMember] = useState('');


    useEffect(() => {
        if (startDate && endDate) {
            loadWorkTime();
        }
    }, [startDate, endDate])
    
    useEffect(() => {
      loadAvailableUsers();
    }, [memberToDelete]);
    
    const spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "autosize": {
        "resize": true
      },
      "description": "User's work hours over the selected time period",
      "data": {"name": "table"},
      "mark": {
        "type": "bar",
        "color": "red"
      },
      "encoding": {
        "x": {
          "field": "date",
          "type": "temporal",
          "title": "Date",
          "axis": {
            "format": "%b %d",
            "labelOverlap": true
          },
          "scale": {
            "nice": "day"
          }
          
        },
        "y": { "field": "work_time", "type": "quantitative", "title": "Total Work Hours" },
        "tooltip": [
          { "field": "date", "type": "temporal", "title": "Date", "format": "%b %d" },
          { "field": "work_time", "type": "quantitative", "title": "Total Work Hours" }
        ]
      },
      "config": {
        "view": {
          "fill": "black"
        }
      }
    }

    const handleDateChange = (e, setDateFunction) => {
        if (setDateFunction === setStartDate) {
            if ((e.target.value > endDate) && endDate) {
                alert("Start date cannot be after the end date.");
                return;
            }
        } else if (setDateFunction === setEndDate) {
            if ((e.target.value < startDate) && startDate) {
                alert("End date cannot be before the start date.");
                return;
            }
        }
        setDateFunction(e.target.value);
    };

    const handleGraphButtonClick = (member) => {
        setSelectedMember(member);
        setShowGraphModal(true);
    };

    const closeModal = () => {
        setShowGraphModal(false);
        setSelectedMember(null);
        setShowReassignModal(false);
        setMemberToDelete(null);
    };

  const loadWorkTime = async () => {
    try {
      const response = await fetch(
          `http://localhost:3001/team_board?user_token=${userToken}&start_date=${startDate}&end_date=${endDate}&self=${!isAdmin}`, {
          method: "GET"
     });
      if (!response.ok) throw new Error(`Status ${response.status} - Unable to retrieve work time data.`);
    
      if (response.status == 204) {
        setTeamMembers([]);
      }
      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      console.error('Error with retrieving work time data:', err);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const getRes = await fetch(`http://localhost:3001/users`, {
        method: "GET"
      });
      if (!getRes.ok) throw new Error(`Status ${getRes.status} - Error fetching users`);
      const data = await getRes.json();
      if (memberToDelete) {
        for (let i = 0; i < data.rows.length; i++) {
          const compRes = await fetch(`http://localhost:3001/users/compare_tokens?user_token_1=${memberToDelete}&user_token_2=${data.rows[i].user_id}`, {
            method: "GET"
          });
          if (!compRes.ok) throw new Error(`Status ${compRes.status} - Error comparing user tokens`);

          const compData = await compRes.json();
          if (compData.result == null) {
            throw new Error(`User token comparison is invalid`);
          } else if (compData.result) {
            delete data.rows[i];
            break;
          }
        }
      }
      setAvailableUsers(data.rows);
    } catch (err) {
      console.error('Error with loading available users:', err);
    }
  }

    //?!!
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      try {
        const response = await fetch(`http://localhost:3001/users?user_token=${userId}`, {
          method: 'DELETE',
        });

        if (response.status === 204) {
          loadWorkTime();
        } else if (response.status === 409) {
          const data = await response.json();
          setTasksToReassign(data);
          setMemberToDelete(userId);
          setShowReassignModal(true);
        } else {
          throw new Error(`Unknown Status ${response.status}`);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleReassignTasks = async (userToken) => {
    try {
      for (let i = 0; i < tasksToReassign.length; i++) {
        console.log(`user tok: ${userToken}`)
        const asRes = await fetch('http://localhost:3001/tasks', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            task_id: tasksToReassign[i].task_id,
            user_token: userToken,
          }),
        });

        if (!asRes.ok) throw new Error(`Status ${asRes.status} - Error for reassigning ${tasksToReassign[i].task_id}`);
      }

      const deleteRes = await fetch(`http://localhost:3001/users?user_token=${memberToDelete}`, {
        method: 'DELETE',
      });

      if (deleteRes.status == 204) {
        setShowReassignModal(false);
        setMemberToDelete(null);
        loadWorkTime();
      } else if (deleteRes.status != 409) {
        throw new Error(`Error with deletion: Status ${deleteRes.status}`)
      } else {
        throw new Error(`Task reassignment logic error.`)
      }
    } catch (err) {
      console.error('Error reassigning tasks:', err);
    }
  };

  const handleChangePassword = async (isAdminPassword = true) => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      clearPasswordFields();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_token: isAdminPassword ? userToken : selectedStaffMember,
          password: newPassword,
        }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        closePasswordModals();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      alert('An error occurred while changing the password');
    } finally {
      clearPasswordFields();
    }
  };

  const clearPasswordFields = () => {
    setNewPassword('');
    setConfirmPassword('');
    setSelectedStaffMember('');
  };

  const closePasswordModals = () => {
    setShowPasswordChangeModal(false);
    setShowStaffPasswordChangeModal(false);
    clearPasswordFields();
  };

  const formatTime = (s) => {
    const seconds = s % 60;
    const minutes = Math.floor(s / 60) % 60
    const hours = Math.floor(s / 3600);
    console.log(seconds, minutes, hours)
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="team-board">
      <header className="page-header">
        <h1>{isAdmin ? 'Admin Board' : 'Team Board'}</h1>
        <div className="date-inputs">
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e, setStartDate)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(e, setEndDate)}
            />
          </label>
        </div>
        {/* {isAdmin && (
          <>
            <button className="change-password-button" onClick={() => setShowPasswordChangeModal(true)}>
              Admin Password
            </button>
            <button className="change-password-button" onClick={() => setShowStaffPasswordChangeModal(true)}>
              Staff Password
            </button>
          </>
        )} */}
      </header>
      {isAdmin && (
        <>
          <button className="change-admin-password-button" onClick={() => setShowPasswordChangeModal(true)}>
            Change Admin Password
          </button>
          <button className="change-staff-password-button" onClick={() => setShowStaffPasswordChangeModal(true)}>
            Change Staff Password
          </button>
        </>
      )}

      <div className="team-table-container">
        <table className="team-table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Average Work Time</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.user_token}>
                <td className="staff-cell">
                  {isAdmin && (
                    <button 
                      className="action-button delete-button"
                      onClick={() => handleDeleteUser(member.user_token)}
                    >
                      Delete
                    </button>
                  )}
                  <span>{member.user_name}</span>
                </td>
                <td className="working-hours-cell">
                  <span>{formatTime(Math.floor(member.avg_work_hours * 3600))}</span>
                  <button
                    className="action-button graph-button"
                    onClick={() => handleGraphButtonClick(member)}
                  >
                    View Graph
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGraphModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" id="graph-content" onClick={(e) => e.stopPropagation()}>
            <h2>Graph for {selectedMember?.user_name}</h2>
            <div className="graph-container">
              <VegaLite spec={spec} data={{table: selectedMember.work_time_day}} />
            </div>
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {showReassignModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content reassign-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reassign Tasks</h2>
            <p>The user has tasks assigned. Please select a new user to reassign the tasks to:</p>
            <select onChange={(e) => handleReassignTasks(e.target.value)}>
              <option value="">Select a user</option>
              {availableUsers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user_name}
                </option>
              ))}
            </select>
            <button className="close-button" onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      {showPasswordChangeModal && (
        <div className="modal-overlay" onClick={closePasswordModals}>
          <div className="modal-content password-change-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Change Admin Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={() => handleChangePassword(true)}>Change Password</button>
            <button onClick={closePasswordModals}>Cancel</button>
          </div>
        </div>
      )}

      {showStaffPasswordChangeModal && (
        <div className="modal-overlay" onClick={closePasswordModals}>
          <div className="modal-content password-change-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Change Staff Password</h2>
            <div className="select-wrapper">
              <select 
                value={selectedStaffMember}
                onChange={(e) => setSelectedStaffMember(e.target.value)}
              >
                <option value="">Select a staff member</option>
                {availableUsers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user_name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={() => handleChangePassword(false)}>Change Password</button>
            <button onClick={closePasswordModals}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBoard;