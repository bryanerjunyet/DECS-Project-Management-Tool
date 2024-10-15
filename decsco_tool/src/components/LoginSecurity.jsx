import React, { useState } from 'react';
import './LoginSecurity.css';

function LoginSecurity({ onSuccess, onCancel }) {
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      answers.question1.toLowerCase() === 'unicorn' &&
      answers.question2.toLowerCase() === 'love language' &&
      answers.question3 === '2020'
    ) {
      onSuccess();
    } else {
      setError('Incorrect answers. Please try again.');
    }
  };

  return (
    <div className="security-questions">
      <h3>Admin forgot password?</h3>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="question1">What is your favourite animal?</label>
          <input
            type="text"
            id="question1"
            name="question1"
            value={answers.question1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="question2">What is your favourite language?</label>
          <input
            type="text"
            id="question2"
            name="question2"
            value={answers.question2}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="question3">When is your best year?</label>
          <input
            type="text"
            id="question3"
            name="question3"
            value={answers.question3}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button type="submit" className="submit-button">Submit</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default LoginSecurity;