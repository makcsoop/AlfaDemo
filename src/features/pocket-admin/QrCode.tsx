import { useMemo } from 'react';
import { qrMatrix } from '@/lib/pocketAdmin';

/** Визуальный QR-мок: рисует матрицу qrMatrix() как SVG. Не сканируется — для демо. */
export function QrCode({ text, size = 160 }: { text: string; size?: number }) {
  const matrix = useMemo(() => qrMatrix(text), [text]);
  const n = matrix.length;
  const quiet = 2; // тихая зона в модулях
  const total = n + quiet * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${total} ${total}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR-код для оплaты"
      className="rounded-lg bg-white"
    >
      <rect width={total} height={total} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c + quiet} y={r + quiet} width={1} height={1} fill="#11181C" /> : null,
        ),
      )}
    </svg>
  );
}
