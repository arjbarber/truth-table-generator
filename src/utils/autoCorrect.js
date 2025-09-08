import { OPERATOR_REPLACEMENTS } from '../constants';

export const autoCorrectLogicalExpression = (input) => {
  let corrected = input;
  
  // Apply replacements
  OPERATOR_REPLACEMENTS.forEach(({ pattern, symbol }) => {
    corrected = corrected.replace(pattern, symbol);
  });
  
  // Clean up extra spaces around operators but preserve user spaces
  corrected = corrected.replace(/\s*(¬)\s*/g, '$1 ');
  corrected = corrected.replace(/\s*(∧|∨|→|↔|⊕)\s*/g, ' $1 ');
  corrected = corrected.replace(/\s{2,}/g, ' '); // Only replace multiple spaces with single space
  
  return corrected;
};

export const convertToSymbols = (expression) => {
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