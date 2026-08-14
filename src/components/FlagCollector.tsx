/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, Flag, Check, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTRIES, CONTINENTS } from '../data/countries';
import { FlagMark } from '../types';
import { useState } from 'react';

interface FlagCollectorProps {
  marks: FlagMark[];
  onToggleMark: (countryId: string, visited: boolean) => void;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  onBack: () => void;
}

export function FlagCollector({ marks, onToggleMark, isLoggedIn, onLoginRequest, onBack }: FlagCollectorProps) {
  const [activeContinent, setActiveContinent] = useState(CONTINENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const visitedMap = new Map(marks.filter(m => m.visited).map(m => [m.countryId, true]));

  const filteredCountries = COUNTRIES.filter(c => {
    const matchesContinent = c.continent === activeContinent;
    const matchesSearch = c.name.includes(searchQuery) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesContinent && matchesSearch;
  });

  const stats = {
    total: COUNTRIES.length,
    visited: visitedMap.size,
    percent: Math.round((visitedMap.size / COUNTRIES.length) * 100)
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
        <header className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <span className="font-mono text-xs tracking-[0.3em] text-[#FFD700] font-bold uppercase mb-1 block">FLAG COLLECTION</span>
            <h2 className="text-3xl font-black tracking-tight text-white">集國旗紀錄</h2>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#121212] rounded-[40px] border border-white/5">
          <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center mb-6">
            <Flag className="w-10 h-10 text-[#FFD700]" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4">解鎖您的全球足跡</h3>
          <p className="text-gray-400 mb-10 leading-relaxed max-w-xs mx-auto">
            登入後即可開始記錄您造訪過的國家，並將國旗掛在您的榮譽牆上。
          </p>
          <button
            onClick={onLoginRequest}
            className="bg-[#FFD700] text-black px-12 py-4 rounded-2xl font-black tracking-widest uppercase text-sm hover:scale-105 transition-all shadow-xl shadow-[#FFD700]/20"
          >
            立即登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-32 flex flex-col gap-6 bg-[#0A0A0A] min-h-screen">
      <header className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <span className="font-mono text-xs tracking-[0.3em] text-[#FFD700] font-bold uppercase mb-1 block">COLLECTION PROGRESS</span>
          <h2 className="text-3xl font-black tracking-tight text-white">集國旗紀錄</h2>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-[#121212] p-6 rounded-[32px] border border-white/5">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">全球探索進度</div>
            <div className="text-4xl font-black text-white tracking-tighter">
              {stats.visited} <span className="text-sm font-bold text-gray-500">/ {stats.total} 國</span>
            </div>
          </div>
          <div className="text-2xl font-black text-[#FFD700] tracking-tight">{stats.percent}%</div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.percent}%` }}
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-full"
          />
        </div>
      </div>

      {/* Search & Continent Tabs */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="搜尋國家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CONTINENTS.map(continent => (
            <button
              key={continent}
              onClick={() => setActiveContinent(continent)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeContinent === continent 
                ? 'bg-[#FFD700] text-black' 
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      {/* Country List */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredCountries.map((country, idx) => {
            const isVisited = visitedMap.has(country.id);
            return (
              <motion.div
                key={country.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => onToggleMark(country.id, !isVisited)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isVisited 
                  ? 'bg-[#FFD700]/10 border-[#FFD700]/30' 
                  : 'bg-[#121212] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded-md overflow-hidden shadow-sm bg-white/5 border border-white/10 flex items-center justify-center">
                    <img 
                      src={`https://flagcdn.com/w80/${country.id}.png`}
                      alt={country.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/80x53/1a1a1a/ffffff?text=${country.id.toUpperCase()}`;
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{country.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{country.id}</div>
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isVisited 
                  ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' 
                  : 'border-white/10 text-transparent'
                }`}>
                  <Check className="w-5 h-5 stroke-[3px]" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredCountries.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            <Flag className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">找不到相符的國家</p>
          </div>
        )}
      </div>

      {/* TTDI 2024 Information Section */}
      <div className="mt-8 mb-12 p-8 bg-[#121212] rounded-[40px] border border-white/5">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <div className="w-2 h-8 bg-[#FFD700] rounded-full" />
          關於 TTDI 2024
        </h3>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm font-medium">
          <p>
            世界經濟論壇（WEF）最新發佈的《旅遊業發展指數》（Travel & Tourism Development Index, TTDI 2024）共針對全球 119 個經濟體（國家與地區）進行評比。
          </p>
          <p>
            這項指數每兩年發佈一次，結合了基礎設施、環境永續、治安、文化與自然資源等多達 17 個支柱指標進行綜合評分。
          </p>
          
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-[#FFD700] font-black uppercase tracking-widest text-xs mb-4">全球旅遊業發展指數（TTDI）完整榜單</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#FFD700] text-black rounded flex items-center justify-center font-black">🥇</div>
                <span className="font-bold text-white">第 1 – 30 名（全球領先群）</span>
              </div>
              <p className="pl-8 text-gray-500 italic">美國、西班牙、日本、法國、澳洲、德國、英國、中國、義大利、瑞士等領銜...</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-gray-400 text-black rounded flex items-center justify-center font-black">🥈</div>
                <span className="font-bold text-white">第 31 – 60 名</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-[#CD7F32] text-black rounded flex items-center justify-center font-black">🥉</div>
                <span className="font-bold text-white">第 61 – 90 名</span>
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 bg-gray-600 text-white rounded flex items-center justify-center font-black">🏅</div>
                <span className="font-bold text-white">第 91 – 116 名及其他</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
