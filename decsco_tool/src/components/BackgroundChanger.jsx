import React, { useState } from 'react';
import './BackgroundChanger.css';

// Import background images
import defaultBg from '../utils/client_background.jpg';
import bg2 from '../utils/client_background_2.jpg';
import bg3 from '../utils/client_background_3.jpg';
import bg4 from '../utils/client_background_4.jpg';
import bg5 from '../utils/client_background_5.jpg';
import bg6 from '../utils/client_background_6.jpg';

const BackgroundChanger = ({ onBackgroundChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const backgrounds = [
    { name: 'Deadpool X Xmen', value: defaultBg },
    { name: 'Deadpool Action', value: bg2 },
    { name: 'Deadpool Realistic', value: bg3 },
    { name: 'Deadpool Artistic', value: bg4 },
    { name: 'Deadpool 3D', value: bg5 },
    { name: 'Deadpool Comic', value: bg6 },
  ];

  const handleBackgroundChange = (background) => {
    onBackgroundChange(background.value);
    setIsOpen(false);
  };

  return (
    <div className="background-changer">
      <button className="bg-change-btn" onClick={() => setIsOpen(!isOpen)}>
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