import React, { useCallback, useEffect, useRef, useState } from 'react';
import NavBar from '../NavBar';
import MathKeyboardHeader from './components/MathKeyboardHeader';
import MathInputSection from './components/MathInputSection';
import LatexOutputSection from './components/LatexOutputSection';
import LogicKeyboardSection from './components/LogicKeyboardSection';
import { LOGIC_KEYS } from './logicKeys';
import 'mathlive';
import 'mathlive/static.css';

const MathKeyboardPage = () => {
  const mathfieldRef = useRef(null);
  const [latex, setLatex] = useState('');

  const handleInput = useCallback(() => {
    if (!mathfieldRef.current) return;
    const value = mathfieldRef.current.getValue?.('latex') ?? '';
    setLatex(value);
  }, []);

  useEffect(() => {
    const mathfield = mathfieldRef.current;
    if (!mathfield) return;

    mathfield.virtualKeyboardMode = 'manual';
    mathfield.addEventListener('input', handleInput);
    handleInput();

    return () => {
      mathfield.removeEventListener('input', handleInput);
    };
  }, [handleInput]);

  const onKeyPress = useCallback((key) => {
    const mathfield = mathfieldRef.current;
    if (!mathfield) {
      return;
    }
    mathfield.focus();

    if (key.command === 'clear') {
      mathfield.setValue?.('');
      setLatex('');
      return;
    }

    if (key.command === 'deleteBackward') {
      mathfield.executeCommand?.('deleteBackward');
      return;
    }

    if (key.latex) {
      mathfield.insert?.(key.latex);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <MathKeyboardHeader />

        <div className="flex flex-col gap-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <MathInputSection mathfieldRef={mathfieldRef} />
            <LatexOutputSection latex={latex} />
          </div>

          <LogicKeyboardSection keys={LOGIC_KEYS} onKeyPress={onKeyPress} />
        </div>
      </main>
    </div>
  );
};

export default MathKeyboardPage;
