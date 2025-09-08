import React from 'react';
import { autoCorrectLogicalExpression } from '../utils/autoCorrect';
import '../styles/StatementsSection.css';

const StatementsSection = ({ statements, setStatements }) => {
  const addStatement = () => {
    setStatements([...statements, '']);
  };

  const removeStatement = (index) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  const updateStatement = (index, value) => {
    const newStatements = [...statements];
    const currentStatement = statements[index];
    
    // Only apply auto-correction if the text is getting longer (user is typing, not deleting)
    if (value.length > currentStatement.length) {
      newStatements[index] = autoCorrectLogicalExpression(value);
    } else {
      // User is deleting, don't auto-correct
      newStatements[index] = value;
    }
    
    setStatements(newStatements);
  };


  return (
    <div className="statements-section">
      <h2 className="statements-title">Logical Statements</h2>
      <div>
        {statements.map((statement, index) => (
          <div key={index} className="statements-input-row">
            <input
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
              className="statements-input"
            />
            <button
              onClick={() => removeStatement(index)}
              disabled={statements.length <= 1}
              className="statements-delete-button"
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addStatement}
          className="statements-button"
        >
          + Add Statement
        </button>
      </div>
    </div>
  );
};

export default StatementsSection;