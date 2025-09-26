import React, { useState, useCallback, useEffect } from 'react';
import VariablesSection from './components/VariablesSection';
import StatementsSection from './components/StatementsSection';
import HelpSection from './components/HelpSection';
import TruthTable from './components/TruthTable';
import IssueModal from "./components/IssueModal";
import { evaluateExpression } from './utils/expressionEvaluator';
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TruthTableGenerator = () => {
  const [variables, setVariables] = useState(['a', 'b']);
  const [statements, setStatements] = useState(['a ∧ b', 'a → b', 'a ↔ b']);
  const [truthTable, setTruthTable] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [animate, setAnimate] = useState(false);

  const alert = (text) => {
    setAlertMessage(text);
    setShowAlert(true);
    
    // small delay so Tailwind sees the transition from opacity-0 → opacity-100
    setTimeout(() => setAnimate(true), 50);  

    // fade out
    setTimeout(() => setAnimate(false), 2000);  
    setTimeout(() => setShowAlert(false), 2500);
  };

  const generateTruthTable = useCallback(() => {
    setError('');
    
    if (variables.some(v => !v.trim())) {
      setError('All variables must have names');
      return;
    }
    
    if (statements.some(s => !s.trim())) {
      // Don't show error for empty statements, just return empty table
      setTruthTable([]);
      return;
    }
    
    const numRows = Math.pow(2, variables.length);
    const table = [];
    
    for (let i = 0; i < numRows; i++) {
      const row = {
        id: i,
        values: [],
        results: []
      };
      
      // Generate binary values for variables (start with all T instead of all F)
      for (let j = variables.length - 1; j >= 0; j--) {
        row.values.push(!(i & (1 << j)));
      }
      
      // Evaluate each statement
      statements.forEach(statement => {
        if (statement.trim()) {
          const result = evaluateExpression(statement, variables, row.values);
          row.results.push(result);
        }
      });
      
      table.push(row);
    }
    
    setTruthTable(table);
  }, [variables, statements]);

  // Auto-generate truth table when variables or statements change
  useEffect(() => {
    generateTruthTable();
  }, [generateTruthTable]);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Site: truthtable.andrewbarber.dev\n";

    const headers = [...variables, ...statements];
    csvContent += headers.join(",") + "\n";

    truthTable.forEach(row => {
      const rowValues = [
        ...row.values.map(v => (v ? "T" : "F")),
        ...row.results.map(r => (r ? "T" : "F"))
      ];
      csvContent += rowValues.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "truth_table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("CSV file downloaded!");
  };

  const exportToExcel = () => {
    try {
      const workbook = new ExcelJS.Workbook();
      // Ensure Excel recalculates formulas on open
      if (workbook.properties) workbook.calcProperties = { fullCalcOnLoad: true };
      const sheet = workbook.addWorksheet('Truth Table');

      // Header row: variables then statements
      const headers = [...variables, ...statements];
      sheet.addRow(headers);

      // Style header
      sheet.getRow(1).font = { bold: true };

      // Add data rows. We'll write variables as TRUE/FALSE and statements as formulas using Excel functions.
      // Map T/F to Excel TRUE/FALSE values so formulas can reference them.
      for (let i = 0; i < truthTable.length; i++) {
        const row = truthTable[i];
        const excelRow = [];

        // Variables columns: use Excel TRUE/FALSE
        for (let j = 0; j < row.values.length; j++) {
          excelRow.push(row.values[j] ? true : false);
        }

        const variableOffset = 0; // variables start at column 1

        // Build Excel formulas from statements using a small parser (tokenize -> shunting-yard -> to-formula)
        const statementFormulas = statements.map((stmt) => {
          if (!stmt || !stmt.trim()) return '""';

          // Helpers
          const colLetter = (index) => {
            let s = '';
            while (index > 0) {
              const mod = (index - 1) % 26;
              s = String.fromCharCode(65 + mod) + s;
              index = Math.floor((index - 1) / 26);
            }
            return s;
          };

          const varRef = (v) => {
            const vi = variables.indexOf(v);
            if (vi === -1) return v; // leave as-is
            return `${colLetter(variableOffset + vi + 1)}${i + 2}`;
          };

          // Tokenize expression
          const tokenize = (s) => {
            const tokens = [];
            const re = /\s*([A-Za-z_][A-Za-z0-9_]*|\(|\)|→|->|↔|<->|∧|\^|∨|\||\|\||¬|~|!|⊕|\*|\+|-|\/|\bIFF\b|\bIMPLIES\b|\bXOR\b)\s*/g;
            let m;
            let lastIndex = 0;
            while ((m = re.exec(s)) !== null) {
              if (m.index > lastIndex) {
                // catch any unknowns (like spaces or symbols)
                const unknown = s.substring(lastIndex, m.index).trim();
                if (unknown) tokens.push(unknown);
              }
              tokens.push(m[1]);
              lastIndex = re.lastIndex;
            }
            if (lastIndex < s.length) {
              const rest = s.substring(lastIndex).trim();
              if (rest) tokens.push(rest);
            }
            return tokens.map(t => {
              // normalize
              if (t === '->' || t === '→') return 'IMPLIES';
              if (t === '<->' || t === '↔') return 'IFF';
              if (t === '∧' || t === '^') return 'AND';
              if (t === '∨' || t === '|' || t === '||') return 'OR';
              if (t === '¬' || t === '~' || t === '!') return 'NOT';
              if (t === '⊕' || /^(?:XOR)$/i.test(t)) return 'XOR';
              if (/^IFF$/i.test(t)) return 'IFF';
              if (/^IMPLIES$/i.test(t)) return 'IMPLIES';
              return t;
            }).filter(Boolean);
          };

          // Shunting-yard to produce RPN (postfix)
          const toRPN = (tokens) => {
            const out = [];
            const ops = [];
            const precedence = { 'NOT': 5, 'AND': 4, 'XOR': 3, 'OR': 2, 'IMPLIES': 1, 'IFF': 0 };
            const rightAssoc = { 'NOT': true, 'IMPLIES': true };
            tokens.forEach(t => {
              if (t === '(') {
                ops.push(t);
              } else if (t === ')') {
                while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop());
                ops.pop(); // pop '('
              } else if (precedence.hasOwnProperty(t)) {
                while (ops.length) {
                  const top = ops[ops.length - 1];
                  if (!precedence.hasOwnProperty(top)) break;
                  if ((rightAssoc[t] && precedence[t] < precedence[top]) || (!rightAssoc[t] && precedence[t] <= precedence[top])) {
                    out.push(ops.pop());
                    continue;
                  }
                  break;
                }
                ops.push(t);
              } else {
                // operand (variable or literal)
                out.push(t);
              }
            });
            while (ops.length) out.push(ops.pop());
            return out;
          };

          // Convert RPN to Excel formula string
          const rpnToFormula = (rpn) => {
            const stack = [];
            rpn.forEach(tok => {
              if (tok === 'NOT') {
                const a = stack.pop();
                stack.push(`NOT(${a})`);
              } else if (tok === 'AND') {
                const b = stack.pop();
                const a = stack.pop();
                stack.push(`AND(${a},${b})`);
              } else if (tok === 'OR') {
                const b = stack.pop();
                const a = stack.pop();
                stack.push(`OR(${a},${b})`);
              } else if (tok === 'XOR') {
                const b = stack.pop();
                const a = stack.pop();
                stack.push(`(NOT(${a})=${b})`);
              } else if (tok === 'IMPLIES') {
                const b = stack.pop();
                const a = stack.pop();
                stack.push(`IF(${a},${b},TRUE)`);
              } else if (tok === 'IFF') {
                const b = stack.pop();
                const a = stack.pop();
                stack.push(`(${a}=${b})`);
              } else {
                // operand: variable or literal
                // if it's a variable name, convert to cell ref
                if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(tok) && variables.includes(tok)) {
                  stack.push(varRef(tok));
                } else if (/^T(RUE)?$/i.test(tok)) {
                  stack.push('TRUE');
                } else if (/^F(ALSE)?$/i.test(tok)) {
                  stack.push('FALSE');
                } else {
                  // any other token, pass through (could be parentheses or numbers)
                  stack.push(tok);
                }
              }
            });
            return stack.length ? stack[0] : '""';
          };

          try {
            const tokens = tokenize(stmt);
            const rpn = toRPN(tokens);
            const formulaBody = rpnToFormula(rpn);
            return '=' + formulaBody;
          } catch (e) {
            console.error('Failed to build formula for', stmt, e);
            return '""';
          }
        });

        // Build row cells: variables, then for each statement write the formula object (visible cell)
        const rowCells = [];
        // push variable booleans
        for (let k = 0; k < excelRow.length; k++) rowCells.push(excelRow[k]);

        for (let si = 0; si < statementFormulas.length; si++) {
          const formula = statementFormulas[si];
          const cached = !!row.results[si];
          if (typeof formula === 'string' && formula.startsWith('=')) {
            // remove any leading '@' characters just in case, and strip the leading '=' for exceljs formula property
            const clean = formula.slice(1).replace(/^@+/, '');
            rowCells.push({ formula: clean, result: cached });
          } else {
            rowCells.push(formula);
          }
        }

        const newRow = sheet.addRow(rowCells);

        newRow.eachCell((cell, colNumber) => {
          if (cell.type === ExcelJS.ValueType.Boolean || typeof cell.value === 'boolean' || (typeof cell.value === 'string' && cell.value.startsWith('='))) {
            if (typeof cell.value === 'boolean') {
              if (cell.value === true) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFb6f5c6' }
                };
              }
            } else if (typeof cell.value === 'string' && cell.value.startsWith('=')) {
              cell.numFmt = 'General';
            }
          }
        });
      }

      // Attempt to add a simple conditional formatting equivalent by creating an alternate style for cells that evaluate to TRUE.
      // Note: exceljs's conditional formatting support is limited; many clients (Excel) will still evaluate formulas on open.

      // Generate file and trigger download in browser
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'truth_table.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
      alert("Excel file downloaded!");
    } catch (err) {
      console.error('Excel export failed', err);
      alert('Excel export failed. Please tell Andrew');
    }
  };

  const exportToPDF = () => {
    const table = document.querySelector("#truth-table"); // your table element
    if (!table) {
      alert("Truth table not found in DOM!");
      return;
    }

    html2canvas(table, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Landscape A4 paper
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10; // mm
      const pdfWidth = pageWidth - 2 * margin;
      const pdfHeight = pageHeight - 2 * margin;

      // Maintain aspect ratio of table
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        imgWidth,
        imgHeight > pdfHeight ? pdfHeight : imgHeight
      );

      pdf.save("truth_table.pdf");
      alert("PDF file downloaded!")
    }).catch((err) => {
      console.error("PDF export failed", err);
      alert("PDF export failed. Please tell Andrew.");
    });
  };

  const copyAsLatex = () => {
    // Build header
    const headers = [...variables, ...statements];

    // Column format: variables separated by |, then ||, then statements separated by |
    const colFormat = [
      variables.map(() => "c").join("|"),
      statements.length > 0 ? "||" + statements.map(() => "c").join("|") : ""
    ].join("");

    const headerRow = headers.map(h =>
      h
        .replace(/\*/g, "\\land")
        .replace(/∧/g, "\\land")
        .replace(/→/g, "\\to")
        .replace(/↔/g, "\\leftrightarrow")
        .replace(/∨/g, "\\lor")
        .replace(/¬/g, "\\lnot")
        .replace(/⊕/g, "\\oplus")
    ).join(" & ");

    // Build rows
    const rows = truthTable.map(row => {
      const rowValues = [
        ...row.values.map(v =>
          v ? "{\\color{green}\\mathrm{T}}" : "{\\color{red}\\mathrm{F}}"
        ),
        ...row.results.map(r =>
          r ? "{\\color{green}\\mathrm{T}}" : "{\\color{red}\\mathrm{F}}"
        )
      ];
      return rowValues.join("&") + "\\\\";
    });

    const latex = `$$\n\\begin{array}{${colFormat}}\n${headerRow} \\\\ \\hline\n${rows.join("\n")}\n\\end{array}\n$$`;

    navigator.clipboard.writeText(latex).then(() => {
      alert("LaTeX table copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy LaTeX", err);
      alert("Failed to copy LaTeX. Please tell Andrew.");
    });
  };

  const copyAsMarkdown = () => {
    const headers = [
      ...variables,
      "",
      ...statements
    ];

    const headerRow = `| ${headers.join(" | ")} |`;
    const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;

    const rows = truthTable.map(row => {
      const rowValues = [
        ...row.values.map(v => (v ? "T" : "F")),
        "||",
        ...row.results.map(r => (r ? "T" : "F"))
      ];
      return `| ${rowValues.join(" | ")} |`;
    });

    const markdown = [
      headerRow,
      separatorRow,
      ...rows
    ].join("\n");

    navigator.clipboard.writeText(markdown).then(() => {
      alert("Markdown table copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy Markdown", err);
      alert("Failed to copy Markdown. Please tell Andrew.");
    });
  };

  const copyAsPlainTable = () => {
    try {
      const plainHeaders = [...variables, ...(statements.length ? ["|"] : []), ...statements];
      const plainRows = truthTable.map(row => {
        const vars = row.values.map(v => (v ? "T" : "F"));
        const res = row.results.map(r => (r ? "T" : "F"));
        return [...vars, ...(statements.length ? ["|"] : []), ...res].join(" ");
      });
      const plainText = [plainHeaders.join(" "), ...plainRows].join("\n");

      navigator.clipboard.writeText(plainText).then(() => {
        alert("Plain-text table copied to clipboard!");
      });
    } catch (err) {
      console.error("copyAsPlainTable failed", err);
      alert("Failed to copy plain text. Please tell Andrew.");
    }
  };

  // Always copy rich HTML (only works if browser supports text/html in clipboard API)
  const copyAsRichHTML = () => {
    try {
      if (!(navigator.clipboard && navigator.clipboard.write && window.ClipboardItem)) {
        alert("Your browser does not support rich HTML copy.");
        return;
      }

      const headers = [...variables, ...(statements.length ? [""] : []), ...statements];

      const escapeHtml = (s) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

      const headerCells = headers.map(h => `<th>${escapeHtml(h)}</th>`).join("");

      const bodyRows = truthTable.map(row => {
        const varCells = row.values.map(v => `<td>${v ? "T" : "F"}</td>`).join("");
        const sepCell = statements.length ? `<td></td>` : "";
        const resultCells = row.results.map(r => `<td>${r ? "T" : "F"}</td>`).join("");
        return `<tr>${varCells}${sepCell}${resultCells}</tr>`;
      }).join("\n");

      const tableHtml = `
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>`;

      const blobHtml = new Blob([tableHtml], { type: "text/html" });
      const data = [new ClipboardItem({ "text/html": blobHtml })];

      navigator.clipboard.write(data).then(() => {
        alert("Rich HTML table copied to clipboard!");
      }).catch(err => {
        console.error("copyAsRichHTML failed", err);
        alert("Failed to copy HTML. Please tell Andrew.");
      });
    } catch (err) {
      console.error("copyAsRichHTML failed", err);
      alert("Failed to copy HTML. Please tell Andrew.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🔔 Alert box */}
      {showAlert && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 
            bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg
            transition-opacity duration-500 ease-in-out
            ${animate ? 'opacity-100' : 'opacity-0'}`}
        >
          {alertMessage}
        </div>
      )}
      <div className="max-w-7xl mx-auto p-6 bg-white font-sans">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Truth Table Generator
        </h1>

        <div className="flex flex-col gap-8 w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          {/* Variables and Statements side by side, same height */}
          <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
            {/* Variables Section */}
            <div className="w-full lg:w-1/2">
              <div className="bg-blue-100 p-4 rounded-md h-full flex flex-col">
                <VariablesSection 
                  variables={variables}
                  setVariables={setVariables}
                  error={error}
                  setError={setError}
                />
              </div>
            </div>

            {/* Statements Section */}
            <div className="w-full lg:w-1/2">
              <div className="bg-green-100 p-4 rounded-md h-full flex flex-col">
                <StatementsSection 
                  statements={statements}
                  setStatements={setStatements}
                />
              </div>
            </div>
          </div>

          {/* Truth Table Section */}
          <div className="w-full">
            <TruthTable 
              truthTable={truthTable}
              variables={variables}
              statements={statements}
              onDropdownSelect={({ menu, value }) => {
                console.log("Selected:", menu, value);
                if(menu === "download"){
                  switch(value){
                    case "csv":
                      exportToCSV();
                      break;
                    case "excel":
                      exportToExcel();
                      break;
                    case "pdf":
                      exportToPDF();
                      break;
                    default:
                      alert("Error. Please Contact Andrew")
                  }
                } else if (menu === "copy") {
                  switch(value){
                    case "latex":
                      copyAsLatex();
                      break;
                    case "markdown":
                      copyAsMarkdown();
                      break;
                    case "table":
                      copyAsRichHTML();
                      break;
                    case "html":
                      copyAsPlainTable();
                      break;
                    default:
                      alert("Error. Please Contact Andrew")
                  }
                } else {
                  alert("Error. Please Contact Andrew")
                }
              }}
            />
          </div>
          {/* Help Section */}
          <div className="w-full">
            <HelpSection />
          </div>
          {/* Issue Report Section */}
          <div className="w-full h-full flex flex-col items-center">
            {/* Report Issue Button */}
            <div className="w-full mt-8 text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-50 text-gray-800 px-4 py-2 rounded-md shadow-md hover:bg-gray-200"
              >
                Suggest a Feature/Report an Issue
              </button>
            </div>

            {/* Modal */}
            <IssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAlert={alert} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruthTableGenerator;