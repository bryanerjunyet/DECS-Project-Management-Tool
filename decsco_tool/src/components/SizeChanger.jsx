import React from 'react';
import './SizeChanger.css';

const SizeChanger = ({ onSizeChange }) => {
  const handleIncrease = () => onSizeChange(0.1);
  const handleDecrease = () => onSizeChange(-0.1);

  return (
    <div className="size-changer">
      <button className="size-btn" onClick={handleDecrease}>-</button>
      <button className="size-btn" onClick={handleIncrease}>+</button>
    </div>
  );
};


export default SizeChanger;