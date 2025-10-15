import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import TruthTablePage from './truth-table/TruthTablePage';
import HomePage from './home/HomePage';
import MathKeyboardPage from './math-keyboard/MathKeyboardPage';
import SetVisualizerPage from './set-visualizer/SetVisualizerPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/truth-table" element={<TruthTablePage />} />
        <Route path="/math-keyboard" element={<MathKeyboardPage />} />
        <Route path="/set-visualizer" element={<SetVisualizerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
