import React from 'react';

const HelpSection = () => {
  return (
    <div className="text-[13px] text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
      <div className="font-semibold mb-2">Auto-correction shortcuts:</div>
      <div className="grid grid-cols-2 gap-2">
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">/\, and, &</code> → AND (∧)</div>
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">\/, or, |</code> → OR (∨)</div>
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">not, !, ~</code> → NOT(¬)</div>
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">^, xor</code> → XOR (⊕)</div>
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">{"-->"}, implies</code> → IMPLIES (→)</div>
        <div><code className="bg-white px-1 py-0.5 rounded font-mono">{"<->"}, iff</code> → IF AND ONLY IF (↔)</div>
      </div>
      <div className="mt-2">
        <div className="font-semibold mb-2">Variables and Constants:</div>
        <div className="text-xs">
          <div><code className="bg-white px-1 py-0.5 rounded font-mono">var1, myVar, p_1</code> → Multi-character variables (letters, numbers, underscores)</div>
          <div><code className="bg-white px-1 py-0.5 rounded font-mono">true, false</code> → T, F</div>
          <div><code className="bg-white px-1 py-0.5 rounded font-mono">( )</code> - Parentheses for grouping</div>
          <div className="text-red-600 mt-1">
            ⚠️ Reserved words (true, false, and, or, not, xor, etc.) cannot be used as variable names
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs">
        Try typing: "var1 and var2", "premise --> conclusion", "(condition iff result) /\ not error"
      </div>
    </div>
  );
};

export default HelpSection;