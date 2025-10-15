import { useCallback, useMemo, useState } from 'react';
import Token from '../components/Token';
import { A_CIRCLE, B_CIRCLE, LIMITS, PANEL } from '../constants';
import useSvgDrag from '../hooks/useSvgDrag';
import {
  clamp,
  formatSet,
  isInsideCircle,
  isInsidePanel,
} from '../utils';

const VennPlayground = ({ mode }) => {
  const { svgRef, createDragHandler } = useSvgDrag();
  const initialTokens = useMemo(
    () => [
      { id: 'p', label: 'p', x: 58, y: 48 },
      { id: 'q', label: 'q', x: 67, y: 74 },
      { id: 'r', label: 'r', x: 92, y: 60 },
      { id: 's', label: 's', x: 105, y: 50 },
      { id: 't', label: 't', x: 116, y: 76 },
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

  const info = tokens.map((token) => {
    const inA = isInsideCircle(token, A_CIRCLE);
    const inB = isInsideCircle(token, B_CIRCLE);
    let region = 'outside';
    if (inA && inB) region = 'both';
    else if (inA) region = 'onlyA';
    else if (inB) region = 'onlyB';
    return { ...token, inA, inB, region };
  });

  const aMembers = info.filter((token) => token.inA).map((token) => token.label);
  const bMembers = info.filter((token) => token.inB).map((token) => token.label);
  const union = info.filter((token) => token.inA || token.inB).map((token) => token.label);
  const intersection = info.filter((token) => token.inA && token.inB).map((token) => token.label);
  const onlyA = info.filter((token) => token.inA && !token.inB).map((token) => token.label);
  const onlyB = info.filter((token) => token.inB && !token.inA).map((token) => token.label);
  const complement = info.filter((token) => !token.inA && isInsidePanel(token)).map((token) => token.label);
  const symmetricDiff = info.filter((token) => token.inA !== token.inB).map((token) => token.label);

  let statusTitle = '';
  let statusDetail = '';

  switch (mode) {
    case 'subset': {
      const subsetHolds = onlyA.length === 0;
      statusTitle = `A ⊆ B: ${subsetHolds ? 'True' : 'False'}`;
      statusDetail = subsetHolds
        ? 'Every element of A also lies in B.'
        : `Elements ${formatSet(onlyA)} violate the subset condition.`;
      break;
    }
    case 'set-equality': {
      const equality = onlyA.length === 0 && onlyB.length === 0;
      statusTitle = `A = B: ${equality ? 'True' : 'False'}`;
      statusDetail = equality
        ? 'Both sets share exactly the same elements.'
        : `Mismatch: only in A → ${formatSet(onlyA)}, only in B → ${formatSet(onlyB)}.`;
      break;
    }
    case 'union': {
      statusTitle = `A ∪ B = ${formatSet(union)}`;
      statusDetail = 'Drag tokens into either circle to expand the union.';
      break;
    }
    case 'intersection': {
      statusTitle = `A ∩ B = ${formatSet(intersection)}`;
      statusDetail = 'Only elements inside the overlap remain in the intersection.';
      break;
    }
    case 'set-difference': {
      statusTitle = `A \\ B = ${formatSet(onlyA)}`;
      statusDetail = 'The difference keeps elements that belong to A but not to B.';
      break;
    }
    case 'complement': {
      statusTitle = `A̅ = ${formatSet(complement)}`;
      statusDetail = 'Complement collects everything in the universe that is outside of A.';
      break;
    }
    case 'symmetric-difference': {
      statusTitle = `A ⊕ B = ${formatSet(symmetricDiff)}`;
      statusDetail =
        'Elements that belong to exactly one of the sets remain in the symmetric difference.';
      break;
    }
    case 'disjoint-union': {
      const disjoint = intersection.length === 0;
      statusTitle = `A ⨄ B: ${disjoint ? 'Valid (disjoint)' : 'Invalid (overlap found)'}`;
      statusDetail = disjoint
        ? 'Disjoint union requires the intersection to be empty.'
        : `Intersection currently contains: ${formatSet(intersection)}.`;
      break;
    }
    default:
      break;
  }

  return (
    <div className="space-y-3">
      <svg ref={svgRef} viewBox="0 0 180 120" className="h-48 w-full select-none">
        <defs>
          <clipPath id={`${mode}-clipA`}>
            <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} />
          </clipPath>
          <clipPath id={`${mode}-clipB`}>
            <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} />
          </clipPath>
        </defs>
        <rect width="180" height="120" rx="22" fill="#e2e8f0" />
        <rect {...PANEL} rx="18" fill="#ffffff" />

        {mode === 'union' && (
          <>
            <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} fill="#3b82f6" opacity="0.18" />
            <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} fill="#3b82f6" opacity="0.18" />
          </>
        )}
        {mode === 'intersection' && (
          <g clipPath={`url(#${mode}-clipA)`}>
            <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} fill="#3b82f6" opacity="0.24" />
          </g>
        )}
        {mode === 'set-difference' && (
          <>
            <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} fill="#3b82f6" opacity="0.2" />
            <g clipPath={`url(#${mode}-clipB)`}>
              <rect {...PANEL} fill="#ffffff" />
            </g>
          </>
        )}
        {mode === 'symmetric-difference' && (
          <>
            <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} fill="#3b82f6" opacity="0.2" />
            <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} fill="#3b82f6" opacity="0.2" />
            <g clipPath={`url(#${mode}-clipA)`}>
              <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} fill="#ffffff" opacity="0.8" />
            </g>
          </>
        )}
        {mode === 'complement' && (
          <>
            <rect {...PANEL} fill="#3b82f6" opacity="0.12" />
            <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} fill="#ffffff" />
          </>
        )}

        <circle cx={A_CIRCLE.cx} cy={A_CIRCLE.cy} r={A_CIRCLE.r} fill="none" stroke="#0f172a" strokeWidth="2" />
        <circle cx={B_CIRCLE.cx} cy={B_CIRCLE.cy} r={B_CIRCLE.r} fill="none" stroke="#0f172a" strokeWidth="2" />
        <text x={A_CIRCLE.cx - 2} y={A_CIRCLE.cy + 6} textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a">
          A
        </text>
        <text x={B_CIRCLE.cx - 2} y={B_CIRCLE.cy + 6} textAnchor="middle" fontSize="18" fontWeight="600" fill="#0f172a">
          B
        </text>
        {info.map((token) => (
          <Token key={token.id} token={token} onPointerDown={dragHandler(token.id)} color="#2563eb" />
        ))}
      </svg>
      <div className="text-sm text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">{statusTitle}</p>
        <p>{statusDetail}</p>
        <p className="text-xs text-slate-500">{`A = ${formatSet(aMembers)} • B = ${formatSet(
          bMembers,
        )}`}</p>
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

export default VennPlayground;
