import React, { useState, useCallback, useEffect } from 'react';
import VariablesSection from './components/VariablesSection';
import StatementsSection from './components/StatementsSection';
import HelpSection from './components/HelpSection';
import TruthTable from './components/TruthTable';
import { evaluateExpression } from './utils/expressionEvaluator';
import './App.css';

const TruthTableGenerator = () => {
  const [variables, setVariables] = useState(['a', 'b']);
  const [statements, setStatements] = useState(['a ∧ b', 'a → b', 'a ↔ b']);
  const [truthTable, setTruthTable] = useState([]);
  const [error, setError] = useState('');

  const generateTruthTable = useCallback(() => {
    setError('');
    
    if (variables.some(v => !v.trim())) {
      setError('All variables must have names');
      return;
    }
    
    if (statements.some(s => !s.trim())) {
      // Don't show error for empty statements, just return empty table
      setTruthTable([]);
      return;
    }
    
    const numRows = Math.pow(2, variables.length);
    const table = [];
    
    for (let i = 0; i < numRows; i++) {
      const row = {
        id: i,
        values: [],
        results: []
      };
      
      // Generate binary values for variables (start with all T instead of all F)
      for (let j = variables.length - 1; j >= 0; j--) {
        row.values.push(!(i & (1 << j)));
      }
      
      // Evaluate each statement
      statements.forEach(statement => {
        if (statement.trim()) {
          const result = evaluateExpression(statement, variables, row.values);
          row.results.push(result);
        }
      });
      
      table.push(row);
    }
    
    setTruthTable(table);
  }, [variables, statements]);

  // Auto-generate truth table when variables or statements change
  useEffect(() => {
    generateTruthTable();
  }, [generateTruthTable]);

  return (
    <div className="container">
      <h1 className="title">Truth Table Generator</h1>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      
      <div className="grid">
        {/* Input Section */}
        <div>
          <VariablesSection 
            variables={variables}
            setVariables={setVariables}
            error={error}
            setError={setError}
          />
          
          <StatementsSection 
            statements={statements}
            setStatements={setStatements}
          />
          
          <HelpSection />
        </div>
        
        {/* Truth Table Section */}
        <div>
          <TruthTable 
            truthTable={truthTable}
            variables={variables}
            statements={statements}
          />
        </div>
      </div>
    </div>
  );
};

export default TruthTableGenerator;