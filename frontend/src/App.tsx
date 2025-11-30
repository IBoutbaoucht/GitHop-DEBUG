import { Routes, Route } from 'react-router-dom';
import RepositoryList from './RepositoryList';
import RepositoryDetail from './RepositoryDetail';
// Import the new components
import DeveloperList from './DeveloperList';
import DeveloperDetail from './DeveloperDetail';

import Slides from './Slides';

function App() {
  return (
    <div className="min-h-screen bg-[#0B0C15] text-white">
      <Routes>
        <Route path="/" element={<RepositoryList />} />
        <Route path="/repo/:owner/:name" element={<RepositoryDetail />} />
        
        <Route path="/developers" element={<DeveloperList />} />
        <Route path="/developer/:login" element={<DeveloperDetail />} />

        <Route path="/slides" element={<Slides />} />

        
      </Routes>
    </div>
  );
}

export default App;

