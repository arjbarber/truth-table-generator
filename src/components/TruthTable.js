import React, { useState, useRef, useEffect } from "react";
import { convertToSymbols } from "../utils/autoCorrect";

const TruthTable = ({ truthTable, variables, statements, onDropdownSelect }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (truthTable.length === 0) {
    return null;
  }

  const handleOptionClick = (menu, value) => {
    setOpenMenu(null);
    if (onDropdownSelect) {
      onDropdownSelect({ menu, value });
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {/* Header with dropdown menus */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Truth Table</h2>

        <div className="flex space-x-2" ref={menuRef}>
          {/* Copy menu */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "copy" ? null : "copy")
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Copy ▾
            </button>

            {openMenu === "copy" && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleOptionClick("copy", "latex")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy as LaTeX
                </button>
                <button
                  onClick={() => handleOptionClick("copy", "markdown")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy as Markdown
                </button>
                <button
                  onClick={() => handleOptionClick("copy", "html")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy as HTML
                </button>
              </div>
            )}
          </div>

          {/* Download menu */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "download" ? null : "download")
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Download ▾
            </button>

            {openMenu === "download" && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleOptionClick("download", "csv")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download as CSV
                </button>
                <button
                  onClick={() => handleOptionClick("download", "excel")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download as Excel
                </button>
                <button
                  onClick={() => handleOptionClick("download", "pdf")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm border border-gray-300">
          <thead>
            <tr className="bg-gray-200 font-semibold">
              {variables.map((variable, index) => (
                <th
                  key={`var-${index}`}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  {variable}
                </th>
              ))}
              {statements
                .map((statement, index) => {
                  if (!statement.trim()) return null;
                  const symbolized = convertToSymbols(statement);
                  const truncated =
                    symbolized.length > 25
                      ? `${symbolized.slice(0, 25)}...`
                      : symbolized;
                  return (
                    <th
                      key={`stmt-${index}`}
                      className="border border-gray-300 px-3 py-2 text-center bg-amber-100 text-base font-serif"
                      title={symbolized}
                    >
                      {truncated}
                    </th>
                  );
                })
                .filter(Boolean)}
            </tr>
          </thead>
          <tbody>
            {truthTable.map((row) => (
              <tr key={row.id}>
                {row.values.map((value, index) => (
                  <td
                    key={`val-${index}`}
                    className="border border-gray-300 px-3 py-2 text-center"
                  >
                    <span
                      className={`font-mono font-bold ${
                        value ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {value ? "T" : "F"}
                    </span>
                  </td>
                ))}
                {row.results
                  .map((result, index) => {
                    const statement = statements[index];
                    if (!statement || !statement.trim()) return null;

                    return (
                      <td
                        key={`res-${index}`}
                        className="bg-amber-50 border border-gray-300 px-3 py-2 text-center"
                      >
                        <span
                          className={`font-mono font-bold ${
                            result === "Error"
                              ? "text-red-600"
                              : result
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result === "Error" ? "ERR" : result ? "T" : "F"}
                        </span>
                      </td>
                    );
                  })
                  .filter(Boolean)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500 grid grid-cols-2 gap-4">
        <div>
          <span className="font-semibold">Variables:</span>{" "}
          {variables.join(", ")}
        </div>
        <div>
          <span className="font-semibold">Rows:</span> {truthTable.length}
        </div>
      </div>
    </div>
  );
};

export default TruthTable;