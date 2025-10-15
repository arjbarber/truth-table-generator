import { useCallback, useMemo, useState } from 'react';
import Token from '../components/Token';
import { LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import { clamp, formatSet, isInsideRect } from '../utils';

const CartesianPlayground = () => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const rectA = { x: 26, y: 24, width: 56, height: 72 };
  const rectB = { x: 98, y: 24, width: 56, height: 72 };

  const initialTokens = useMemo(
    () => [
      { id: 'a1', label: 'a1', x: 44, y: 40, set: 'A' },
      { id: 'a2', label: 'a2', x: 66, y: 66, set: 'A' },
      { id: 'a3', label: 'a3', x: 52, y: 84, set: 'A' },
      { id: 'b1', label: 'b1', x: 116, y: 40, set: 'B' },
      { id: 'b2', label: 'b2', x: 136, y: 64, set: 'B' },
      { id: 'b3', label: 'b3', x: 120, y: 82, set: 'B' },
    ],
    [],
  );

  const [tokens, setTokens] = useState(() => initialTokens.map((token) => ({ ...token })));

  const resetTokens = useCallback(() => {
    setTokens(initialTokens.map((token) => ({ ...token })));
  }, [initialTokens]);

  const dragHandler = useCallback(
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

  const membersA = tokens
    .filter((token) => token.set === 'A' && isInsideRect(token, rectA))
    .map((token) => token.label);
  const membersB = tokens
    .filter((token) => token.set === 'B' && isInsideRect(token, rectB))
    .map((token) => token.label);

  const product = [];
  membersA.forEach((aLabel) => {
    membersB.forEach((bLabel) => {
      product.push(`(${aLabel}, ${bLabel})`);
    });
  });

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />
        <rect {...rectA} rx="14" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" />
        <rect {...rectB} rx="14" fill="#dcfce7" stroke="#15803d" strokeWidth="2" />
        <text
          x={rectA.x + rectA.width / 2}
          y={rectA.y - 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#1d4ed8"
        >
          Set A
        </text>
        <text
          x={rectB.x + rectB.width / 2}
          y={rectB.y - 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#15803d"
        >
          Set B
        </text>
        {tokens.map((token) => (
          <Token
            key={token.id}
            token={token}
            onPointerDown={dragHandler(token.id)}
            color={token.set === 'A' ? '#2563eb' : '#16a34a'}
          />
        ))}
      </svg>
      <div className="text-sm text-slate-600 space-y-1">
        <p>
          <span className="font-semibold text-blue-700">A</span> = {formatSet(membersA)}
        </p>
        <p>
          <span className="font-semibold text-emerald-700">B</span> = {formatSet(membersB)}
        </p>
        <p className="font-semibold text-slate-800">{`A × B = ${
          product.length ? `{ ${product.join(', ')} }` : '∅'
        }`}</p>
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

export default CartesianPlayground;
