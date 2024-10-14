import React, { useState } from 'react';
import './BackgroundChanger.css';

const BackgroundChanger = ({ onBackgroundChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const backgrounds = [
    { name: 'Default', value: 'url("./utils/client_background.jpg")' },
    { name: 'Blue Sky', value: 'url("./utils/client_background.jpg")' },
    { name: 'Forest', value: 'url("./utils/client_background.jpg")' },
    { name: 'Mountain', value: 'url("./utils/client_background.jpg")' },
  ];

  const handleBackgroundChange = (background) => {
    onBackgroundChange(background.value);
    setIsOpen(false);
  };

  return (
    <div className="background-changer">
      <button className="bg-change-btn" onClick={() => setIsOpen(!isOpen)}>
        Change Background
      </button>
      {isOpen && (
        <div className="background-options">
          {backgrounds.map((bg) => (
            <button
              key={bg.name}
              className="bg-option"
              onClick={() => handleBackgroundChange(bg)}
            >
              {bg.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundChanger;