import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductBacklog from './pages/ProductBacklog';
import TaskCardForm from './components/TaskCardForm'
import NavigationSidebar from './components/NavigationSidebar';
import SprintBoard from './pages/SprintBoard';
import SprintBacklog from './pages/SprintBacklog';
import SprintDetails from './components/SprintDetails';
import KanbanBoard from './pages/KanbanBoard';
import SprintTaskDetails from './components/SprintTaskDetails';
import './App.css'; // Main app styles

function App() {
    return (
        <Router>
        <div className="app">
          <NavigationSidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ProductBacklog />} />
              <Route path="/product-backlog" element={<ProductBacklog />} />
              <Route path="/task-card-form" element={<TaskCardForm/>}/>
              <Route path="/sprint-board" element={<SprintBoard />} />
              <Route path="/sprint/:sprintId" element={<SprintDetails />} />
              <Route path="/sprint/:sprintId/backlog" element={<SprintBacklog />} />
              <Route path="/kanban-board/:sprintId" element={<KanbanBoard />} />
              <Route path="/sprint/:sprintId/task/:taskId" element={<SprintTaskDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
}

export default App;

