import React from 'react';
import { Link } from 'react-router-dom';
import './NavigationSidebar.css';

function NavigationSidebar({ username, onLogout }) {
  return (
    <div className="navigation_sidebar">
      <div className="logo">
        <img src="src/utils/decs_logo.png" alt="DECS Co. Logo" />
        <span className="logo-text">DECS Co.</span>
      </div>
      <nav>
        <ul>
          <li><Link to="/sprint-board" className="nav-link" activeClassName="nav-link--active">Sprint Board</Link></li>
          <li><Link to="/product-backlog" className="nav-link" activeClassName="nav-link--active">Product Backlog</Link></li>
          <li><Link to="/kanban-board" className="nav-link" activeClassName="nav-link--active">Kanban Board</Link></li>
          <li><Link to="/team-board" className="nav-link" activeClassName="nav-link--active">Team Board</Link></li>
        </ul>
      </nav>
      <div className="user-info">
        <p>Good day, {username}</p>
        <button className="logout" onClick={onLogout}>Log out</button>
      </div>
    </div>
  );
}

export default NavigationSidebar;