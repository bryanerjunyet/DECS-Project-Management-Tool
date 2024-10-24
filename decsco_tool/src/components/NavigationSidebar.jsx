import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavigationSidebar.css';
import AdminLogin from './AdminLogin';
import ChangeBG from './ChangeBG';
import ZoomInZoomOut from './ZoomInZoomOut';
import defaultBg from '../utils/client_background_7.jpg'; // Import default background

function NavigationSidebar({ username, userToken, onLogout }) {
  const [showTeamBoardOptions, setShowTeamBoardOptions] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [fontZoom, setFontZoom] = useState(1);
  const [background, setBackground] = useState(defaultBg);
  const minZoom = 1;
  const maxZoom = 1.5;
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    onLogout();
  };

  const handleTeamBoardClick = (e) => {
    e.preventDefault();
    setShowTeamBoardOptions(true);
  };

  const handleUserTypeSelection = (userType) => {
    setShowTeamBoardOptions(false);
    if (userType === 'admin') {
      setShowAdminLogin(true);
    } else {
      navigate('/team-board/staff');
    }
  };

  const handleAdminLoginSubmit = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({user_name: username, password: password})
      });

      const resData = await response.json();
      console.log(resData.role_id);
      if (response.status == 200 && resData.role_id == 2) {
        setShowAdminLogin(false);
        navigate('/team-board/admin');
      } else {
        alert('Invalid admin credentials');
      }
    } catch (e) {
      console.error('Failed to process admin login for team board:', err);
    }
  };

  const isActive = (path) => {
    if (path === '/team-board') {
      return location.pathname.startsWith('/team-board');
    }
    return location.pathname === path;
  };

  const handleChangeBackground = (newBackground) => {
    setBackground(newBackground);
    localStorage.setItem('userBackground', newBackground);
  };

  const handleZoomIn = () => {
    setFontZoom(prevZoom => Math.min(prevZoom + 0.1, maxZoom));
  };

  const handleZoomOut = () => {
    setFontZoom(prevZoom => Math.max(prevZoom - 0.1, minZoom));
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--font-zoom', fontZoom);
  }, [fontZoom]);

  useEffect(() => {
    const savedBackground = localStorage.getItem('userBackground');
    if (savedBackground) {
      setBackground(savedBackground);
    }
  }, []);

  useEffect(() => {
    document.body.style.backgroundImage = `url(${background})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }, [background]);

  return (
    <div className="navigation_sidebar">
      <div className="logo">
        <img src="src/utils/decs_logo.png" alt="DECS Co. Logo" />
        <span className="logo-text">DECS Co.</span>
      </div>
      <nav>
        <ul>
          <li><Link to="/sprint-board" className={`nav-link ${isActive('/sprint-board') ? 'active' : ''}`}>Sprint Board</Link></li>
          <li><Link to="/product-backlog" className={`nav-link ${isActive('/product-backlog') ? 'active' : ''}`}>Product Backlog</Link></li>
          <li><Link to="/kanban-board" className={`nav-link ${isActive('/kanban-board') ? 'active' : ''}`}>Kanban Board</Link></li>
          <li>
            <Link 
              to="/team-board"
              onClick={handleTeamBoardClick}
              className={`nav-link ${isActive('/team-board') ? 'active' : ''}`}
            >
              Team Board
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <ChangeBG onChangeBackground={handleChangeBackground} />
        {/* <ZoomInZoomOut 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut}
          currentZoom={fontZoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
        /> */}
      </div>

      <div className="user-info">
        <p>Good day, {username}</p>
        <button className="logout" onClick={handleLogout}>Log out</button>
      </div>

      {showTeamBoardOptions && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select User Type</h2>
            <button className="modal-button" onClick={() => handleUserTypeSelection('admin')}>Admin</button>
            <button className="modal-button" onClick={() => handleUserTypeSelection('staff')}>Staff</button>
            <button className="modal-button close" onClick={() => setShowTeamBoardOptions(false)}>Close</button>
          </div>
        </div>
      )}

      <AdminLogin 
        isOpen={showAdminLogin} 
        onClose={() => setShowAdminLogin(false)}
        onSubmit={handleAdminLoginSubmit}
      />
    </div>
  );
}

export default NavigationSidebar;