import { useCallback, useEffect, useRef, useState } from 'react';

const COPY_OPTIONS = [
  {
    label: 'Copy Plain Latex',
    format: (value) => value,
  },
  {
    label: 'Copy for Perusall/Canvas',
    format: (value) => `\\(${value}\\)`,
  },
  {
    label: 'Copy for Gradescope/Campuswire',
    format: (value) => `$$${value}$$`,
  },
];

const CopyDropdown = ({ latex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const containerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const isOpenRef = useRef(false);
  const hasLatex = latex.trim().length > 0;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearFeedbackTimer = useCallback(() => {
    if (!feedbackTimerRef.current) {
      return;
    }
    clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = null;
  }, []);

  const showFeedback = useCallback((message) => {
    clearFeedbackTimer();
    setFeedback(message);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
      feedbackTimerRef.current = null;
    }, 2000);
  }, [clearFeedbackTimer]);

  const handleCopy = useCallback(async (formatter) => {
    if (!hasLatex) {
      showFeedback('Add an expression first');
      closeDropdown();
      return;
    }

    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard || typeof clipboard.writeText !== 'function') {
      showFeedback('Clipboard unavailable');
      closeDropdown();
      return;
    }

    try {
      const textToCopy = formatter(latex);
      await clipboard.writeText(textToCopy);
      showFeedback('Copied!');
    } catch (error) {
      showFeedback('Copy failed');
    }

    closeDropdown();
  }, [closeDropdown, hasLatex, latex, showFeedback]);

  const handleToggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearFeedbackTimer();
    };
  }, [clearFeedbackTimer]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpenRef.current) {
      return;
    }
    closeDropdown();
  }, [latex, closeDropdown]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-1 rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-900 shadow-sm transition hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Copy
        <span className="text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {COPY_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleCopy(option.format)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 focus:bg-green-100 focus:outline-none"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {feedback && (
        <p className="mt-2 text-xs font-medium text-green-700">
          {feedback}
        </p>
      )}
    </div>
  );
};

export default CopyDropdown;
