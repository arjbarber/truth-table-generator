import React from 'react';
import '../styles/HelpSection.css';

const HelpSection = () => {
  return (
    <div className="help-box">
      <div className="help-title">Auto-correction shortcuts:</div>
      <div className="help-grid">
        <div><code className="help-code">/\, and, &</code> → AND (∧)</div>
        <div><code className="help-code">\/, or, |</code> → OR (∨)</div>
        <div><code className="help-code">not, !, ~</code> → NOT(¬)</div>
        <div><code className="help-code">^, xor</code> → XOR (⊕)</div>
        <div><code className="help-code">{"-->"}, implies</code> → IMPLIES (→)</div>
        <div><code className="help-code">{"<->"}, iff</code> → IF AND ONLY IF (↔)</div>
      </div>
      <div className="help-variables">
        <div className="help-title">Variables and Constants:</div>
        <div className="help-variables-content">
          <div><code className="help-code">var1, myVar, p_1</code> → Multi-character variables (letters, numbers, underscores)</div>
          <div><code className="help-code">true, false</code> → T, F</div>
          <div><code className="help-code">( )</code> - Parentheses for grouping</div>
          <div className="help-warning">
            ⚠️ Reserved words (true, false, and, or, not, xor, etc.) cannot be used as variable names
          </div>
        </div>
      </div>
      <div className="help-example">
        Try typing: "var1 and var2", "premise --> conclusion", "(condition iff result) /\ not error"
      </div>
    </div>
  );
};

export default HelpSection;