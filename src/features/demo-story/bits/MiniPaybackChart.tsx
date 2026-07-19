import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import type { StoryScenario } from '@/mock/goldenAnalysis';
import { storyCredit } from '@/mock/goldenAnalysis';
import { useAfter } from './useAfter';

export interface MiniPaybackChartProps {
  scenario: StoryScenario;
  /** Задержка начала отрисовки линии, мс от монтирования. */
  begin?: number;
}

/**
 * Мини-график сценария: накопленная прибыль рисуется линией слева направо,
 * пунктир — сумма кредита (450 000 ₽). В точке, где линия пересекает кредит,
 * загорается зелёная точка окупаемости.
 */
export function MiniPaybackChart({ scenario, begin = 0 }: MiniPaybackChartProps) {
  const drawMs = 1700;
  // Точка окупаемости появляется, когда линия «дорисовалась» до неё.
  const dotAt = begin + Math.round((drawMs * scenario.paybackMonth) / scenario.points.length) + 250;
  const showDot = useAfter(dotAt);

  const payback = scenario.points[scenario.paybackMonth - 1];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={scenario.points} margin={{ top: 8, right: 10, bottom: 2, left: 10 }}>
        <XAxis dataKey="month" hide />
        <YAxis hide domain={[0, 'dataMax']} />
        <ReferenceLine
          y={storyCredit.safe}
          stroke="#9AA0AA"
          strokeDasharray="5 5"
          strokeWidth={1.5}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke={scenario.color}
          strokeWidth={3}
          dot={false}
          isAnimationActive
          animationBegin={begin}
          animationDuration={drawMs}
          animationEasing="ease-out"
        />
        {showDot && payback && (
          <ReferenceDot
            x={payback.month}
            y={payback.cumulative}
            r={6}
            fill="#12A150"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            isFront
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
