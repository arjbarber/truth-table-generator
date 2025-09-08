import React from 'react';

const HelpSection = () => {
  const styles = {
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
    warning: {
      color: '#dc2626',
      marginTop: '4px'
    },
    example: {
      marginTop: '8px',
      fontSize: '12px'
    }
  };

  return (
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
          <div style={styles.warning}>
            ⚠️ Reserved words (true, false, and, or, not, xor, etc.) cannot be used as variable names
          </div>
        </div>
      </div>
      <div style={styles.example}>
        Try typing: "var1 and var2", "premise --> conclusion", "(condition iff result) /\ not error"
      </div>
    </div>
  );
};

export default HelpSection;