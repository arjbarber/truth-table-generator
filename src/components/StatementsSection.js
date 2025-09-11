import React, { useRef, useEffect } from 'react';
import { autoCorrectLogicalExpression } from '../utils/autoCorrect';

const StatementsSection = ({ statements, setStatements }) => {
  const inputRefs = useRef([]);

  const addStatement = () => {
    setStatements((prev) => [...prev, '']);
  };

  const removeStatement = (index) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  const updateStatement = (index, value) => {
    const newStatements = [...statements];
    const currentStatement = statements[index];
    
    if (value.length > currentStatement.length) {
      newStatements[index] = autoCorrectLogicalExpression(value);
    } else {
      newStatements[index] = value;
    }
    
    setStatements(newStatements);
  };

  useEffect(() => {
    if (statements.length > 0) {
      const lastIndex = statements.length - 1;
      const lastInput = inputRefs.current[lastIndex];
      if (lastInput) lastInput.focus();
    }
  }, [statements.length]);

  return (
    <div className="bg-green-100 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Logical Statements</h2>
      <div>
        {statements.map((statement, index) => (
          <div key={index} className="flex items-center gap-2 mb-3">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={statement}
              onChange={(e) => updateStatement(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStatement();
                }
              }}
              placeholder="Type: var1 and var2, p --> q, not myVar, etc..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500/10"
            />
            <button
              onClick={() => removeStatement(index)}
              disabled={statements.length <= 1}
              className="p-2 bg-transparent text-red-600 border-0 rounded-md cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addStatement}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white border-0 rounded-md text-sm cursor-pointer font-medium hover:bg-green-700"
        >
          + Add Statement
        </button>
      </div>
    </div>
  );
};

export default StatementsSection;