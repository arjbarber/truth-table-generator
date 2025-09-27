import React from 'react';
import { RESERVED_WORDS, MAX_VARIABLES, MAX_VARIABLE_NAME_LENGTH } from '../constants';
import { Variable, Trash2, GripVertical } from 'lucide-react';
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
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

const SortableItem = ({ id, value, index, updateVariable, removeVariable, variablesLength, inputRef, onKeyDown }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? 'rgba(147,197,253,0.5)' : 'transparent', // highlight while dragging
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 mb-3 p-1 rounded"
    >
      {/* Attach drag listeners only to the handle */}
      <GripVertical {...listeners} {...attributes} className="cursor-grab" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => updateVariable(index, e.target.value)}
        onKeyDown={(e) => onKeyDown && onKeyDown(e, index)}
        ref={inputRef}
        className="w-[120px] px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
        maxLength={MAX_VARIABLE_NAME_LENGTH}
        placeholder="variable1"
      />
      
      <button
        onClick={() => removeVariable(index)}
        disabled={variablesLength <= 1}
        className="p-2 bg-transparent text-gray-400 border-0 rounded-md cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 />
      </button>
    </div>
  );
};

const VariablesSection = ({ variables, setVariables, error, setError }) => {
  const addVariable = () => {
    let nextLetter = "";
    if (97 + variables.length >= 102) {
      nextLetter = String.fromCharCode(97 + variables.length + 1);
    } else {
      nextLetter = String.fromCharCode(97 + variables.length);
    }
    if (variables.length < MAX_VARIABLES) {
      setVariables([...variables, nextLetter]);
    }
  };

  // Refs for each input so we can focus the newly added input when pressing Enter
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    // Ensure the refs array matches variables length
    inputRefs.current = inputRefs.current.slice(0, variables.length);
  }, [variables.length]);

  const focusNewInput = (index) => {
    const ref = inputRefs.current[index];
    if (ref && ref.focus) ref.focus();
  };

  const handleInputKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      if (variables.length < MAX_VARIABLES) {
        let nextLetter = "";
        if (97 + variables.length >= 102) {
          nextLetter = String.fromCharCode(97 + variables.length + 1);
        } else {
          nextLetter = String.fromCharCode(97 + variables.length);
        }
        const newVars = [...variables, nextLetter];
        setVariables(newVars);

        setTimeout(() => {
          focusNewInput(newVars.length - 1);
        }, 50);
      }
    }
  };

  const removeVariable = (index) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };

  const updateVariable = (index, value) => {
    const newVars = [...variables];
    let cleanValue = value.replace(/[^A-Za-z0-9_]/g, '');
    if (cleanValue && !/^[A-Za-z]/.test(cleanValue)) {
      cleanValue = cleanValue.replace(/^[^A-Za-z]*/, '');
    }
    cleanValue = cleanValue.slice(0, MAX_VARIABLE_NAME_LENGTH);

    if (cleanValue && RESERVED_WORDS.has(cleanValue.toLowerCase())) {
      setError(`"${cleanValue}" is a reserved word and cannot be used as a variable name.`);
      return;
    }

    if (cleanValue && newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())) {
      setError(`Variable "${cleanValue}" already exists.`);
      return;
    }

    if (error && !RESERVED_WORDS.has(cleanValue.toLowerCase()) && 
        !newVars.some((v, i) => i !== index && v.toLowerCase() === cleanValue.toLowerCase())) {
      setError('');
    }

    newVars[index] = cleanValue;
    setVariables(newVars);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = variables.findIndex((v, i) => `var-${i}` === active.id);
      const newIndex = variables.findIndex((v, i) => `var-${i}` === over.id);
      setVariables(arrayMove(variables, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg mb-6">
      <h2 className="flex gap-2 text-xl font-semibold mb-4 text-gray-700">
        Boolean Variables <Variable size={30}/>
      </h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]} // ✅ restrict movement
      >
        <SortableContext items={variables.map((_, i) => `var-${i}`)} strategy={verticalListSortingStrategy}>
          {variables.map((variable, index) => (
            <SortableItem
              key={index}
              id={`var-${index}`}
              value={variable}
              index={index}
              updateVariable={updateVariable}
              removeVariable={removeVariable}
              variablesLength={variables.length}
              inputRef={el => inputRefs.current[index] = el}
              onKeyDown={handleInputKeyDown}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={addVariable}
        disabled={variables.length >= MAX_VARIABLES}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-0 rounded-md text-sm cursor-pointer font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Add Variable
      </button>
    </div>
  );
};

export default VariablesSection;