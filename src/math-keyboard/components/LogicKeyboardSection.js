const LogicKeyboardSection = ({ keys, onKeyPress }) => (
  <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-gray-800">Logic Keyboard</h2>
    </div>
    <div className="space-y-3">
      {keys.map((row, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex flex-wrap gap-3">
          {row.map((key) => (
            <button
              key={`${rowIdx}-${key.label}`}
              type="button"
              onClick={() => onKeyPress(key)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-lg font-semibold text-gray-800 shadow-sm transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {key.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  </section>
);

export default LogicKeyboardSection;
