import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './GraphModal.css';

function GraphModal({ staff, onClose, formatTime }) {
  const [graphData, setGraphData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (staff && staff.workingHours) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to end of day
      
      const data = [];
      let total = 0;
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const hoursInMs = staff.workingHours[dateString] || 0;
        const hours = hoursInMs / (1000 * 60 * 60);
        total += hours;
        
        data.push({
          date: dateString,
          hours: parseFloat(hours.toFixed(2)),
          label: i === 0 ? 'Today' : formatDate(date)
        });
      }
      
      setGraphData(data);
      setTotalHours(formatTime(total * 1000 * 60 * 60));
    }
  }, [staff, formatTime]);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <h2>{staff.username}'s Effort Graph</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
        <p className="summary-text">Total working hours: {totalHours} / 7 days</p>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default GraphModal;