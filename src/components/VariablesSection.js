import React from 'react';
import { RESERVED_WORDS, MAX_VARIABLES, MAX_VARIABLE_NAME_LENGTH } from '../constants';
import '../styles/VariablesSection.css';

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


  return (
    <div className="variables-section">
      <h2 className="variables-title">Boolean Variables</h2>
      <div>
        {variables.map((variable, index) => (
          <div key={index} className="variables-input-row">
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
              className="variables-input"
              maxLength={MAX_VARIABLE_NAME_LENGTH}
              placeholder="variable1"
            />
            <button
              onClick={() => removeVariable(index)}
              disabled={variables.length <= 1}
              className="variables-delete-button"
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addVariable}
          disabled={variables.length >= MAX_VARIABLES}
          className="variables-button"
        >
          + Add Variable
        </button>
      </div>
    </div>
  );
};

export default VariablesSection;