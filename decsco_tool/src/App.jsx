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
import './App.css';

function App() {
  const [user, setUser] = useState(null);

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
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {user ? (
          <>
            <NavigationSidebar username={user.username} onLogout={handleLogout} />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/sprint-board" />} />
                <Route path="/product-backlog" element={<ProductBacklog />} />
                <Route path="/task-card-form" element={<TaskCardForm />} />
                <Route path="/sprint-board" element={<SprintBoard />} />
                <Route path="/sprint/:sprintId" element={<SprintDetails />} />
                <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
                <Route path="/kanban-board" element={<KanbanBoard />} />
                <Route path="/kanban-view/:sprintId" element={<KanbanView />} />
                <Route path="/sprint/:sprintId/task/:taskId" element={<SprintTaskDetails />} />
                {/* <Route path="*" element={<Navigate to="/sprint-board" />} /> */}
              </Routes>
            </main>
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