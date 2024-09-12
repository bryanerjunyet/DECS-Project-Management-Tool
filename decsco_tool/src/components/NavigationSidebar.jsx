import React from 'react';
import './NavigationSidebar.css';

function NavigationSidebar() {
  return (
    <div className="navigation_sidebar">
        <div className="logo">
            <img src="src/utils/decs_logo.png" alt="DECS Co. Logo" />
            <span className="logo-text">DECS Co.</span>
        </div>
        <nav>
            <ul>
            <li>Sprint Board</li>
            <li className="active">Product Backlog</li>
            <li>Kanban Board</li>
            <li>Team Board</li>
            </ul>
        </nav>
        <button className="logout">Log out</button>
    </div>
  );
};

export default NavigationSidebar;