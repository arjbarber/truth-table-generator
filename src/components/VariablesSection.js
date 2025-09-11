import React, { useRef, useEffect } from 'react';
import { RESERVED_WORDS, MAX_VARIABLES, MAX_VARIABLE_NAME_LENGTH } from '../constants';

const VariablesSection = ({ variables, setVariables, error, setError }) => {
  const inputRefs = useRef([]);

  const addVariable = () => {
    let nextLetter = "";
    if (97 + variables.length >= 102) {
      nextLetter = String.fromCharCode(97 + variables.length + 1);
    } else {
      nextLetter = String.fromCharCode(97 + variables.length);
    }
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
    let cleanValue = value.replace(/[^A-Za-z0-9_]/g, '');
    if (cleanValue && !/^[A-Za-z]/.test(cleanValue)) {
      cleanValue = cleanValue.replace(/^[^A-Za-z]*/, '');
    }
    cleanValue = cleanValue.slice(0, MAX_VARIABLE_NAME_LENGTH);
    
    if (cleanValue && RESERVED_WORDS.has(cleanValue.toLowerCase())) {
      setError(`"${cleanValue}" is a reserved word and cannot be used as a variable name.`);
      return;
    }
    if (cleanValue && newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())) {
      setError(`Variable "${cleanValue}" already exists.`);
      return;
    }
    if (
      error &&
      !RESERVED_WORDS.has(cleanValue.toLowerCase()) &&
      !newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())
    ) {
      setError('');
    }
    
    newVars[index] = cleanValue;
    setVariables(newVars);
  };

  useEffect(() => {
    if (variables.length > 0) {
      const lastIndex = variables.length - 1;
      const lastInput = inputRefs.current[lastIndex];
      if (lastInput) lastInput.focus();
    }
  }, [variables.length]);

  return (
    <div className="bg-blue-100 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Boolean Variables</h2>
      <div>
        {variables.map((variable, index) => (
          <div key={index} className="flex items-center gap-2 mb-3">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={variable}
              onChange={(e) => updateVariable(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addVariable();
                }
              }}
              className="w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
              maxLength={MAX_VARIABLE_NAME_LENGTH}
              placeholder="variable1"
            />
            <button
              onClick={() => removeVariable(index)}
              disabled={variables.length <= 1}
              className="p-2 bg-transparent text-red-600 border-0 rounded-md cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️
            </button>
          </div>
        ))}
        <button
          onClick={addVariable}
          disabled={variables.length >= MAX_VARIABLES}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-0 rounded-md text-sm cursor-pointer font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Variable
        </button>
      </div>
    </div>
  );
};

export default VariablesSection;