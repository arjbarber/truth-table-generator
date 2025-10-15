const Token = ({ token, onPointerDown, color = '#1d4ed8' }) => (
  <g className="cursor-grab select-none" style={{ touchAction: 'none' }}>
    <circle
      cx={token.x}
      cy={token.y}
      r="6.5"
      fill={color}
      opacity="0.9"
      stroke="#0f172a"
      strokeWidth="1"
      onPointerDown={onPointerDown}
    />
    <text
      x={token.x}
      y={token.y + 2}
      textAnchor="middle"
      fontFamily="sans-serif"
      fontSize="10"
      fill="#f8fafc"
      pointerEvents="none"
    >
      {token.label}
    </text>
  </g>
);

export default Token;
