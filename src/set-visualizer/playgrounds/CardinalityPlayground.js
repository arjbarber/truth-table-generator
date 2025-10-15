import { useCallback, useMemo, useState } from 'react';
import Token from '../components/Token';
import { LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import { clamp, formatSet, isInsideCircle } from '../utils';

const CardinalityPlayground = () => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const initialTokens = useMemo(
    () => [
      { id: 'a', label: 'a', x: 74, y: 52 },
      { id: 'b', label: 'b', x: 62, y: 68 },
      { id: 'c', label: 'c', x: 80, y: 77 },
      { id: 'd', label: 'd', x: 92, y: 60 },
      { id: 'e', label: 'e', x: 110, y: 72 },
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

  const inside = tokens.filter((token) => isInsideCircle(token, { cx: 84, cy: 60, r: 32 }));

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />
        <circle cx="84" cy="60" r="34" fill="#3b82f6" opacity="0.12" />
        <circle cx="84" cy="60" r="34" fill="none" stroke="#0f172a" strokeWidth="2" />
        <text x="84" y="40" textAnchor="middle" fontSize="16" fontWeight="600" fill="#0f172a">
          A
        </text>
        <text x="120" y="68" fontSize="18" fontWeight="600" fill="#0f172a">{`|A| = ${inside.length}`}</text>
        {tokens.map((token) => (
          <Token key={token.id} token={token} onPointerDown={createHandler(token.id)} />
        ))}
      </svg>
      <div className="text-sm text-slate-600">
        Elements currently in A:{' '}
        <span className="font-semibold">{formatSet(inside.map((token) => token.label))}</span>
      </div>
      <button
        type="button"
        onClick={resetTokens}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Reset tokens
      </button>
    </div>
  );
};

export default CardinalityPlayground;
