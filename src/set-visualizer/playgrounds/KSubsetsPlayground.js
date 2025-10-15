import { useCallback, useEffect, useMemo, useState } from 'react';
import Token from '../components/Token';
import { LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import { clamp, combination, isInsideRect } from '../utils';

const KSubsetsPlayground = () => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const rectA = { x: 38, y: 32, width: 62, height: 62 };
  const trackStart = 112;
  const trackEnd = 160;
  const trackY = 96;

  const initialTokens = useMemo(
    () => [
      { id: 'a', label: 'a', x: 56, y: 44 },
      { id: 'b', label: 'b', x: 72, y: 56 },
      { id: 'c', label: 'c', x: 80, y: 70 },
      { id: 'd', label: 'd', x: 60, y: 72 },
    ],
    [],
  );

  const [tokens, setTokens] = useState(() => initialTokens.map((token) => ({ ...token })));
  const [k, setK] = useState(2);

  const resetState = useCallback(() => {
    setTokens(initialTokens.map((token) => ({ ...token })));
    setK(2);
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

  useEffect(() => {
    setK((prev) => Math.min(prev, n));
  }, [n]);

  const handleDrag = useMemo(
    () =>
      createDragHandler(({ x }) => {
        if (n === 0) {
          setK(0);
          return;
        }
        const clampedX = clamp(x, trackStart, trackEnd);
        const ratio = (clampedX - trackStart) / (trackEnd - trackStart);
        const nextK = Math.round(ratio * n);
        setK(nextK);
      }),
    [createDragHandler, n, trackStart, trackEnd],
  );

  const handleX = n === 0 ? trackStart : trackStart + (k / n) * (trackEnd - trackStart);
  const value = combination(n, k);

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />
        <rect {...rectA} rx="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
        <text
          x={rectA.x + rectA.width / 2}
          y={rectA.y - 6}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#b45309"
        >
          Set A
        </text>
        {tokens.map((token) => (
          <Token key={token.id} token={token} onPointerDown={dragHandler(token.id)} color="#f59e0b" />
        ))}

        <line
          x1={trackStart}
          y1={trackY}
          x2={trackEnd}
          y2={trackY}
          stroke="#94a3b8"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text x={trackStart - 8} y={trackY + 4} textAnchor="end" fontSize="10" fill="#475569">
          0
        </text>
        <text x={trackEnd + 8} y={trackY + 4} fontSize="10" fill="#475569">
          n
        </text>
        <circle
          cx={n === 0 ? trackStart : handleX}
          cy={trackY}
          r="8"
          fill="#f59e0b"
          stroke="#b45309"
          strokeWidth="2"
          className="cursor-grab"
          style={{ touchAction: 'none' }}
          onPointerDown={handleDrag}
        />
        <text
          x={n === 0 ? trackStart : handleX}
          y={trackY - 14}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#b45309"
        >
          k = {k}
        </text>
      </svg>
      <div className="text-sm text-slate-600 space-y-1">
        <p>{`|A| = ${n}`}</p>
        <p className="font-semibold text-slate-800">{`Number of k-subsets = C(${n}, ${k}) = ${value}`}</p>
        <p className="text-xs text-slate-500">
          Drag the slider handle to adjust k. Move tokens in or out of A to change |A|.
        </p>
      </div>
      <button
        type="button"
        onClick={resetState}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Reset
      </button>
    </div>
  );
};

export default KSubsetsPlayground;
