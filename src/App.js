import React, { useState, useCallback } from 'react';

const TruthTableGenerator = () => {
  const [variables, setVariables] = useState(['a', 'b']);
  const [statements, setStatements] = useState(['a ∧ b', 'a → b', 'a ↔ b']);
  const [truthTable, setTruthTable] = useState([]);
  const [error, setError] = useState('');

  // Reserved words that cannot be used as variable names
  const RESERVED_WORDS = new Set([
    'true', 'false', 't', 'f',
    'and', 'or', 'not', 'xor', 'implies', 'iff',
    'if', 'then', 'only'
  ]);

  const addVariable = () => {
    const nextLetter = String.fromCharCode(97 + variables.length);
    if (variables.length < 8) {
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
    cleanValue = cleanValue.slice(0, 10);
    
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

  const addStatement = () => {
    setStatements([...statements, '']);
  };

  const removeStatement = (index) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  // Enhanced auto-correction function
  const autoCorrectLogicalExpression = (input) => {
    let corrected = input;
    
    // Define replacements in order of specificity (longest patterns first)
    const replacements = [
      // Biconditional (if and only if)
      { pattern: /\bif\s+and\s+only\s+if\b/gi, symbol: ' ↔ ' },
      { pattern: /\biff\b/gi, symbol: ' ↔ ' },
      { pattern: /<->/g, symbol: ' ↔ ' },
      
      // Implication
      { pattern: /\bimplies\b/gi, symbol: ' → ' },
      { pattern: /\bif\s+then\b/gi, symbol: ' → ' },
      { pattern: /-->/g, symbol: ' → ' },
      
      // Conjunction (AND)
      { pattern: /\band\b/gi, symbol: ' ∧ ' },
      { pattern: /&/g, symbol: ' ∧ ' },
      { pattern: /\/\\/g, symbol: ' ∧ ' },
      
      // Disjunction (OR)
      { pattern: /\bor\b/gi, symbol: ' ∨ ' },
      { pattern: /\|/g, symbol: ' ∨ ' },
      { pattern: /\\\//g, symbol: ' ∨ ' },
      
      // Exclusive OR
      { pattern: /\bxor\b/gi, symbol: ' ⊕ ' },
      { pattern: /\^/g, symbol: ' ⊕ ' },
      
      // Negation
      { pattern: /\bnot\b/gi, symbol: '¬' },
      { pattern: /~/g, symbol: '¬' },
      { pattern: /!/g, symbol: '¬' },
      
      // Constants
      { pattern: /\btrue\b/gi, symbol: 'T' },
      { pattern: /\t\b/gi, symbol: 'T' },
      { pattern: /\bfalse\b/gi, symbol: 'F' },
      { pattern: /\f\b/gi, symbol: 'F' },
    ];
    
    // Apply replacements
    replacements.forEach(({ pattern, symbol }) => {
      corrected = corrected.replace(pattern, symbol);
    });
    
    // Clean up extra spaces around operators but preserve user spaces
    corrected = corrected.replace(/\s*(¬)\s*/g, '$1 ');
    corrected = corrected.replace(/\s*(∧|∨|→|↔|⊕)\s*/g, ' $1 ');
    corrected = corrected.replace(/\s{2,}/g, ' '); // Only replace multiple spaces with single space
    
    return corrected;
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

  // Function to convert logical expressions to symbols (kept for backward compatibility)
  const convertToSymbols = (expression) => {
    let result = expression;
    
    // Replace operators with symbols in order of specificity (longest first)
    const replacements = [
      { text: /IF AND ONLY IF/gi, symbol: '↔' },
      { text: /<->/g, symbol: '↔' },
      { text: /IFF/gi, symbol: '↔' },
      { text: /-->/g, symbol: '→' },
      { text: /IMPLIES/gi, symbol: '→' },
      { text: /\/\\/g, symbol: '∧' },
      { text: /AND/gi, symbol: '∧' },
      { text: /&/gi, symbol: '∧' },
      { text: /\\\//g, symbol: '∨' },
      { text: /OR/gi, symbol: '∨' },
      { text: /\|/gi, symbol: '∨' },
      { text: /XOR/gi, symbol: '⊕' },
      { text: /\^/g, symbol: '⊕' },
      { text: /NOT/gi, symbol: '¬' },
      { text: /TRUE/gi, symbol: 'T' },
      { text: /FALSE/gi, symbol: 'F' }
    ];
    
    replacements.forEach(({ text, symbol }) => {
      result = result.replace(text, symbol);
    });
    
    return result;
  };

  const evaluateExpression = (expression, values) => {
    try {
      const tokenize = (expr) => {
        const tokens = [];
        let i = 0;
        expr = expr.replace(/\s+/g, ' ').trim();
        
        // Handle Unicode symbols and convert them to text for parsing
        expr = expr.replace(/¬/g, 'NOT ');
        expr = expr.replace(/∧/g, ' AND ');
        expr = expr.replace(/∨/g, ' OR ');
        expr = expr.replace(/→/g, ' IMPLIES ');
        expr = expr.replace(/↔/g, ' IFF ');
        expr = expr.replace(/⊕/g, ' XOR ');
        
        while (i < expr.length) {
          if (expr[i] === ' ') {
            i++;
            continue;
          }
          
          // Single character tokens
          if (expr[i] === '(' || expr[i] === ')') {
            tokens.push(expr[i]);
            i++;
            continue;
          }
          
          // Multi-character operators - check in order of length (longest first)
          if (expr.substr(i, 13).toUpperCase() === 'IF AND ONLY IF') {
            tokens.push('IFF');
            i += 13;
            continue;
          }
          
          if (expr.substr(i, 7).toUpperCase() === 'IMPLIES') {
            tokens.push('IMPLIES');
            i += 7;
            continue;
          }
          
          if (expr.substr(i, 5).toUpperCase() === 'FALSE') {
            tokens.push('FALSE');
            i += 5;
            continue;
          }
          
          if (expr.substr(i, 4).toUpperCase() === 'TRUE') {
            tokens.push('TRUE');
            i += 4;
            continue;
          }
          
          if (expr.substr(i, 3).toUpperCase() === 'XOR') {
            tokens.push('XOR');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 3).toUpperCase() === 'AND') {
            tokens.push('AND');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 3).toUpperCase() === 'NOT') {
            tokens.push('NOT');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 3).toUpperCase() === 'IFF') {
            tokens.push('IFF');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 3) === '<->') {
            tokens.push('IFF');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 3) === '-->') {
            tokens.push('IMPLIES');
            i += 3;
            continue;
          }
          
          if (expr.substr(i, 2).toUpperCase() === 'OR') {
            tokens.push('OR');
            i += 2;
            continue;
          }
          
          if (expr.substr(i, 2) === '/\\') {
            tokens.push('AND');
            i += 2;
            continue;
          }
          
          if (expr.substr(i, 2) === '\\/') {
            tokens.push('OR');
            i += 2;
            continue;
          }
          
          // Single character operators
          if (expr[i] === '^') {
            tokens.push('XOR');
            i++;
            continue;
          }
          
          if (expr[i] === '&') {
            tokens.push('AND');
            i++;
            continue;
          }

          if (expr[i] === '|') {
            tokens.push('OR');
            i++;
            continue;
          }
          
          // Multi-character variables (letters, numbers, underscores)
          if (/[A-Za-z]/.test(expr[i])) {
            let varName = '';
            while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i])) {
              varName += expr[i];
              i++;
            }
            tokens.push(varName);
            continue;
          }
          
          // Skip unknown characters
          i++;
        }
        
        return tokens;
      };

      // Parser with proper precedence
      const parse = (tokens) => {
        let pos = 0;
        
        const peek = () => pos < tokens.length ? tokens[pos] : null;
        const consume = () => pos < tokens.length ? tokens[pos++] : null;
        
        // IFF has lowest precedence
        const parseIFF = () => {
          let left = parseIMPLIES();
          
          while (peek() === 'IFF') {
            consume(); // consume IFF
            const right = parseIMPLIES();
            left = { op: 'IFF', left, right };
          }
          
          return left;
        };
        
        // IMPLIES has next lowest precedence  
        const parseIMPLIES = () => {
          let left = parseOR();
          
          while (peek() === 'IMPLIES') {
            consume(); // consume IMPLIES
            const right = parseOR();
            left = { op: 'IMPLIES', left, right };
          }
          
          return left;
        };
        
        const parseOR = () => {
          let left = parseXOR();
          
          while (peek() === 'OR') {
            consume(); // consume OR
            const right = parseXOR();
            left = { op: 'OR', left, right };
          }
          
          return left;
        };
        
        const parseXOR = () => {
          let left = parseAND();
          
          while (peek() === 'XOR') {
            consume(); // consume XOR
            const right = parseAND();
            left = { op: 'XOR', left, right };
          }
          
          return left;
        };
        
        const parseAND = () => {
          let left = parseNOT();
          
          while (peek() === 'AND') {
            consume(); // consume AND
            const right = parseNOT();
            left = { op: 'AND', left, right };
          }
          
          return left;
        };
        
        const parseNOT = () => {
          if (peek() === 'NOT') {
            consume(); // consume NOT
            return { op: 'NOT', operand: parseNOT() };
          }
          
          return parseAtom();
        };
        
        const parseAtom = () => {
          const token = peek();
          
          if (token === '(') {
            consume(); // consume (
            const expr = parseIFF();
            if (peek() === ')') {
              consume(); // consume )
            }
            return expr;
          }
          
          if (token === 'TRUE' || token === 'T') {
            consume();
            return { type: 'literal', value: true };
          }
          
          if (token === 'FALSE' || token === 'F') {
            consume();
            return { type: 'literal', value: false };
          }
          
          // Variable - now supports multi-character variables
          if (token && /^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
            consume();
            return { type: 'variable', name: token };
          }
          
          throw new Error(`Unexpected token: ${token}`);
        };
        
        return parseIFF();
      };
      
      // Evaluator
      const evaluate = (ast, varValues) => {
        if (ast.type === 'literal') {
          return ast.value;
        }
        
        if (ast.type === 'variable') {
          // Case-insensitive variable lookup
          const index = variables.findIndex(v => v.toLowerCase() === ast.name.toLowerCase());
          if (index === -1) throw new Error(`Unknown variable: ${ast.name}`);
          return varValues[index];
        }
        
        if (ast.op === 'NOT') {
          return !evaluate(ast.operand, varValues);
        }
        
        if (ast.op === 'AND') {
          return evaluate(ast.left, varValues) && evaluate(ast.right, varValues);
        }
        
        if (ast.op === 'OR') {
          return evaluate(ast.left, varValues) || evaluate(ast.right, varValues);
        }
        
        if (ast.op === 'XOR') {
          return evaluate(ast.left, varValues) !== evaluate(ast.right, varValues);
        }
        
        if (ast.op === 'IMPLIES') {
          const leftVal = evaluate(ast.left, varValues);
          const rightVal = evaluate(ast.right, varValues);
          return !leftVal || rightVal; // A → B ≡ ¬A ∨ B
        }
        
        if (ast.op === 'IFF') {
          return evaluate(ast.left, varValues) === evaluate(ast.right, varValues);
        }
        
        throw new Error(`Unknown operator: ${ast.op}`);
      };
      
      // Main evaluation
      const tokens = tokenize(expression);
      const ast = parse(tokens);
      return evaluate(ast, values);
      
    } catch (e) {
      console.error('Evaluation error:', e.message, 'for expression:', expression);
      return 'Error';
    }
  };

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
          const result = evaluateExpression(statement, row.values);
          row.results.push(result);
        }
      });
      
      table.push(row);
    }
    
    setTruthTable(table);
  }, [variables, statements]);

  // Auto-generate truth table when variables or statements change
  React.useEffect(() => {
    generateTruthTable();
  }, [generateTruthTable]);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '32px',
      color: '#1f2937'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      alignItems: 'start'
    },
    gridMobile: {
      display: 'block'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#374151'
    },
    variableSection: {
      backgroundColor: '#dbeafe',
      padding: '24px',
      borderRadius: '8px'
    },
    statementSection: {
      backgroundColor: '#dcfce7',
      padding: '24px',
      borderRadius: '8px'
    },
    inputRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px'
    },
    variableInput: {
      width: '120px', // Increased width for multi-character variables
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none'
    },
    statementInput: {
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
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    buttonGreen: {
      backgroundColor: '#059669'
    },
    buttonPurple: {
      backgroundColor: '#7c3aed',
      padding: '12px 24px',
      fontSize: '16px',
      width: '100%',
      justifyContent: 'center',
      fontWeight: '600'
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
    },
    helpBox: {
      fontSize: '13px',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    helpTitle: {
      fontWeight: '600',
      marginBottom: '8px'
    },
    helpGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px'
    },
    code: {
      backgroundColor: 'white',
      padding: '2px 4px',
      borderRadius: '3px',
      fontFamily: 'monospace'
    },
    error: {
      marginBottom: '16px',
      padding: '12px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      borderRadius: '6px'
    },
    tableContainer: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      border: '1px solid #d1d5db'
    },
    tableHeader: {
      backgroundColor: '#e5e7eb',
      fontWeight: '600'
    },
    tableHeaderResult: {
      backgroundColor: '#fef3c7',
      fontSize: '16px',
      fontFamily: 'serif'
    },
    tableCell: {
      border: '1px solid #d1d5db',
      padding: '8px 12px',
      textAlign: 'center'
    },
    tableRow: {
      ':hover': {
        backgroundColor: '#f3f4f6'
      }
    },
    truthValue: {
      fontFamily: 'monospace',
      fontWeight: 'bold'
    },
    truthTrue: {
      color: '#059669'
    },
    truthFalse: {
      color: '#dc2626'
    },
    truthError: {
      color: '#dc2626'
    },
    resultCell: {
      backgroundColor: '#fffbeb'
    },
    tableStats: {
      marginTop: '16px',
      fontSize: '12px',
      color: '#6b7280',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    autoCorrectNotice: {
      fontSize: '12px',
      color: '#059669',
      backgroundColor: '#d1fae5',
      padding: '8px',
      borderRadius: '6px',
      marginTop: '8px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Truth Table Generator</h1>
      
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}
      
      <div style={window.innerWidth > 1024 ? styles.grid : styles.gridMobile}>
        {/* Input Section */}
        <div>
          {/* Variables Section */}
          <div style={{...styles.section, ...styles.variableSection}}>
            <h2 style={styles.sectionTitle}>Boolean Variables</h2>
            <div>
              {variables.map((variable, index) => (
                <div key={index} style={styles.inputRow}>
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => updateVariable(index, e.target.value)}
                    onKeyDown={
                      (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addVariable();
                        }
                      }
                    }
                    style={styles.variableInput}
                    maxLength="10"
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
                disabled={variables.length >= 8}
                style={{
                  ...styles.button,
                  ...(variables.length >= 8 ? styles.buttonDisabled : {})
                }}
              >
                + Add Variable
              </button>
            </div>
          </div>
          
          {/* Statements Section */}
          <div style={{...styles.section, ...styles.statementSection}}>
            <h2 style={styles.sectionTitle}>Logical Statements</h2>
            <div>
              {statements.map((statement, index) => (
                <div key={index} style={styles.inputRow}>
                  <input
                    type="text"
                    value={statement}
                    onChange={(e) => updateStatement(index, e.target.value)}
                    onKeyDown={
                      (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addStatement();
                        }
                      }
                    }
                    placeholder="Type: var1 and var2, p --> q, not myVar, etc..."
                    style={styles.statementInput}
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
                style={{...styles.button, ...styles.buttonGreen}}
              >
                + Add Statement
              </button>
            </div>
          </div>
          
          {/* Help Section */}
          <div style={styles.helpBox}>
            <div style={styles.helpTitle}>Auto-correction shortcuts:</div>
            <div style={styles.helpGrid}>
              <div><code style={styles.code}>/\, and, &</code> → AND (∧)</div>
              <div><code style={styles.code}>\/, or, |</code> → OR (∨)</div>
              <div><code style={styles.code}>not, !, ~</code> → NOT(¬)</div>
              <div><code style={styles.code}>^, xor</code> → XOR (⊕)</div>
              <div><code style={styles.code}>-->, implies</code> → IMPLIES (→)</div>
              <div><code style={styles.code}>&lt;-&gt;, iff</code> → IF AND ONLY IF (↔)</div>
            </div>
            <div style={{marginTop: '8px'}}>
              <div style={styles.helpTitle}>Variables and Constants:</div>
              <div style={{fontSize: '12px'}}>
                <div><code style={styles.code}>var1, myVar, p_1</code> → Multi-character variables (letters, numbers, underscores)</div>
                <div><code style={styles.code}>true, false</code> → T, F</div>
                <div><code style={styles.code}>( )</code> - Parentheses for grouping</div>
                <div style={{color: '#dc2626', marginTop: '4px'}}>
                  ⚠️ Reserved words (true, false, and, or, not, xor, etc.) cannot be used as variable names
                </div>
              </div>
            </div>
            <div style={{marginTop: '8px', fontSize: '12px'}}>
              Try typing: "var1 and var2", "premise --> conclusion", "(condition iff result) /\ not error"
            </div>
          </div>
        </div>
        
        {/* Truth Table Section */}
        <div>
          {truthTable.length > 0 && (
            <div style={styles.tableContainer}>
              <h2 style={styles.sectionTitle}>Truth Table</h2>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      {variables.map((variable, index) => (
                        <th key={`var-${index}`} style={styles.tableCell}>
                          {variable}
                        </th>
                      ))}
                      {statements.map((statement, index) => {
                        if (!statement.trim()) return null; // Don't show column for empty statements
                        const symbolized = convertToSymbols(statement);
                        const truncated = symbolized.length > 25 ? `${symbolized.slice(0, 25)}...` : symbolized;
                        return (
                          <th key={`stmt-${index}`} style={{...styles.tableCell, ...styles.tableHeaderResult}} title={symbolized}>
                            {truncated}
                          </th>
                        );
                      }).filter(Boolean)}
                    </tr>
                  </thead>
                  <tbody>
                    {truthTable.map((row) => (
                      <tr key={row.id}>
                        {row.values.map((value, index) => (
                          <td key={`val-${index}`} style={styles.tableCell}>
                            <span style={{
                              ...styles.truthValue,
                              ...(value ? styles.truthTrue : styles.truthFalse)
                            }}>
                              {value ? 'T' : 'F'}
                            </span>
                          </td>
                        ))}
                        {row.results.map((result, index) => {
                          // Only show results for non-empty statements
                          const statement = statements[index];
                          if (!statement || !statement.trim()) return null;
                          
                          return (
                            <td key={`res-${index}`} style={{...styles.tableCell, ...styles.resultCell}}>
                              <span style={{
                                ...styles.truthValue,
                                ...(result === 'Error' ? styles.truthError : 
                                    result ? styles.truthTrue : styles.truthFalse)
                              }}>
                                {result === 'Error' ? 'ERR' : result ? 'T' : 'F'}
                              </span>
                            </td>
                          );
                        }).filter(Boolean)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={styles.tableStats}>
                <div>
                  <span style={{fontWeight: '600'}}>Variables:</span> {variables.join(', ')}
                </div>
                <div>
                  <span style={{fontWeight: '600'}}>Rows:</span> {truthTable.length}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruthTableGenerator;