export const evaluateExpression = (expression, variables, values) => {
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