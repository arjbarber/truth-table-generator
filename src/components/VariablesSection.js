import React from 'react';
import { RESERVED_WORDS, MAX_VARIABLES, MAX_VARIABLE_NAME_LENGTH } from '../constants';

const VariablesSection = ({ variables, setVariables, error, setError }) => {
  const addVariable = () => {
    const nextLetter = String.fromCharCode(97 + variables.length);
    if (variables.length < MAX_VARIABLES) {
      setVariables([...variables, nextLetter]);
    }
  };

  const removeVariable = (index) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };

  const updateVariable = (index, value) => {
    const newVars = [...variables];
    // Allow letters, numbers, and underscores, but must start with a letter
    let cleanValue = value.replace(/[^A-Za-z0-9_]/g, '');
    if (cleanValue && !/^[A-Za-z]/.test(cleanValue)) {
      cleanValue = cleanValue.replace(/^[^A-Za-z]*/, '');
    }
    // Limit to reasonable length
    cleanValue = cleanValue.slice(0, MAX_VARIABLE_NAME_LENGTH);
    
    // Check if it's a reserved word (case-insensitive)
    if (cleanValue && RESERVED_WORDS.has(cleanValue.toLowerCase())) {
      setError(`"${cleanValue}" is a reserved word and cannot be used as a variable name.`);
      return;
    }
    
    // Check for duplicates
    if (cleanValue && newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())) {
      setError(`Variable "${cleanValue}" already exists.`);
      return;
    }
    
    // Clear error if input is valid
    if (error && !RESERVED_WORDS.has(cleanValue.toLowerCase()) && 
        !newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())) {
      setError('');
    }
    
    newVars[index] = cleanValue;
    setVariables(newVars);
  };

  const styles = {
    section: {
      backgroundColor: '#dbeafe',
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
      width: '120px',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
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
      <h2 style={styles.title}>Boolean Variables</h2>
      <div>
        {variables.map((variable, index) => (
          <div key={index} style={styles.inputRow}>
            <input
              type="text"
              value={variable}
              onChange={(e) => updateVariable(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addVariable();
                }
              }}
              style={styles.input}
              maxLength={MAX_VARIABLE_NAME_LENGTH}
              placeholder="variable1"
            />
            <button
              onClick={() => removeVariable(index)}
              disabled={variables.length <= 1}
              style={{
                ...styles.deleteButton,
                ...(variables.length <= 1 ? styles.buttonDisabled : {})
              }}
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addVariable}
          disabled={variables.length >= MAX_VARIABLES}
          style={{
            ...styles.button,
            ...(variables.length >= MAX_VARIABLES ? styles.buttonDisabled : {})
          }}
        >
          + Add Variable
        </button>
      </div>
    </div>
  );
};

export default VariablesSection;