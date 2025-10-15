import { useCallback, useMemo, useState } from 'react';
import NavBar from '../NavBar';
import OperationPlayground from './components/OperationPlayground';
import { OPERATIONS } from './operations';

const SetVisualizerPage = () => {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(OPERATIONS.map((op) => op.category)));
    return ['all', ...unique];
  }, []);

  const [activeCategory, setActiveCategory] = useState('all');
  const [expanded, setExpanded] = useState(() => new Set());

  const filteredOperations = useMemo(() => {
    if (activeCategory === 'all') return OPERATIONS;
    return OPERATIONS.filter((op) => op.category === activeCategory);
  }, [activeCategory]);

  const toggleExpanded = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-white text-slate-900">
        <section className="mx-auto max-w-7xl space-y-10 px-6 py-16">
          <header className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Set Visualizer
            </h1>
            <p className="max-w-3xl text-base text-slate-600 md:text-lg">
              Drag the elements around each diagram to manipulate the sets directly. The labels
              update in real time so you can see how membership, set relationships, and counting
              principles shift as you experiment.
            </p>
          </header>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {category === 'all' ? 'All Topics' : category}
              </button>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {filteredOperations.map((operation) => {
              const isExpanded = expanded.has(operation.id);
              return (
                <article
                  key={operation.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-xl"
                >
                  <OperationPlayground operation={operation} />
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">{operation.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {operation.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {operation.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpanded(operation.id)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Hide example' : 'Show example'}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
                      <p className="font-semibold text-blue-700">Example</p>
                      <p className="mt-1 leading-relaxed">{operation.example}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
};

export default SetVisualizerPage;
