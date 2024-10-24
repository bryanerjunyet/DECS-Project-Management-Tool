// // import React, { useState, useEffect } from 'react';
// // import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
// // import ProductBacklog from './pages/ProductBacklog';
// // import TaskCardForm from './components/TaskCardForm';
// // import NavigationSidebar from './components/NavigationSidebar';
// // import SprintBoard from './pages/SprintBoard';
// // import SprintBacklog from './pages/SprintBacklog';
// // import SprintDetails from './components/SprintDetails';
// // import KanbanBoard from './pages/KanbanBoard';
// // import KanbanView from './pages/KanbanView';
// // import SprintTaskDetails from './components/SprintTaskDetails';
// // import LoginPage from './pages/LoginPage';
// // import TeamBoard from './pages/TeamBoard'; 
// // import './App.css';

// // function App() {
// //   const [user, setUser] = useState(null);

// //   useEffect(() => {

// //     const storedUser = localStorage.getItem('user');
// //     if (storedUser) {
// //       setUser(JSON.parse(storedUser));
// //     }

// //     const verifyValidSession = async () => {
// //       const navigate = useNavigate();
// //       try {
// //         // Checks if user token is valid
// //         const user_token = JSON.parse(localStorage.getItem("user").user_token);
// //         const response = await fetch(`http://localhost:3001/users?user_token=${user_token}`, {
// //           method: 'GET'
// //         });
  
// //         if (!response.ok) {
// //           console.error("Invalid session");
// //           localStorage.removeItem("user");
// //           navigate("/login");
// //         }
  
// //       } catch (err) {
// //         console.error("Invalid session");
// //         localStorage.removeItem("user");
// //         navigate("/login");
// //       }
// //     }
// //     verifyValidSession()
// //   }, []);

// //   const handleLogin = (loggedInUser) => {
// //     setUser(loggedInUser);
// //   };

// //   const handleLogout = () => {
// //     setUser(null);
// //   };


// //   return (
// //     <Router>
// //       <div className="app">
// //         {user ? (
// //           <>
// //             <NavigationSidebar username={user.username} onLogout={handleLogout} />
// //             <main className="main-content">
// //               <Routes>
// //                 <Route path="/" element={<Navigate to="/sprint-board" />} />
// //                 <Route path="/product-backlog" element={<ProductBacklog />} />
// //                 <Route path="/task-card-form" element={<TaskCardForm />} />
// //                 <Route path="/sprint-board" element={<SprintBoard />} />
// //                 <Route path="/sprint/:sprintId" element={<SprintDetails />} />
// //                 <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
// //                 <Route path="/kanban-board" element={<KanbanBoard />} />
// //                 <Route path="/kanban-view/:sprintId" element={<KanbanView />} />
// //                 <Route path="/sprint/:sprintId/task/:taskId" element={<SprintTaskDetails currentUser={user} />} />
// //                 <Route path="/team-board" element={<TeamBoard />} />
// //                 <Route path="*" element={<Navigate to="/team-board" />} />
// //                 {/* <Route path="*" element={<Navigate to="/sprint-board" />} /> */}
// //               </Routes>
// //             </main>
// //           </>
// //         ) : (
// //           <Routes>
// //             <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
// //           </Routes>
// //         )}
// //       </div>
// //     </Router>
// //   );
// // }


// // export default App;
// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import ProductBacklog from './pages/ProductBacklog';
// import TaskCardForm from './components/TaskCardForm';
// import NavigationSidebar from './components/NavigationSidebar';
// import SprintBoard from './pages/SprintBoard';
// import SprintBacklog from './pages/SprintBacklog';
// import SprintDetails from './components/SprintDetails';
// import KanbanBoard from './pages/KanbanBoard';
// import KanbanView from './pages/KanbanView';
// import SprintTaskDetails from './components/SprintTaskDetails';
// import LoginPage from './pages/LoginPage';
// import TeamBoard from './pages/TeamBoard'; 
// import './App.css';

// function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const handleLogin = (loggedInUser) => {
//     setUser(loggedInUser);
//   };

//   const handleLogout = () => {
//     setUser(null);
//   };

//   return (
//     <Router>
//       <div className="app">
//         {user ? (
//           <>
//             <NavigationSidebar username={user.username} userToken={user.user_token} onLogout={handleLogout} />
//             <main className="main-content">
//               <Routes>
//                 <Route path="/" element={<Navigate to="/sprint-board" />} />
//                 <Route path="/product-backlog" element={<ProductBacklog />} />
//                 <Route path="/task-card-form" element={<TaskCardForm />} />
//                 <Route path="/sprint-board" element={<SprintBoard />} />
//                 <Route path="/sprint/:sprintId" element={<SprintDetails />} />
//                 <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
//                 <Route path="/kanban-board" element={<KanbanBoard />} />
//                 <Route path="/kanban-view/:sprintId" element={<KanbanView />} />
//                 <Route path="/sprint/:sprintId/task/:taskId" element={<SprintTaskDetails currentUser={user} />} />
//                 <Route path="/team-board/:userType" element={<TeamBoard userToken={user.user_token} />} />
//                 <Route path="*" element={<Navigate to="/sprint-board" />} />
//               </Routes>
//             </main>
//           </>
//         ) : (
//           <Routes>
//             <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
//           </Routes>
//         )}
//       </div>
//     </Router>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProductBacklog from './pages/ProductBacklog';
import TaskCardForm from './components/TaskCardForm';
import NavigationSidebar from './components/NavigationSidebar';
import SprintBoard from './pages/SprintBoard';
import SprintBacklog from './pages/SprintBacklog';
import SprintDetails from './components/SprintDetails';
import KanbanBoard from './pages/KanbanBoard';
import KanbanView from './pages/KanbanView';
import SprintTaskDetails from './components/SprintTaskDetails';
import LoginPage from './pages/LoginPage';
import TeamBoard from './pages/TeamBoard'; 
import ChangeBG from './components/ChangeBG';  // Import ChangeBG component
import ZoomInZoomOut from './components/ZoomInZoomOut';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('./utils/client_background.jpg'); // Manage background state
  const [zoom, setZoom] = useState(1); // Manage zoom state

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Handler to change the background image
  const handleBackgroundChange = (newBackground) => {
    setBackgroundImage(newBackground);
  };

  // Handlers for zoom in and zoom out
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(1.5, prevZoom + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(1, prevZoom - 0.1));
  };
  
  return (
    <Router>
      <div className="app" style={{ zoom: zoom }}>
        {user ? (
          <>
            <NavigationSidebar 
              username={user.username} 
              userToken={user.user_token} 
              onLogout={handleLogout} 
            />
            <main 
              className="main-content" 
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              
              <Routes>
                <Route path="/" element={<Navigate to="/sprint-board" />} />
                <Route path="/product-backlog" element={<ProductBacklog />} />
                <Route path="/task-card-form" element={<TaskCardForm />} />
                <Route path="/sprint-board" element={<SprintBoard />} />
                <Route path="/sprint/:sprintId" element={<SprintDetails />} />
                <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
                <Route path="/kanban-board" element={<KanbanBoard />} />
                <Route path="/kanban-view/:sprintId" element={<KanbanView />} />
                <Route 
                  path="/sprint/:sprintId/task/:taskId" 
                  element={<SprintTaskDetails currentUser={user} />} 
                />
                <Route 
                  path="/team-board/:userType" 
                  element={<TeamBoard userToken={user.user_token} />} 
                />
                <Route path="*" element={<Navigate to="/sprint-board" />} />
              </Routes>
            </main>
            <ZoomInZoomOut 
              onZoomIn={handleZoomIn} 
              onZoomOut={handleZoomOut} 
              currentZoom={zoom} 
              minZoom={1} 
              maxZoom={1.5} 
            />
          </>
        ) : (
          <Routes>
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
