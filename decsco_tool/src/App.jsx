import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductBacklog from './components/ProductBacklog';
import TaskCardForm from './components/TaskCardForm'
import NavigationSidebar from './components/NavigationSidebar';
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
            </Routes>
          </main>
        </div>
      </Router>
    );
}

export default App;

