import React, { useState, useMemo } from 'react';
import { ViolationRecord, ParentSummons, Student, ViolationCategory } from '../types';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Clock, 
  FileText, 
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface AnalyticsChartsProps {
  violations: ViolationRecord[];
  summons: ParentSummons[];
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onNavigateToSummons: () => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  violations,
  summons,
  students,
  onSelectStudent,
  onNavigateToSummons,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | '3months' | 'thisMonth'>('all');
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);

  // Filter violations based on timeframe
  const filteredViolations = useMemo(() => {
    if (selectedTimeframe === 'thisMonth') {
      return violations.filter(v => v.date.startsWith('2026-11'));
    }
    if (selectedTimeframe === '3months') {
      return violations.filter(v => v.date >= '2026-09-01');
    }
    return violations;
  }, [violations, selectedTimeframe]);

  // Key metrics
  const totalViolations = filteredViolations.length;
  const totalPoints = filteredViolations.reduce((acc, curr) => acc + curr.points, 0);
  const resolvedCount = filteredViolations.filter(v => v.followUpStatus === 'Selesai Terbina').length;
  const inCounselingCount = filteredViolations.filter(v => v.followUpStatus === 'Konseling BK').length;
  const summonsCount = filteredViolations.filter(v => v.followUpStatus === 'Panggilan Ortu').length;
  const newCount = filteredViolations.filter(v => v.followUpStatus === 'Baru').length;
  
  const resolutionRate = totalViolations > 0 ? Math.round((resolvedCount / totalViolations) * 100) : 0;

  // Monthly breakdown for Trend Bar Chart
  const monthlyData = useMemo(() => {
    const months = [
      { key: '2026-08', label: 'Agu' },
      { key: '2026-09', label: 'Sep' },
      { key: '2026-10', label: 'Okt' },
      { key: '2026-11', label: 'Nov' },
    ];

    return months.map(m => {
      const recorded = violations.filter(v => v.date.startsWith(m.key)).length;
      const resolved = violations.filter(v => v.date.startsWith(m.key) && v.followUpStatus === 'Selesai Terbina').length;
      const inProgress = recorded - resolved;
      return {
        label: m.label,
        key: m.key,
        recorded,
        resolved,
        inProgress,
      };
    });
  }, [violations]);

  // Category breakdown for Donut Chart
  const categoryStats = useMemo(() => {
    const counts: Record<ViolationCategory, number> = {
      'Kedisiplinan & Waktu': 0,
      'Kerapian & Atribut Seragam': 0,
      'KBM & Sikap Akademik': 0,
      'Etika & Sopan Santun': 0,
      'Pelanggaran Berat & Ketertiban': 0,
    };

    filteredViolations.forEach(v => {
      if (counts[v.category] !== undefined) {
        counts[v.category]++;
      }
    });

    const colors: Record<ViolationCategory, string> = {
      'Kedisiplinan & Waktu': '#3B82F6', // Blue
      'Kerapian & Atribut Seragam': '#10B981', // Emerald
      'KBM & Sikap Akademik': '#F59E0B', // Amber
      'Etika & Sopan Santun': '#8B5CF6', // Purple
      'Pelanggaran Berat & Ketertiban': '#EF4444', // Red
    };

    return Object.entries(counts).map(([cat, count]) => {
      const percentage = totalViolations > 0 ? Math.round((count / totalViolations) * 100) : 0;
      return {
        category: cat as ViolationCategory,
        count,
        percentage,
        color: colors[cat as ViolationCategory],
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredViolations, totalViolations]);

  // Class grade breakdown (VII, VIII, IX)
  const classBreakdown = useMemo(() => {
    const levels = {
      'Kelas VII': { total: 0, resolved: 0, points: 0 },
      'Kelas VIII': { total: 0, resolved: 0, points: 0 },
      'Kelas IX': { total: 0, resolved: 0, points: 0 },
    };

    filteredViolations.forEach(v => {
      let key: keyof typeof levels = 'Kelas VII';
      if (v.classGrade.startsWith('VIII')) key = 'Kelas VIII';
      if (v.classGrade.startsWith('IX')) key = 'Kelas IX';

      levels[key].total++;
      levels[key].points += v.points;
      if (v.followUpStatus === 'Selesai Terbina') {
        levels[key].resolved++;
      }
    });

    return Object.entries(levels).map(([level, data]) => ({
      level,
      total: data.total,
      resolved: data.resolved,
      points: data.points,
      rate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
    }));
  }, [filteredViolations]);

  // High alert students (points >= 50 or having status Panggilan)
  const highRiskStudents = useMemo(() => {
    return students
      .filter(s => s.totalPoints >= 50)
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students]);

  // Donut SVG calculations
  const donutSegments = useMemo(() => {
    let accumulatedAngle = 0;
    const radius = 70;
    const center = 100;
    const strokeWidth = 28;

    return categoryStats.map((item, index) => {
      if (item.count === 0 || totalViolations === 0) return null;
      const angle = (item.count / totalViolations) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Arc calculation
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (accumulatedAngle - 90) * (Math.PI / 180);

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      ].join(' ');

      return {
        ...item,
        pathData,
        index,
      };
    }).filter((seg): seg is NonNullable<typeof seg> => seg !== null);
  }, [categoryStats, totalViolations]);

  const maxMonthValue = Math.max(...monthlyData.map(m => m.recorded), 5);

  return (
    <div className="space-y-6">
      {/* Top filter & subhead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Grafik Penanganan & Analitik Kedisiplinan
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>SMP Negeri 1 Kota Pontianak</span>
            <span aria-hidden="true">·</span>
            <span>Tahun Ajaran 2026/2027</span>
            <span aria-hidden="true">·</span>
            <span>Unit Bimbingan Konseling & Kesiswaan</span>
          </div>
        </div>

        {/* Timeframe buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setSelectedTimeframe('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedTimeframe === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Data
          </button>
          <button
            onClick={() => setSelectedTimeframe('3months')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedTimeframe === '3months'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3 Bulan Terakhir
          </button>
          <button
            onClick={() => setSelectedTimeframe('thisMonth')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedTimeframe === 'thisMonth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini (November)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Pelanggaran</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {totalViolations} <span className="text-xs font-normal text-slate-500">kejadian</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Akumulasi <span className="font-semibold text-slate-700 tabular-nums">{totalPoints}</span> poin tata tertib
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Penanganan Tuntas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
                {resolvedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm tabular-nums">
                {resolutionRate}% efektivitas
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Kasus selesai & surat pernyataan terbit
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sedang Diproses BK</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-amber-600 tabular-nums">
              {inCounselingCount + summonsCount} <span className="text-xs font-normal text-slate-500">kasus aktif</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {inCounselingCount} konseling + {summonsCount} proses panggilan
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Agenda Panggilan Ortu</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {summons.length} <span className="text-xs font-normal text-slate-500">surat resmi</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {summons.filter(s => s.status === 'Dijadwalkan').length} menunggu kehadiran ortu
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Trend & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Bar Chart of Trend & Handling Progress (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grafik Rasio Pelanggaran vs Penanganan Selesai
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi bulanan penanganan BK dan penyelesaian kasus siswa
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-300"></span>
                <span>Kasus Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500"></span>
                <span>Tuntas Terbina</span>
              </div>
            </div>
          </div>

          {/* SVG Custom Responsive Bar Chart */}
          <div className="relative pt-4 pb-2">
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 border-b border-slate-200">
              {monthlyData.map((item) => {
                const recordedHeight = maxMonthValue > 0 ? (item.recorded / maxMonthValue) * 100 : 0;
                const resolvedHeight = maxMonthValue > 0 ? (item.resolved / maxMonthValue) * 100 : 0;

                return (
                  <div key={item.key} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow pointer-events-none z-10 whitespace-nowrap">
                      {item.label} 2026: {item.recorded} Masuk, {item.resolved} Tuntas ({item.recorded > 0 ? Math.round((item.resolved/item.recorded)*100) : 0}%)
                    </div>

                    <div className="w-full max-w-[72px] flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Bar 1: Recorded */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-medium text-slate-500 mb-1 tabular-nums">
                          {item.recorded}
                        </span>
                        <div
                          style={{ height: `${Math.max(recordedHeight, 6)}%` }}
                          className="w-full bg-slate-200 rounded-t-sm transition-all group-hover:bg-slate-300"
                        />
                      </div>

                      {/* Bar 2: Resolved */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        <span className="text-[11px] font-semibold text-emerald-600 mb-1 tabular-nums">
                          {item.resolved}
                        </span>
                        <div
                          style={{ height: `${Math.max(resolvedHeight, 6)}%` }}
                          className="w-full bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Month Label */}
                    <span className="text-xs font-medium text-slate-600 mt-2">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom status note */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Target penyelesaian penanganan BK: &gt; 80% per bulan</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                Rata-rata saat ini: {resolutionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Breakdown Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Distribusi Kategori Pelanggaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporsi jenis pelanggaran yang dilaporkan
            </p>
          </div>

          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Donut SVG */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {/* Background circle track */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="28"
                />
                {/* Colored Arcs */}
                {donutSegments.map((seg) => (
                  <path
                    key={seg.category}
                    d={seg.pathData}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={hoveredDonutIndex === seg.index ? "34" : "28"}
                    strokeLinecap="round"
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredDonutIndex(seg.index)}
                    onMouseLeave={() => setHoveredDonutIndex(null)}
                  />
                ))}
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {totalViolations}
                </span>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">
                  Kasus
                </span>
              </div>
            </div>

            {/* Legend list */}
            <div className="w-full space-y-2 text-xs">
              {categoryStats.map((cat, idx) => (
                <div
                  key={cat.category}
                  onMouseEnter={() => setHoveredDonutIndex(idx)}
                  onMouseLeave={() => setHoveredDonutIndex(null)}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                    hoveredDonutIndex === idx ? 'bg-slate-100 font-semibold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-slate-700" title={cat.category}>
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums text-slate-600">
                    <span>{cat.count}</span>
                    <span className="text-slate-400 font-normal w-7 text-right">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Status Breakdown & Class Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Status Penanganan Funnel (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Alur Tahapan Penanganan Kasus Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Progres tindak lanjut dari laporan masuk hingga pembinaan selesai
              </p>
            </div>
            <button
              onClick={onNavigateToSummons}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Lihat Agenda Panggilan <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Stage 1 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">1. Baru Masuk / Verifikasi Piket</span>
                <span className="font-semibold text-slate-900 tabular-nums">{newCount} kasus</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{ width: `${totalViolations > 0 ? (newCount / totalViolations) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-amber-700">2. Proses Bimbingan & Konseling BK</span>
                <span className="font-semibold text-amber-700 tabular-nums">{inCounselingCount} siswa</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${totalViolations > 0 ? (inCounselingCount / totalViolations) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-indigo-700">3. Pemanggilan Orang Tua / Wali (BAP)</span>
                <span className="font-semibold text-indigo-700 tabular-nums">{summonsCount} berkas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${totalViolations > 0 ? (summonsCount / totalViolations) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 4 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-emerald-700">4. Tuntas Terbina / Surat Perjanjian Ditandatangani</span>
                <span className="font-semibold text-emerald-700 tabular-nums">{resolvedCount} tuntas</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${totalViolations > 0 ? (resolvedCount / totalViolations) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tingkat Kelas Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Statistik Berdasarkan Tingkat Kelas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Komparasi jumlah pelanggaran dan poin di kelas 7, 8, dan 9
            </p>
          </div>

          <div className="space-y-4">
            {classBreakdown.map((item) => (
              <div key={item.level} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.level}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-600 tabular-nums">
                      {item.points} total poin
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Penyelesaian:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{item.rate}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 flex overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${item.rate}%` }}
                    title={`Tuntas: ${item.resolved} kasus`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${100 - item.rate}%` }}
                    title={`Dalam proses: ${item.total - item.resolved} kasus`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Total {item.total} kasus tercatat</span>
                  <span>{item.resolved} tuntas / {item.total - item.resolved} dalam penanganan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3: Siswa Perlu Atensi Mendesak (Ambang Batas Poin Tinggi) */}
      <div className="bg-white p-6 rounded-xl border border-red-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Siswa Ambang Batas Poin Kritis (≥ 50 Poin)
              </h3>
              <p className="text-xs text-slate-500">
                Siswa yang memenuhi kriteria pemanggilan orang tua tahap lanjut / skorsing
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full shrink-0">
            {highRiskStudents.length} Siswa Perlu Tindakan Segera
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3">NISN / Kelas</th>
                <th className="py-2.5 px-3">Orang Tua / No. HP</th>
                <th className="py-2.5 px-3 text-right">Akumulasi Poin</th>
                <th className="py-2.5 px-3">Status Disiplin</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900">{st.name}</span>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{st.notes || 'Catatan bimbingan berkala'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-600 tabular-nums">{st.nisn}</span>
                    <span className="text-slate-400"> · </span>
                    <span className="font-medium text-slate-800">{st.classGrade}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800">{st.parentName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{st.parentPhone}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-mono font-bold text-red-600 text-sm tabular-nums">
                      {st.totalPoints}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">pts</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                      {st.disciplineStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectStudent(st)}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                    >
                      Buka Profil & Panggilan <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
