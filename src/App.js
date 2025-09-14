import React, { useState, useCallback, useEffect } from 'react';
import VariablesSection from './components/VariablesSection';
import StatementsSection from './components/StatementsSection';
import HelpSection from './components/HelpSection';
import TruthTable from './components/TruthTable';
import { evaluateExpression } from './utils/expressionEvaluator';

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

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Site: truthtable.andrewbarber.dev\n";

    const headers = [...variables, ...statements];
    csvContent += headers.join(",") + "\n";

    truthTable.forEach(row => {
      const rowValues = [
        ...row.values.map(v => (v ? "T" : "F")),
        ...row.results.map(r => (r ? "T" : "F"))
      ];
      csvContent += rowValues.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "truth_table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 bg-white font-sans">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Truth Table Generator</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid lg:grid-cols-2 gap-8 items-start">
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
          {/* Export button */}
          <button
            onClick={exportToCSV}
            className="mt-4 w-full px-4 py-2 bg-green-800 text-white rounded-lg shadow hover:bg-gray-900 transition"
          >Export to CSV</button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TruthTableGenerator;