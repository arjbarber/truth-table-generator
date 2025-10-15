import React, { useCallback, useEffect, useRef, useState } from 'react';
import NavBar from '../NavBar';
import MathKeyboardHeader from './components/MathKeyboardHeader';
import MathInputSection from './components/MathInputSection';
import LatexOutputSection from './components/LatexOutputSection';
import LogicKeyboardSection from './components/LogicKeyboardSection';
import IssueModal from '../components/IssueModal';
import { LOGIC_KEYS } from './logicKeys';
import { Lightbulb } from "lucide-react";
import 'mathlive';
import 'mathlive/static.css';

const MathKeyboardPage = () => {
  const mathfieldRef = useRef(null);
  const [latex, setLatex] = useState('');
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
      {/* Alert box */}
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
      <main className="max-w-7xl mx-auto px-6 py-10">
        <MathKeyboardHeader />

        <div className="flex flex-col gap-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <MathInputSection mathfieldRef={mathfieldRef} />
            <LatexOutputSection latex={latex} />
          </div>

          <LogicKeyboardSection keys={LOGIC_KEYS} onKeyPress={onKeyPress} />

          {/* Issue Report Section */}
          <div className="w-full h-full flex flex-col items-center">
            <div className="w-full border-t border-gray-200 text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                <Lightbulb size={18} />
                Suggest a Feature/Report an Issue
              </button>
            </div>

            {/* Modal */}
            <IssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAlert={alert} pageName="Math Keyboard" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MathKeyboardPage;
