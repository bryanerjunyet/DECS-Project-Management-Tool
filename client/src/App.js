import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductBacklog from './components/ProductBacklog';
import TaskDetails from './components/TaskDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductBacklog />} />
        <Route path="/task-details/:id" element={<TaskDetails />} />
        <Route path="/new-task" element={<TaskDetails />} />
      </Routes>
    </Router>
  );
}

export default App;