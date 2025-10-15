import CopyDropdown from './CopyDropdown';

const LatexOutputSection = ({ latex = '' }) => {
  const displayLatex = latex.length > 0 ? latex : '\\text{(start typing to see LaTeX)}';

  return (
    <section className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-green-900 mb-3">LaTeX Output</h2>
          <p className="text-sm text-green-800/70">
            Copy the generated LaTeX to reuse your expression elsewhere.
          </p>
        </div>
        <CopyDropdown latex={latex} />
      </div>
      <div className="rounded-lg border border-green-200 bg-white p-4 font-mono text-sm text-gray-800 overflow-x-auto">
        {displayLatex}
      </div>
    </section>
  );
};

export default LatexOutputSection;
