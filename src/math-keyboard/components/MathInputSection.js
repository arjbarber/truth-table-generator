const MathInputSection = ({ mathfieldRef }) => (
  <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-blue-900 mb-3">Math Input</h2>
    <p className="text-sm text-blue-800/70 mb-4">
      Type directly with your keyboard or tap the buttons below to insert symbols.
    </p>
    <div className="rounded-lg border border-blue-200 bg-white p-4">
      <math-field
        ref={mathfieldRef}
        className="block w-full text-2xl leading-relaxed focus:outline-none [&_.ML__canvas]:min-h-[4rem]"
        smart-fence="true"
        virtual-keyboard-mode="manual"
      />
    </div>
  </section>
);

export default MathInputSection;
