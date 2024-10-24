import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { PICProvider } from './components/PICManagement';
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
import AdminModal from './components/AdminModal';
import BackgroundChanger from './components/BackgroundChanger';
import SizeChanger from './components/SizeChanger';
import './App.css';

// Import background images
import defaultBg from './utils/client_background.jpg';
import bg3 from './utils/client_background_3.jpg';
import bg4 from './utils/client_background_4.jpg';
import bg5 from './utils/client_background_5.jpg';
import bg6 from './utils/client_background_6.jpg';
import bg7 from './utils/client_background_7.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [background, setBackground] = useState(defaultBg);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const savedBackground = localStorage.getItem('userBackground');
    if (savedBackground) {
      setBackground(savedBackground);
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
  };

  const handleTeamBoardClick = () => {
    setShowAdminModal(true);
  };

  const handleAdminVerified = () => {
    setIsAdmin(true);
    setShowAdminModal(false);
  };

  const handleStaffSelected = () => {
    setIsAdmin(false);
    setShowAdminModal(false);
  };

  const handleChangeBackground = (newBackground) => {
    setBackground(newBackground);
    localStorage.setItem('userBackground', newBackground);
  };

  const handleSizeChange = (change) => {
    setZoom(prevZoom => Math.max(0.5, Math.min(2, prevZoom + change)));
  };

  return (
    <Router>
      <PICProvider>
        <div className="app" style={{ backgroundImage: `url(${background})`, zoom: zoom }}>
          {user ? (
            <>
              <NavigationSidebar username={user.username} onLogout={handleLogout} onTeamBoardClick={handleTeamBoardClick} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/sprint-board" />} />
                  <Route path="/product-backlog" element={<ProductBacklog currentUser={user} />} />
                  <Route path="/task-card-form" element={<TaskCardForm />} />
                  <Route path="/sprint-board" element={<SprintBoard />} />
                  <Route path="/sprint/:sprintId" element={<SprintDetails />} />
                  <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
                  <Route path="/kanban-board" element={<KanbanBoard />} />
                  <Route path="/kanban-view/:sprintId" element={<KanbanView />} />
                  <Route path="/sprint/:sprintId/task/:taskId" element={<SprintTaskDetails currentUser={user} />} />
                  <Route path="/team-board" element={<TeamBoard isAdmin={isAdmin} currentUser={user} />} />
                </Routes>
              </main>
              {showAdminModal && (
                <AdminModal
                  onClose={() => setShowAdminModal(false)}
                  onAdminVerified={handleAdminVerified}
                  onStaffSelected={handleStaffSelected}
                />
              )}
              <BackgroundChanger onBackgroundChange={handleChangeBackground} />
              <SizeChanger onSizeChange={handleSizeChange} />
            </>
          ) : (
            <Routes>
              <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
            </Routes>
          )}
        </div>
      </PICProvider>
    </Router>
  );
}

export default App;