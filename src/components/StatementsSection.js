import React from 'react';
import { autoCorrectLogicalExpression } from '../utils/autoCorrect';

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

  const styles = {
    section: {
      backgroundColor: '#dcfce7',
      padding: '24px',
      borderRadius: '8px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#374151'
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px'
    },
    input: {
      flex: 1,
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      fontFamily: 'monospace'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    deleteButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      color: '#dc2626',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>Logical Statements</h2>
      <div>
        {statements.map((statement, index) => (
          <div key={index} style={styles.inputRow}>
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
              style={styles.input}
            />
            <button
              onClick={() => removeStatement(index)}
              disabled={statements.length <= 1}
              style={{
                ...styles.deleteButton,
                ...(statements.length <= 1 ? styles.buttonDisabled : {})
              }}
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addStatement}
          style={styles.button}
        >
          + Add Statement
        </button>
      </div>
    </div>
  );
};

export default StatementsSection;