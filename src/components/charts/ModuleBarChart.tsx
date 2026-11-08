import { motion } from 'framer-motion';
import type { ModuleId } from '@/types';

interface ModuleBarChartProps {
  data: {
    id: ModuleId;
    name: string;
    icon: string;
    color: string;
    value: number; // 0-100
  }[];
}

export function ModuleBarChart({ data }: ModuleBarChartProps) {
  const barWidth = 36;
  const chartHeight = 120;
  const gap = 12;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={totalWidth + 40}
        height={chartHeight + 40}
        viewBox={`0 0 ${totalWidth + 40} ${chartHeight + 40}`}
        className="w-full max-w-sm"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = chartHeight - (tick / 100) * chartHeight + 10;
          return (
            <g key={tick}>
              <line
                x1={30}
                y1={y}
                x2={totalWidth + 35}
                y2={y}
                className="stroke-border"
                strokeWidth={0.5}
                strokeDasharray={tick === 0 ? 'none' : '3 3'}
              />
              <text
                x={26}
                y={y + 3}
                textAnchor="end"
                className="fill-fg-muted"
                fontSize={8}
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const x = 35 + i * (barWidth + gap);
          const barHeight = (item.value / 100) * chartHeight;
          const y = chartHeight - barHeight + 10;

          return (
            <g key={item.id}>
              {/* Bar background */}
              <rect
                x={x}
                y={10}
                width={barWidth}
                height={chartHeight}
                rx={6}
                className="fill-border/30"
              />
              {/* Bar value */}
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                initial={{ height: 0, y: chartHeight + 10 }}
                animate={{ height: barHeight, y }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                rx={6}
                fill={item.color}
                opacity={0.85}
              />
              {/* Value text */}
              <motion.text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="fill-fg font-bold"
                fontSize={9}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                {item.value}%
              </motion.text>
              {/* Module icon */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 28}
                textAnchor="middle"
                fontSize={16}
              >
                {item.icon}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
