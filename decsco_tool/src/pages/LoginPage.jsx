import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../utils/decs_logo.png';
import LoginSecurity from '../components/LoginSecurity'; 

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      onLogin(JSON.parse(user));
      navigate('/sprint-board');
    }
  }, [navigate, onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Verifies username and password
    try {
      // Checks if username and password are valid
      const loginRes = await fetch(`http://localhost:3001/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: username,
          password: password
        }),
      });

      if (loginRes.status === 200) {
        const loginData = await loginRes.json();
        const user = {
          username: username,
          user_token: loginData.user_token
        };
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        navigate('/sprint-board');
      } else if (loginRes.status === 401) {
        setError('Invalid username or password');

        const sqRes = await fetch(`http://localhost:3001/users/security_questions?user_name=${username}`)
        
        if (sqRes.status == 200) {
          const data = await loginRes.json();
          setShowSecurityQuestion(true);
        } else if (sqRes.status != 409) {
          throw new Error(`Status ${sqRes.status} - Error fetching security questions`)
        }
      } else {
        setError('An error occurred during login. Please try again or contact support.');
        throw new Error(loginRes.message);
      }
    } catch (error) {
      console.error('Failed to verify login:', error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const res = await fetch(`http://localhost:3001/security-question?username=${username}`);
      if (res.status === 200) {
        const data = await res.json();
        setSecurityQuestion(data.question);
        setShowSecurityQuestion(true);
      } else {
        setError('Failed to retrieve security question. Please try again.');
      }
    } catch (error) {
      console.error('Failed to retrieve security question:', error);
    }
  };

  const handleSecurityAnswer = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3001/verify-security-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          answer: securityAnswer
        }),
      });

      if (res.status === 200) {
        setError(''); // Clear any previous error messages
        handleSecurityQuestionsSuccess(); // Log the user in
        // Optionally, redirect to password reset page or show password reset form
        // navigate('/reset-password');
      } else {
        setError('Invalid security answer. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify security answer:', error);
      setError('An error occurred during security answer verification. Please try again or contact support.');
    }
  };

  const handleSecurityQuestionsSuccess = () => {
    loginSuccess({ username: 'Admin' });
  };

  const loginSuccess = (user) => {
    const userInfo = { username: user.username };
    localStorage.setItem('user', JSON.stringify(userInfo));
    onLogin(userInfo);
    navigate('/sprint-board');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="DECS Co. Logo" className="login-logo" />
        <p className="login-title">
          DECS Company<br />Project Tool
        </p>
        {!showSecurityQuestion ? (
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
            {/*<button type="button" className="forgot-password-button" onClick={handleForgotPassword}>Forgot Password?</button>*/}
          </form>
        ) : (
          <LoginSecurity onSuccess={handleSecurityQuestionsSuccess} onCancel={() => setShowSecurityQuestion(false)} />
        )}
      </div>
    </div>
  );
}

export default LoginPage;