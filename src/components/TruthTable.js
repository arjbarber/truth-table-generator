import React from 'react';
import { convertToSymbols } from '../utils/autoCorrect';
import '../styles/TruthTable.css';

const TruthTable = ({ truthTable, variables, statements }) => {

  if (truthTable.length === 0) {
    return null;
  }

  return (
    <div className="truth-table-container">
      <h2 className="truth-table-title">Truth Table</h2>
      <div className="truth-table-wrapper">
        <table className="truth-table">
          <thead>
            <tr className="truth-table-header">
              {variables.map((variable, index) => (
                <th key={`var-${index}`} className="truth-table-cell">
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
                    className="truth-table-cell truth-table-header-result" 
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
                  <td key={`val-${index}`} className="truth-table-cell">
                    <span className={`truth-value ${value ? 'truth-true' : 'truth-false'}`}>
                      {value ? 'T' : 'F'}
                    </span>
                  </td>
                ))}
                {row.results.map((result, index) => {
                  const statement = statements[index];
                  if (!statement || !statement.trim()) return null;
                  
                  return (
                    <td key={`res-${index}`} className="truth-table-result-cell">
                      <span className={`truth-value ${result === 'Error' ? 'truth-error' : result ? 'truth-true' : 'truth-false'}`}>
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
      
      <div className="truth-table-stats">
        <div>
          <span className="truth-table-stats-label">Variables:</span> {variables.join(', ')}
        </div>
        <div>
          <span className="truth-table-stats-label">Rows:</span> {truthTable.length}
        </div>
      </div>
    </div>
  );
};

export default TruthTable;