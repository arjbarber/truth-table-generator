import React, { useState, useCallback } from 'react';

const TruthTableGenerator = () => {
  const [variables, setVariables] = useState(['A', 'B']);
  const [statements, setStatements] = useState(['A AND B', 'A IMPLIES B', 'A IFF B']);
  const [truthTable, setTruthTable] = useState([]);
  const [error, setError] = useState('');

  const addVariable = () => {
    const nextLetter = String.fromCharCode(65 + variables.length);
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
    newVars[index] = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
    setVariables(newVars);
  };

  const addStatement = () => {
    setStatements([...statements, '']);
  };

  const removeStatement = (index) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  const updateStatement = (index, value) => {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
  };

  const evaluateExpression = (expression, values) => {
    try {
      // Tokenizer
      const tokenize = (expr) => {
        const tokens = [];
        let i = 0;
        expr = expr.replace(/\s+/g, ' ').trim();
        
        while (i < expr.length) {
          if (expr[i] === ' ') {
            i++;
            continue;
          }
          
          if (expr[i] === '(' || expr[i] === ')') {
            tokens.push(expr[i]);
            i++;
          } else if (/[A-Z]/.test(expr[i])) {
            // Check for multi-character operators or variables
            let token = '';
            while (i < expr.length && /[A-Z]/.test(expr[i])) {
              token += expr[i];
              i++;
            }
            
            // Check if it's a multi-word operator
            if (token === 'IF' && expr.substr(i).trimStart().startsWith('AND ONLY IF')) {
              token = 'IFF';
              i = expr.indexOf('IF', i + 1) + 2; // Skip to after second IF
            } else if (token === 'TRUE' || token === 'FALSE') {
              tokens.push(token);
            } else {
              tokens.push(token);
            }
          } else {
            i++;
          }
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
          
          // Variable
          if (token && /^[A-Z]$/.test(token)) {
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
          const index = variables.findIndex(v => v === ast.name);
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
      const tokens = tokenize(expression.toUpperCase());
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
      setError('All statements must have expressions');
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
      
      // Generate binary values for variables
      for (let j = variables.length - 1; j >= 0; j--) {
        row.values.push(!!(i & (1 << j)));
      }
      
      // Evaluate each statement
      statements.forEach(statement => {
        const result = evaluateExpression(statement, row.values);
        row.results.push(result);
      });
      
      table.push(row);
    }
    
    setTruthTable(table);
  }, [variables, statements]);

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
      width: '64px',
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
      backgroundColor: '#fef3c7'
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
                    style={styles.variableInput}
                    maxLength="1"
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
                    placeholder="Enter logical expression..."
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
            <div style={styles.helpTitle}>Supported operators:</div>
            <div style={styles.helpGrid}>
              <div><code style={styles.code}>AND</code> - Logical AND (∧)</div>
              <div><code style={styles.code}>OR</code> - Logical OR (∨)</div>
              <div><code style={styles.code}>NOT</code> - Logical NOT (¬)</div>
              <div><code style={styles.code}>XOR</code> - Exclusive OR (⊕)</div>
              <div><code style={styles.code}>IMPLIES</code> - Implication (→)</div>
              <div><code style={styles.code}>IFF</code> - If and only if (↔)</div>
            </div>
            <div style={{marginTop: '8px'}}>
              <div style={styles.helpTitle}>Constants & Features:</div>
              <div style={{fontSize: '12px'}}>
                <div><code style={styles.code}>T, TRUE, F, FALSE</code> - Boolean literals</div>
                <div><code style={styles.code}>( )</code> - Parentheses for grouping</div>
              </div>
            </div>
            <div style={{marginTop: '8px', fontSize: '12px'}}>
              Examples: "A AND B", "A IMPLIES (B OR F)", "(A IFF T) AND NOT B", "NOT(A XOR B)"
            </div>
          </div>
          
          <button
            onClick={generateTruthTable}
            style={{...styles.button, ...styles.buttonPurple}}
          >
            ▶ Generate Truth Table
          </button>
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
                      {statements.map((statement, index) => (
                        <th key={`stmt-${index}`} style={{...styles.tableCell, ...styles.tableHeaderResult}}>
                          {statement.length > 15 ? `${statement.slice(0, 15)}...` : statement}
                        </th>
                      ))}
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
                        {row.results.map((result, index) => (
                          <td key={`res-${index}`} style={{...styles.tableCell, ...styles.resultCell}}>
                            <span style={{
                              ...styles.truthValue,
                              ...(result === 'Error' ? styles.truthError : 
                                  result ? styles.truthTrue : styles.truthFalse)
                            }}>
                              {result === 'Error' ? 'ERR' : result ? 'T' : 'F'}
                            </span>
                          </td>
                        ))}
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