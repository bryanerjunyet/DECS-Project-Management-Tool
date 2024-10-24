// import React, { useState } from 'react';
// import './AdminLogin.css';

// function AdminLogin({ isOpen, onClose, onSubmit }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(username, password);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="adminLogin-overlay">
//       <div className="adminLogin">
//         <h2>Admin Login</h2>
//         <form onSubmit={handleSubmit}>
//           <label>
//             Username
//             <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
//           </label>
//           <label>
//             Password
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//           </label>
//           <button type="submit">Login</button>
//           <button type="button" onClick={onClose}>Cancel</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default AdminLogin;
import React, { useState, useEffect } from 'react';
import './AdminLogin.css';

function AdminLogin({ isOpen, onClose, onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Reset form fields when the modal opens or closes
    setUsername('');
    setPassword('');
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username, password);
    // Clear form fields after submission attempt
    setUsername('');
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="adminLogin-overlay">
      <div className="adminLogin">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </label>
          <label>
            Password
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </label>
          <button type="submit">Login</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;