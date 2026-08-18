/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ChevronRight, ChevronDown, Map as MapIcon, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { PREFECTURES, JAPAN_REGIONS } from '../data/japanPrefectures';
import { JapanVisit } from '../types';
import { cn } from '../lib/utils';

interface JapanExplorerProps {
  visits: JapanVisit[];
  onToggleVisit: (prefId: string, currentCount: number) => void;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  onBack: () => void;
}

export function JapanExplorer({ visits, onToggleVisit, isLoggedIn, onLoginRequest, onBack }: JapanExplorerProps) {
  const [expandedRegions, setExpandedRegions] = useState<string[]>(JAPAN_REGIONS);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => 
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    );
  };

  const getVisitColor = (count: number) => {
    if (count === 0) return 'bg-[#1A1A1A] border-white/5 text-gray-500';
    if (count === 1) return 'bg-[#4CAF50]/20 border-[#4CAF50]/30 text-[#4CAF50] shadow-[0_0_15px_rgba(76,175,80,0.1)]';
    if (count >= 2 && count <= 5) return 'bg-[#FFEB3B]/20 border-[#FFEB3B]/30 text-[#FFEB3B] shadow-[0_0_15px_rgba(255,235,59,0.1)]';
    if (count >= 6 && count <= 9) return 'bg-[#FF9800]/20 border-[#FF9800]/30 text-[#FF9800] shadow-[0_0_15px_rgba(255,152,0,0.1)]';
    return 'bg-[#F44336]/20 border-[#F44336]/30 text-[#F44336] shadow-[0_0_15px_rgba(244,67,54,0.1)]';
  };

  const getVisitLabel = (count: number) => {
    if (count === 0) return '尚未造訪';
    if (count === 1) return '1次';
    if (count >= 2 && count <= 5) return '2-5次';
    if (count >= 6 && count <= 9) return '6-9次';
    return '10次以上';
  };

  const visitMap = visits.reduce((acc, v) => {
    acc[v.prefectureId] = v.count;
    return acc;
  }, {} as Record<string, number>);

  if (!isLoggedIn) {
    return (
      <div className="p-8 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
        <header className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <h2 className="text-3xl font-black tracking-tight text-white">日本通</h2>
        </header>

        <div className="bg-[#121212] rounded-[32px] p-12 shadow-2xl border border-white/5 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-white/10">
            <MapIcon className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">紀錄您的足跡</h3>
          <p className="text-base text-gray-200 mb-10 leading-relaxed font-medium">登入後即可開始勾選您造訪過的日本行政區，並統計造訪次數。</p>
          <button
            onClick={onLoginRequest}
            className="bg-white text-black px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-sm hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            立即登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-1 block">JAPAN EXPLORER</span>
            <h2 className="text-3xl font-black tracking-tight text-white">日本通</h2>
          </div>
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-gray-400">同步中</span>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">已點亮</div>
          <div className="text-2xl font-black text-white">{visits.length}<span className="text-xs text-gray-500 ml-1">/ 47</span></div>
        </div>
        <div className="bg-[#121212] p-4 rounded-2xl border border-white/5">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">總次數</div>
          <div className="text-2xl font-black text-white">{visits.reduce((sum, v) => sum + v.count, 0)}</div>
        </div>
      </div>

      <div className="space-y-4">
        {JAPAN_REGIONS.map(region => {
          const regionPrefs = PREFECTURES.filter(p => p.region === region);
          const isExpanded = expandedRegions.includes(region);
          const visitedInRegion = regionPrefs.filter(p => visitMap[p.id] > 0).length;

          return (
            <div key={region} className="bg-[#121212] rounded-3xl border border-white/5 overflow-hidden">
              <button 
                onClick={() => toggleRegion(region)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </div>
                  <span className="font-black text-lg text-white tracking-tight">{region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
                    {visitedInRegion} / {regionPrefs.length}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                  {regionPrefs.map(pref => {
                    const count = visitMap[pref.id] || 0;
                    return (
                      <button
                        key={pref.id}
                        onClick={() => onToggleVisit(pref.id, count)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-300 active:scale-95 group relative overflow-hidden",
                          getVisitColor(count)
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{pref.enName}</span>
                          <span className="text-sm font-black tracking-tight">{pref.name}</span>
                        </div>
                        <div className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-80 flex items-center gap-1">
                          {getVisitLabel(count)}
                        </div>
                        
                        {count > 0 && (
                          <div className="absolute top-0 right-0 p-1 opacity-20">
                            <RotateCcw className="w-3 h-3 rotate-45" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5 space-y-4">
        <h4 className="font-black text-[10px] text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
          <div className="w-1 h-3 bg-[#FF512F]"></div>
          色彩圖例
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50]/50" />
            <span className="text-xs font-bold text-gray-300">1次造訪</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFEB3B]/50" />
            <span className="text-xs font-bold text-gray-300">2-5次造訪</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF9800]/50" />
            <span className="text-xs font-bold text-gray-300">6-9次造訪</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F44336]/50" />
            <span className="text-xs font-bold text-gray-300">10次以上</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <span className="text-xs font-bold text-gray-300">尚未造訪</span>
          </div>
        </div>
      </div>
    </div>
  );
}
