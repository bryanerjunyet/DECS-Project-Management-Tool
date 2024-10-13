import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './GraphModal.css';

function GraphModal({ staff, onClose, formatTime }) {
  const [graphData, setGraphData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    if (staff && staff.workingHours) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const data = [];
      let total = 0;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(oneWeekAgo);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        const hoursInMs = staff.workingHours[dateString] || 0;
        const hours = hoursInMs / (1000 * 60 * 60);
        total += hours;
        
        data.push({
          date: dateString,
          hours: hours.toFixed(2)
        });
      }
      
      setGraphData(data);
      setTotalHours(formatTime(total * 1000 * 60 * 60));
    }
  }, [staff, formatTime]);

  return (
    <div className="graph-modal-overlay">
      <div className="graph-modal">
        <h2>{staff.username}'s Effort Graph</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
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