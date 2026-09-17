'use client';

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SCALE_COLOR, categoryColor } from '@/lib/chartPalette';

const AXIS_TICK = { fontSize: 12, fill: '#6b7280' };

// Recharts hands a LabelList only the bar's value, so the percentage is looked up
// by index here — the count alone hides how big a share it really is.
function barLabel(data, layout) {
  function Label({ x, y, width, height, index }) {
    const row = data[index];
    if (!row || row.count === 0) return null;
    const horizontal = layout === 'horizontal';
    return (
      <text
        x={horizontal ? x + width + 6 : x + width / 2}
        y={horizontal ? y + height / 2 + 4 : y - 7}
        textAnchor={horizontal ? 'start' : 'middle'}
        fill="#4b5563"
        style={{ fontSize: 11, fontWeight: 600 }}
      >
        {row.count}
        <tspan fill="#9ca3af" style={{ fontWeight: 400 }}>{` (${row.percent}%)`}</tspan>
      </text>
    );
  }
  return <Label />;
}

function valueLabel(entry) {
  return `${entry.count}명 (${entry.percent}%)`;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-gray-700">{row.name ?? label}</p>
      <p className="text-gray-500">{valueLabel(row)}</p>
    </div>
  );
}

// 5점 척도 — 점수 축이 순서를 이미 나타내므로 세로 막대 하나의 색으로 그린다.
function ScaleChart({ q }) {
  return (
    <>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-brand-700">{q.average === null ? '—' : q.average.toFixed(1)}</span>
        <span className="text-xs text-gray-400">평균 (5점 만점)</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={q.chartData} margin={{ top: 28, right: 8, left: -20, bottom: 4 }}>
          <XAxis dataKey="name" tick={AXIS_TICK} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="count" fill={SCALE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48}>
            <LabelList dataKey="count" content={barLabel(q.chartData, 'vertical')} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {(q.lowLabel || q.highLabel) && (
        <div className="flex justify-between text-xs text-gray-400 px-2 -mt-1">
          <span>{q.lowLabel}</span>
          <span>{q.highLabel}</span>
        </div>
      )}
    </>
  );
}

// 단일 선택·드롭다운·체크박스 — 전체에서 차지하는 비중이 핵심이라 도넛 + 목록.
function CategoryChart({ q }) {
  const shown = q.chartData.filter((r) => r.count > 0);
  return (
    <>
      {shown.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">응답 없음</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={shown} dataKey="count" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {shown.map((row) => (
                <Cell key={row.name} fill={categoryColor(q.chartData.findIndex((r) => r.name === row.name))} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <ul className="mt-3 space-y-1">
        {q.chartData.map((row, i) => (
          <li key={row.name} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: categoryColor(i) }} />
            <span className="flex-1 min-w-0 truncate text-gray-700">{row.name}</span>
            <span className="text-gray-500 whitespace-nowrap">
              {row.count} <span className="text-gray-400">({row.percent}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

// 복수 선택·날짜·시간 — 항목이 많고 이름이 길어 가로 막대로 눕힌다.
function BarsChart({ q }) {
  if (q.chartData.length === 0) return <p className="text-gray-400 text-sm py-8 text-center">응답 없음</p>;
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, q.chartData.length * 46)}>
      <BarChart data={q.chartData} layout="vertical" margin={{ top: 4, right: 88, left: 4, bottom: 4 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={150} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={26}>
          {q.chartData.map((row, i) => (
            <Cell key={row.name} fill={categoryColor(i)} />
          ))}
          <LabelList dataKey="count" content={barLabel(q.chartData, 'horizontal')} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export { ScaleChart, CategoryChart, BarsChart };
