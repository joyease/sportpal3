/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { SportRecord } from '../types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChevronLeft, Calendar, Activity, TrendingUp, Search, Info, Trash2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoryTrendProps {
  records: SportRecord[];
  onBack: () => void;
  onDeleteRecord?: (recordId: string) => Promise<void>;
}

export function HistoryTrend({ records, onBack, onDeleteRecord }: HistoryTrendProps) {
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const years = useMemo(() => {
    const yearSet = new Set(['2026', '2025', '2024']);
    records.forEach(r => {
      const year = new Date(r.timestamp).getFullYear();
      if (year >= 2020 && year <= 2030) {
        yearSet.add(year.toString());
      }
    });
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const date = new Date(r.timestamp);
      const yearMatch = selectedYear === 'ALL' || date.getFullYear().toString() === selectedYear;
      const searchMatch = !searchTerm || 
        date.toISOString().includes(searchTerm) || 
        r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      return yearMatch && searchMatch;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [records, selectedYear, searchTerm]);

  const stats = useMemo(() => {
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      label: `${i + 1}月`,
      distance: 0,
      duration: 0,
      count: 0
    }));

    let totalDist = 0;
    let totalDur = 0;

    filteredRecords.forEach(r => {
      const date = new Date(r.timestamp);
      const mIdx = date.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthsData[mIdx].distance += (r.distance || 0);
        monthsData[mIdx].duration += r.duration;
        monthsData[mIdx].count += 1;
      }
      totalDist += (r.distance || 0);
      totalDur += r.duration;
    });

    const totalHours = totalDur.toFixed(2);
    const avgDist = (totalDist / 12).toFixed(1);
    const avgMonthlyHours = (totalDur / 12).toFixed(1);
    const avgSession = filteredRecords.length > 0 ? (totalDur / filteredRecords.length).toFixed(1) : '0';

    return {
      monthsData,
      totalDist: totalDist.toFixed(1),
      totalHours,
      totalCount: filteredRecords.length,
      avgDist,
      avgMonthlyHours,
      avgSession
    };
  }, [filteredRecords]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#121212',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 12,
        callbacks: {
          label: function(context) {
            const val = context.parsed.y;
            if (context.dataset.label?.includes('時間')) {
              return ` 總時間: ${val} hrs`;
            }
            return ` 總距離: ${val} km`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      }
    }
  };

  const distanceData = {
    labels: stats.monthsData.map(m => m.label),
    datasets: [{
      label: '距離 (km)',
      data: stats.monthsData.map(m => Number(m.distance.toFixed(1))),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#ffffff'
    }]
  };

  const durationData = {
    labels: stats.monthsData.map(m => m.label),
    datasets: [{
      label: '時間 (hrs)',
      data: stats.monthsData.map(m => Number(m.duration.toFixed(2))),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      fill: true,
      tension: 0.35,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#ffffff'
    }]
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteRecord) return;
    if (window.confirm('確定要刪除這筆運動紀錄嗎？')) {
      setDeletingId(id);
      try {
        await onDeleteRecord(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="p-6 pb-32 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <span className="font-mono text-xs tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-1 block">ANALYTICS</span>
          <h2 className="text-3xl font-black tracking-tight text-white">年度運動趨勢</h2>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-4 bg-[#121212] p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-300">年度選擇</span>
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#1A1A1A] border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-[#FF512F] transition-all"
          >
            {years.map(y => <option key={y} value={y}>{y} 年</option>)}
            <option value="ALL">全部年份</option>
          </select>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="搜尋項目、日期或備註..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-[#FF512F] outline-none transition-all"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121212] p-5 rounded-[32px] border border-white/5 shadow-xl">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">年度累積里程</div>
          <div className="text-2xl font-black text-[#3b82f6] tracking-tighter">
            {stats.totalDist} <span className="text-xs font-medium text-gray-500">km</span>
          </div>
        </div>
        <div className="bg-[#121212] p-5 rounded-[32px] border border-white/5 shadow-xl">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">年度總時數</div>
          <div className="text-2xl font-black text-[#10b981] tracking-tighter">
            {stats.totalHours} <span className="text-xs font-medium text-gray-500">hrs</span>
          </div>
        </div>
      </div>

      {/* Monthly Charts */}
      <div className="space-y-6">
        <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">每月里程趨勢 (km)</h3>
            </div>
            <span className="text-xs text-gray-500 font-mono">1 ~ 12 月</span>
          </div>
          <div className="h-64">
            <Line data={distanceData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">每月時間趨勢 (小時)</h3>
            </div>
            <span className="text-xs text-gray-500 font-mono">1 ~ 12 月</span>
          </div>
          <div className="h-64">
            <Line data={durationData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Detailed List with Delete Capability */}
      <div className="bg-[#121212] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF512F]" />
            數據明細清單
          </h3>
          <span className="text-[10px] font-bold text-gray-500 font-mono bg-white/5 px-2 py-1 rounded-full">
            {filteredRecords.length} 筆
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <Info className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">尚無符合條件的數據</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredRecords.map(r => (
                <div key={r.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {new Date(r.timestamp).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded font-bold">
                        {r.type}
                      </span>
                    </div>
                    {r.notes && <p className="text-[11px] text-gray-400 font-sans max-w-xs truncate">{r.notes}</p>}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-black text-blue-400">{r.distance || 0} <span className="text-[9px] font-medium text-gray-500">km</span></span>
                      <span className="text-[11px] text-gray-500 font-mono">{r.duration.toFixed(1)} hrs</span>
                    </div>

                    {onDeleteRecord && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        title="刪除此筆紀錄"
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
