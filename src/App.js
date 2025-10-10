import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TruthTablePage from './truth-table/TruthTablePage';
import HomePage from './home/HomePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/truth-table" element={<TruthTablePage />} />
      </Routes>
    </Router>
  );
}

export default App;