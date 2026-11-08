import { motion } from 'framer-motion';

interface SkillRadarProps {
  skills: {
    label: string;
    value: number; // 0-100
    color: string;
  }[];
}

export function SkillRadar({ skills }: SkillRadarProps) {
  const size = 220;
  const center = size / 2;
  const radius = 80;
  const levels = 4;

  const angleStep = (2 * Math.PI) / skills.length;

  // Calculate point position
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path
  const polygonPoints = skills
    .map((s, i) => {
      const p = getPoint(i, s.value);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
        {/* Grid circles */}
        {Array.from({ length: levels }, (_, i) => {
          const r = ((i + 1) / levels) * radius;
          const points = skills
            .map((_, si) => {
              const angle = angleStep * si - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');
          return (
            <polygon
              key={i}
              points={points}
              fill="none"
              className="stroke-border"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {skills.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              className="stroke-border"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={polygonPoints}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="#8B5CF6"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {skills.map((s, i) => {
          const p = getPoint(i, s.value);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {skills.map((s, i) => {
          const labelPoint = getPoint(i, 125);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-fg-muted"
              fontSize={9}
              fontWeight={600}
            >
              {s.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
