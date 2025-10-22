import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StacksPage } from './pages/StacksPage';
import { WorkflowEditor } from './pages/WorkflowEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StacksPage />} />
        <Route path="/stack/:id" element={<WorkflowEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
