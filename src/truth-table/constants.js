export const RESERVED_WORDS = new Set([
  'true', 'false', 't', 'f',
  'and', 'or', 'not', 'xor', 'implies', 'iff',
  'if', 'then', 'only'
]);

export const OPERATOR_REPLACEMENTS = [
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

export const MAX_VARIABLES = 8;
export const MAX_VARIABLE_NAME_LENGTH = 10;