import { useCallback, useMemo, useState } from 'react';
import Token from '../components/Token';
import { LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import { clamp, isInsideRect } from '../utils';

const PowerSetPlayground = () => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const rectA = { x: 40, y: 28, width: 58, height: 68 };

  const initialTokens = useMemo(
    () => [
      { id: 'a', label: 'a', x: 52, y: 44 },
      { id: 'b', label: 'b', x: 68, y: 62 },
      { id: 'c', label: 'c', x: 84, y: 52 },
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

  const members = tokens.filter((token) => isInsideRect(token, rectA)).map((token) => token.label);
  const n = members.length;
  const powerSize = 2 ** n;

  const subsets = useMemo(() => {
    const result = [[]];
    members.forEach((label) => {
      const newSubsets = result.map((subset) => subset.concat(label));
      result.push(...newSubsets);
    });
    return result;
  }, [members]);

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />
        <rect {...rectA} rx="16" fill="#eef2ff" stroke="#4338ca" strokeWidth="2" />
        <text
          x={rectA.x + rectA.width / 2}
          y={rectA.y - 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#4338ca"
        >
          Set A
        </text>
        {tokens.map((token) => (
          <Token key={token.id} token={token} onPointerDown={dragHandler(token.id)} color="#4f46e5" />
        ))}
      </svg>
      <div className="text-sm text-slate-600 space-y-1">
        <p>{`|A| = ${n}`}</p>
        <p className="font-semibold text-slate-800">{`|𝒫(A)| = 2^${n} = ${powerSize}`}</p>
        <p className="text-xs text-slate-500">
          𝒫(A) = {'{ '}
          {subsets.map((subset, idx) => (
            <span key={idx}>
              {subset.length ? `{${subset.join(', ')}}` : '∅'}
              {idx === subsets.length - 1 ? '' : ', '}
            </span>
          ))}
          {' }'}
        </p>
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

export default PowerSetPlayground;
