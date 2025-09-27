import React, { useState, useRef, useEffect } from "react";
import { convertToSymbols } from "../utils/autoCorrect";
import { Download, Copy, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

// Sortable Row Component
const SortableRow = ({ row, variables, statements, hiddenRows, hideRow, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (hiddenRows.includes(row.id)) {
    return null;
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="relative group odd:bg-white even:bg-gray-50"
    >
      {row.values.map((value, cellIndex) => (
        <td
          key={`val-${cellIndex}`}
          className={`relative border border-gray-300 px-3 py-2 text-center ${
            value ? "bg-green-50" : "bg-red-50"
          } ${cellIndex === variables.length - 1 ? "border-r-2 border-r-gray-500" : ""}`}
        >
          {/* Drag Handle */}
          {cellIndex === 0 && (
            <div
              {...attributes}
              {...listeners}
              className="absolute -left-6 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-gray-200/90 rounded p-1 cursor-grab active:cursor-grabbing transition-opacity duration-200 z-20"
              title="Drag to reorder row"
            >
              <GripVertical size={16} className="text-gray-600" />
            </div>
          )}
          
          <span
            className={`font-mono font-bold ${
              value ? "text-green-600" : "text-red-600"
            }`}
          >
            {value ? "T" : "F"}
          </span>

          {/* Hide Row Button */}
          {cellIndex === 0 && (
            <button
              onClick={() => hideRow(row.id)}
              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-gray-200/80 rounded-full p-1 text-gray-600 hover:text-red-600 transition"
              title="Hide Row"
            >
              <EyeOff size={14} />
            </button>
          )}
        </td>
      ))}
      {row.results
        .filter((result, cellIndex) => {
          const statement = statements[cellIndex];
          return statement && statement.trim();
        })
        .map((result, filteredIndex) => {
          const originalIndex = statements.findIndex((statement, idx) => {
            if (!statement || !statement.trim()) return false;
            const filteredStatements = statements.filter(s => s && s.trim());
            return filteredStatements[filteredIndex] === statement;
          });

          return (
            <td
              key={`res-${originalIndex}`}
              className={`border border-gray-300 px-3 py-2 text-center ${
                result === "Error"
                  ? "bg-amber-50"
                  : result
                  ? "bg-green-50"
                  : "bg-red-50"
              } ${filteredIndex === 0 ? "border-l-0" : ""}`}
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
        })}
    </tr>
  );
};

const TruthTable = ({ truthTable, variables, statements, onDropdownSelect, onTruthTableReorder }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [hiddenRows, setHiddenRows] = useState([]);
  const [rowLabels, setRowLabels] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [orderedTruthTable, setOrderedTruthTable] = useState(truthTable);
  const [hasBeenReordered, setHasBeenReordered] = useState(false);
  const menuRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync when props change
  useEffect(() => {
    setOrderedTruthTable(truthTable);
    setHasBeenReordered(false);
  }, [truthTable]);

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

  // Build row labels for unhide menu
  useEffect(() => {
    const labels = {};
    orderedTruthTable.forEach((row) => {
      labels[row.id] = row.values.map((v) => (v ? "T" : "F")).join(", ");
    });
    setRowLabels(labels);
  }, [orderedTruthTable]);

  if (truthTable.length === 0) return null;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = orderedTruthTable.findIndex((item) => item.id === active.id);
      const newIndex = orderedTruthTable.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(orderedTruthTable, oldIndex, newIndex);
      setOrderedTruthTable(newOrder);
      
      const isBackToOriginal = newOrder.every((row, index) => row.id === truthTable[index].id);
      setHasBeenReordered(!isBackToOriginal);
      
      if (onTruthTableReorder) {
        onTruthTableReorder(newOrder);
      }
    }
  };

  const handleOptionClick = (menu, value) => {
    setOpenMenu(null);
    if (onDropdownSelect) {
      onDropdownSelect({ menu, value });
    }
  };

  const hideRow = (rowId) => setHiddenRows((prev) => [...prev, rowId]);
  const unhideRow = (rowId) => setHiddenRows((prev) => prev.filter((id) => id !== rowId));
  const unhideAllRows = () => setHiddenRows([]);
  const resetOrder = () => {
    setOrderedTruthTable(truthTable);
    setHasBeenReordered(false);
    if (onTruthTableReorder) onTruthTableReorder(truthTable);
  };

  const visibleRows = orderedTruthTable.filter((row) => !hiddenRows.includes(row.id));

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      {/* Header with dropdown menus */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Truth Table</h2>

        <div className="flex space-x-2" ref={menuRef}>
          {/* Unhide menu */}
          {hiddenRows.length > 0 && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === "unhide" ? null : "unhide")
                }
                className="flex gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <EyeOff size={20}/>
                Unhide ▾
              </button>

              {openMenu === "unhide" && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2">
                  <input
                    type="text"
                    placeholder="Search hidden rows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full mb-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />

                  <div className="max-h-48 overflow-y-auto text-sm">
                    {hiddenRows
                      .filter((rowId) =>
                        rowLabels[rowId]
                          ?.toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((rowId) => (
                        <button
                          key={rowId}
                          onClick={() => unhideRow(rowId)}
                          className="block w-full text-left px-3 py-1 rounded hover:bg-gray-100"
                        >
                          {rowLabels[rowId]}
                        </button>
                      ))}

                    {hiddenRows.length === 0 && (
                      <div className="text-gray-400 text-sm px-3 py-2">
                        No hidden rows
                      </div>
                    )}
                  </div>

                  {hiddenRows.length > 0 && (
                    <button
                      onClick={unhideAllRows}
                      className="mt-2 w-full bg-gray-100 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-200"
                    >
                      Unhide All Rows
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Copy menu */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "copy" ? null : "copy")}
              className="flex gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Copy size={20}/> Copy ▾
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
                  onClick={() => handleOptionClick("copy", "table")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy as table (for docs/Word)
                </button>
                <button
                  onClick={() => handleOptionClick("copy", "html")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Copy as html
                </button>
              </div>
            )}
          </div>

          {/* Reset Order */}
          {hasBeenReordered && (
            <button
              onClick={resetOrder}
              className="flex gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              title="Reset to original order"
            >
              <RotateCcw size={20}/> Reset Order
            </button>
          )}

          {/* Download menu */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "download" ? null : "download")
              }
              className="flex gap-1 border border-gray-300 rounded-md px-3 py-1 text-sm bg-white shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <Download size={20}/> Download ▾
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

      {/* Table with drag and drop */}
      <div className="overflow-x-auto relative max-h-[500px] overflow-y-auto" id='truth-table'>
        <div className="pl-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <table className="w-full border-collapse text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-200 font-semibold">
                  {variables.map((variable, index) => {
                    const isLastVar = index === variables.length - 1;
                    return (
                      <th
                        key={`var-${index}`}
                        className={`border border-gray-300 px-3 py-2 text-center ${
                          isLastVar ? "border-r-2 border-r-gray-500" : ""
                        }`}
                      >
                        {variable}
                      </th>
                    );
                  })}
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
                          className={`border border-gray-300 px-3 py-2 text-center bg-amber-100 text-base font-serif ${
                            index === statements.findIndex((s) => s && s.trim())
                              ? "border-l-0"
                              : ""
                          }`}
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
                <SortableContext items={visibleRows} strategy={verticalListSortingStrategy}>
                  {visibleRows.map((row, index) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      variables={variables}
                      statements={statements}
                      hiddenRows={hiddenRows}
                      hideRow={hideRow}
                      index={index}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 grid grid-cols-2 gap-4">
        <div>
          <span className="font-semibold">Variables:</span>{" "}
          {variables.join(", ")}
        </div>
        <div>
          <span className="font-semibold">Rows:</span> {orderedTruthTable.length}
        </div>
      </div>
    </div>
  );
};

export default TruthTable;