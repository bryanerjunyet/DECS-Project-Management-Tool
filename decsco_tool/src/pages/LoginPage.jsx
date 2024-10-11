import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../utils/decs_logo.png';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      onLogin(JSON.parse(user));
      navigate('/sprint-board');
    }

    // Initialize empty validUsers in localStorage if it doesn't exist
    if (!localStorage.getItem('validUsers')) {
      localStorage.setItem('validUsers', JSON.stringify([]));
    }
  }, [navigate, onLogin]);

  const handleLogin = (e) => {
    e.preventDefault();
    const validUsers = JSON.parse(localStorage.getItem('validUsers') || '[]');
    const user = validUsers.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const userInfo = { username: user.username };
      localStorage.setItem('user', JSON.stringify(userInfo));
      onLogin(userInfo);
      navigate('/sprint-board');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="DECS Co. Logo" className="login-logo" />
        <p className="login-title">
            DECS Company<br />Project Tool
        </p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              className="username-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              className="password-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;