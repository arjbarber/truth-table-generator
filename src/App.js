import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TruthTablePage from './truth-table/TruthTablePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TruthTablePage />} />
      </Routes>
    </Router>
  );
}

export default App;