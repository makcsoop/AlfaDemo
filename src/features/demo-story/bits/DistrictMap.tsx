import { motion } from 'framer-motion';
import { storyMap } from '@/mock/goldenAnalysis';

/**
 * Стилизованная карта спального района (не реальная геоподложка):
 * сетка улиц, парк, пруд. Похожие бизнесы «находятся» по очереди и пульсируют,
 * точка Анны загорается в центре последней.
 */
export function DistrictMap({ startDelay = 0 }: { startDelay?: number }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Карта района: похожие кофейни рядом с точкой Анны"
    >
      {/* Подложка */}
      <rect width="400" height="300" fill="#F6F7F9" />

      {/* Улицы */}
      {[75, 150, 225].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#E7E9EE" strokeWidth="10" />
      ))}
      {[100, 200, 300].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#E7E9EE" strokeWidth="10" />
      ))}
      <line x1="0" y1="40" x2="400" y2="40" stroke="#EDEFF3" strokeWidth="5" />
      <line x1="350" y1="0" x2="350" y2="300" stroke="#EDEFF3" strokeWidth="5" />

      {/* Парк и пруд */}
      <rect x="118" y="88" width="66" height="50" rx="12" fill="#E7F5EC" />
      <circle cx="352" cy="258" r="26" fill="#E3F1FA" />

      {/* Похожие бизнесы: появляются по очереди и пульсируют */}
      {storyMap.similar.map((p, i) => {
        const delay = startDelay + 0.5 + i * 0.4;
        return (
          <g key={p.id}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              fill="#EF3124"
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: [0, 9, 6.5], opacity: [0, 1, 0.85] }}
              transition={{ delay, duration: 0.55, ease: 'easeOut' }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              fill="none"
              stroke="#EF3124"
              strokeWidth="2"
              initial={{ r: 6, opacity: 0 }}
              animate={{ r: [6, 18], opacity: [0.5, 0] }}
              transition={{ delay: delay + 0.4, duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }}
            />
            <motion.text
              x={p.x}
              y={p.y + 22}
              textAnchor="middle"
              fontSize="11"
              fill="#6B7280"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.25 }}
            >
              {p.label}
            </motion.text>
          </g>
        );
      })}

      {/* Точка Анны — загорается последней, с широкой пульсацией */}
      <motion.circle
        cx={storyMap.anna.x}
        cy={storyMap.anna.y}
        fill="none"
        stroke="#EF3124"
        strokeWidth="2.5"
        initial={{ r: 8, opacity: 0 }}
        animate={{ r: [8, 30], opacity: [0.6, 0] }}
        transition={{ delay: startDelay + 2.6, duration: 2.2, repeat: Infinity, repeatDelay: 0.4 }}
      />
      <motion.circle
        cx={storyMap.anna.x}
        cy={storyMap.anna.y}
        fill="#EF3124"
        stroke="#FFFFFF"
        strokeWidth="3"
        initial={{ r: 0 }}
        animate={{ r: [0, 13, 10] }}
        transition={{ delay: startDelay + 2.3, duration: 0.6, ease: 'easeOut' }}
      />
      <motion.text
        x={storyMap.anna.x}
        y={storyMap.anna.y + 30}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="#12121A"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: startDelay + 2.6, duration: 0.4 }}
      >
        {storyMap.anna.label}
      </motion.text>
    </svg>
  );
}
