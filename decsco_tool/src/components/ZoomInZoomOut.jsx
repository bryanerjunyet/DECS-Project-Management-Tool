import React from 'react';
import './ZoomInZoomOut.css';


const ZoomInZoomOut = ({ onZoomIn, onZoomOut, currentZoom, minZoom, maxZoom }) => {
  return (
    <div className="zoom-controls" role="group" aria-label="Zoom Controls">
      <button 
        onClick={onZoomIn} 
        className="zoom-button zoom-in"
        disabled={currentZoom >= maxZoom}
        aria-label="Zoom In"
      >
        A+
      </button>
      <span className="zoom-level" aria-live="polite">         
        {Math.round(currentZoom * 100)}%</span>
      <button 
        onClick={onZoomOut} 
        className="zoom-button"
        disabled={currentZoom <= minZoom}
        aria-label="Zoom Out"
      >
        A-
      </button>
    </div>
  );
};

export default ZoomInZoomOut; 