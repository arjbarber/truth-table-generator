import React from 'react';
import { convertToSymbols } from '../utils/autoCorrect';

const TruthTable = ({ truthTable, variables, statements }) => {

  if (truthTable.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Truth Table</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-200 font-semibold">
              {variables.map((variable, index) => (
                <th key={`var-${index}`} className="border border-gray-300 px-3 py-2 text-center">
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
                    className="border border-gray-300 px-3 py-2 text-center bg-amber-100 text-base font-serif" 
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
                  <td key={`val-${index}`} className="border border-gray-300 px-3 py-2 text-center">
                    <span className={`font-mono font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? 'T' : 'F'}
                    </span>
                  </td>
                ))}
                {row.results.map((result, index) => {
                  const statement = statements[index];
                  if (!statement || !statement.trim()) return null;
                  
                  return (
                    <td key={`res-${index}`} className="bg-amber-50 border border-gray-300 px-3 py-2 text-center">
                      <span className={`font-mono font-bold ${result === 'Error' ? 'text-red-600' : result ? 'text-green-600' : 'text-red-600'}`}>
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
      
      <div className="mt-4 text-xs text-gray-500 grid grid-cols-2 gap-4">
        <div>
          <span className="font-semibold">Variables:</span> {variables.join(', ')}
        </div>
        <div>
          <span className="font-semibold">Rows:</span> {truthTable.length}
        </div>
      </div>
    </div>
  );
};

export default TruthTable;