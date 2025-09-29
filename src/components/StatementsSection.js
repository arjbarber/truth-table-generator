import React from 'react';
import { autoCorrectLogicalExpression } from '../utils/autoCorrect';
import { ClipboardPen, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'; // ✅ added

const SortableStatement = ({ id, value, index, updateStatement, removeStatement, statementsLength, inputRef, onKeyDown }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? 'rgba(110,231,183,0.3)' : 'transparent', // highlight while dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-3 p-1 rounded"
    >
      {/* Drag handle only */}
      <GripVertical {...listeners} {...attributes} className="cursor-grab" />

      <input
        type="text"
        value={value}
        onChange={(e) => updateStatement(index, e.target.value)}
        onKeyDown={(e) => onKeyDown ? onKeyDown(e, index) : undefined}
        ref={inputRef}
        placeholder="Type: var1 and var2, p --> q, not myVar, etc..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm outline-none font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500/10"
      />

      <button
        onClick={() => removeStatement(index)}
        disabled={statementsLength <= 1}
        className="p-2 bg-transparent text-gray-400 border-0 rounded-md cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 />
      </button>
    </div>
  );
};

const StatementsSection = ({ statements, setStatements }) => {
  const addStatement = () => {
    setStatements([...statements, '']);
  };

  // Refs for each statement input
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, statements.length);
  }, [statements.length]);

  const focusNewStatement = (index) => {
    const ref = inputRefs.current[index];
    if (ref && ref.focus) ref.focus();
  };

  const handleInputKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Add a new statement and focus it
      setStatements(prev => {
        const next = [...prev, ''];
        setTimeout(() => focusNewStatement(next.length - 1), 50);
        return next;
      });
    }
  };

  const removeStatement = (index) => {
    if (statements.length > 1) {
      setStatements(statements.filter((_, i) => i !== index));
    }
  };

  const updateStatement = (index, value) => {
    const newStatements = [...statements];
    const currentStatement = statements[index];

    // Only apply auto-correction if typing (not deleting)
    if (value.length > currentStatement.length) {
      newStatements[index] = autoCorrectLogicalExpression(value);
    } else {
      newStatements[index] = value;
    }

    setStatements(newStatements);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statements.findIndex((_, i) => `stmt-${i}` === active.id);
    const newIndex = statements.findIndex((_, i) => `stmt-${i}` === over.id);

    setStatements(arrayMove(statements, oldIndex, newIndex));
  };

  return (
    <div className="bg-green-100 p-6 rounded-lg mb-6">
      <h2 className="flex gap-2 text-xl font-semibold mb-4 text-gray-700">
        Logical Statements <ClipboardPen size={30} />
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]} // ✅ restrict movement
      >
        <SortableContext items={statements.map((_, i) => `stmt-${i}`)} strategy={verticalListSortingStrategy}>
          {statements.map((statement, index) => (
            <SortableStatement
              key={index}
              id={`stmt-${index}`}
              value={statement}
              index={index}
              updateStatement={updateStatement}
              removeStatement={removeStatement}
              statementsLength={statements.length}
              inputRef={el => inputRefs.current[index] = el}
              onKeyDown={handleInputKeyDown}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={addStatement}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white border-0 rounded-md text-sm cursor-pointer font-medium hover:bg-green-700"
      >
        + Add Statement
      </button>
    </div>
  );
};

export default StatementsSection;