import React from 'react';
import { convertToSymbols } from '../utils/autoCorrect';

const TruthTable = ({ truthTable, variables, statements }) => {
  const styles = {
    container: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px'
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#374151'
    },
    wrapper: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      border: '1px solid #d1d5db'
    },
    header: {
      backgroundColor: '#e5e7eb',
      fontWeight: '600'
    },
    headerResult: {
      backgroundColor: '#fef3c7',
      fontSize: '16px',
      fontFamily: 'serif'
    },
    cell: {
      border: '1px solid #d1d5db',
      padding: '8px 12px',
      textAlign: 'center'
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
    stats: {
      marginTop: '16px',
      fontSize: '12px',
      color: '#6b7280',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  };

  if (truthTable.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Truth Table</h2>
      <div style={styles.wrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.header}>
              {variables.map((variable, index) => (
                <th key={`var-${index}`} style={styles.cell}>
                  {variable}
                </th>
              ))}
              {statements.map((statement, index) => {
                if (!statement.trim()) return null;
                const symbolized = convertToSymbols(statement);
                const truncated = symbolized.length > 25 ? `${symbolized.slice(0, 25)}...` : symbolized;
                return (
                  <th 
                    key={`stmt-${index}`} 
                    style={{...styles.cell, ...styles.headerResult}} 
                    title={symbolized}
                  >
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
                  <td key={`val-${index}`} style={styles.cell}>
                    <span style={{
                      ...styles.truthValue,
                      ...(value ? styles.truthTrue : styles.truthFalse)
                    }}>
                      {value ? 'T' : 'F'}
                    </span>
                  </td>
                ))}
                {row.results.map((result, index) => {
                  const statement = statements[index];
                  if (!statement || !statement.trim()) return null;
                  
                  return (
                    <td key={`res-${index}`} style={{...styles.cell, ...styles.resultCell}}>
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
      
      <div style={styles.stats}>
        <div>
          <span style={{fontWeight: '600'}}>Variables:</span> {variables.join(', ')}
        </div>
        <div>
          <span style={{fontWeight: '600'}}>Rows:</span> {truthTable.length}
        </div>
      </div>
    </div>
  );
};

export default TruthTable;