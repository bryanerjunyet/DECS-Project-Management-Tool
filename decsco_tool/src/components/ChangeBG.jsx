import React, { useState, useRef, useEffect } from 'react';
import './ChangeBG.css';  // Ensure this path points to the correct location

// Import your background images
import bg1 from '../utils/client_background.jpg';
import bg2 from '../utils/client_background_2.jpg';
import bg3 from '../utils/client_background_3.jpg';
import bg4 from '../utils/client_background_4.jpg';
import bg5 from '../utils/client_background_5.jpg';
import bg6 from '../utils/client_background_6.jpg';
import bg7 from '../utils/client_background_7.jpg';

// Define background options
const backgroundOptions = [
  { name: 'Background 1', src: bg1 },
  { name: 'Background 2', src: bg2 },
  { name: 'Background 3', src: bg3 },
  { name: 'Background 4', src: bg4 },
  { name: 'Background 5', src: bg5 },
  { name: 'Background 6', src: bg6 },
  { name: 'Background 7', src: bg7 },
];

const ChangeBG = ({ onChangeBackground }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleBackgroundChange = (backgroundSrc) => {
    onChangeBackground(backgroundSrc); // Notify parent component of the change
    setShowDropdown(false); // Close the dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="change-bg" ref={dropdownRef}>
      <button onClick={() => setShowDropdown(!showDropdown)}>
        Change Theme
      </button>

      {showDropdown && (
        <div className="background-dropdown">
          <div className="background-options">
            {backgroundOptions.map((bg, index) => (
              <div 
                key={index} 
                className="background-option" 
                onClick={() => handleBackgroundChange(bg.src)}
              >
                <img src={bg.src} alt={bg.name} />
                <p>{bg.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeBG;
