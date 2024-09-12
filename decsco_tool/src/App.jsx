import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductBacklog from './components/ProductBacklog';
import TaskForm from './components/TaskForm'
import './App.css'; // Main app styles

function App() {
    return (
        <Router>
        <div className="app">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ProductBacklog />} />
              <Route path="/product-backlog" element={<ProductBacklog />} />
              <Route path="/task-form" element={<TaskForm/>}/>
            </Routes>
          </main>
        </div>
      </Router>
    );
}

export default App;