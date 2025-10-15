import { useCallback, useMemo, useState } from 'react';
import Token from '../components/Token';
import { LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import { clamp, isInsideCircle } from '../utils';

const MembershipPlayground = () => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const initialTokens = useMemo(
    () => [
      { id: 'x', label: 'x', x: 88, y: 50 },
      { id: 'y', label: 'y', x: 132, y: 82 },
    ],
    [],
  );
  const [tokens, setTokens] = useState(() => initialTokens.map((token) => ({ ...token })));

  const resetTokens = useCallback(() => {
    setTokens(initialTokens.map((token) => ({ ...token })));
  }, [initialTokens]);

  const createHandler = useCallback(
    (id) =>
      createDragHandler(({ x, y }) => {
        setTokens((prev) =>
          prev.map((token) =>
            token.id === id
              ? {
                  ...token,
                  x: clamp(x, LIMITS.xMin, LIMITS.xMax),
                  y: clamp(y, LIMITS.yMin, LIMITS.yMax),
                }
              : token,
          ),
        );
      }),
    [createDragHandler],
  );

  const statuses = tokens.map((token) => {
    const inside = isInsideCircle(token, { cx: 90, cy: 60, r: 34 });
    return { ...token, inside };
  });

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />
        <circle cx="90" cy="60" r="36" fill="#3b82f6" opacity="0.12" />
        <circle cx="90" cy="60" r="36" fill="none" stroke="#0f172a" strokeWidth="2" />
        <text x="90" y="62" textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a">
          A
        </text>
        {statuses.map((token) => (
          <Token key={token.id} token={token} onPointerDown={createHandler(token.id)} />
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 text-sm text-slate-600">
        {statuses.map((status) => (
          <span
            key={status.id}
            className={`rounded-full px-3 py-1 font-medium ${
              status.inside ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {`${status.label} ∈ A: ${status.inside ? 'True' : 'False'}`}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={resetTokens}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Reset dots
      </button>
    </div>
  );
};

export default MembershipPlayground;
