/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, ChevronLeft, Loader2, MapPin } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JapanVisit } from '../types';
import { PREFECTURES, JAPAN_REGIONS } from '../data/japanPrefectures';

interface JapanPublicMapProps {
  onBack: () => void;
}

const COLORS = ['#999', '#4CAF50', '#FFEB3B', '#FF9800', '#F44336'];

export function JapanPublicMap({ onBack }: JapanPublicMapProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [japanSvgData, setJapanSvgData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Record<string, number>>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [status, setStatus] = useState('輸入好友 Email 查詢日本足跡');

  useEffect(() => {
    fetch('./japan_counties.json')
      .then(res => res.json())
      .then(data => {
        setJapanSvgData(data);
        setMapLoading(false);
      })
      .catch(err => {
        console.error('Failed to load map data:', err);
        setMapLoading(false);
        setStatus('❌ 地圖資料載入失敗');
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'japan_visits'), 
        where('userEmail', '==', searchEmail.toLowerCase())
      );
      const snapshot = await getDocs(q);
      
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as JapanVisit;
        counts[data.prefectureId] = data.count;
      });
      
      setSearchResults(counts);
      setHasSearched(true);
      
      const visitedCount = Object.keys(counts).length;
      setStatus(`✅ 查詢成功！已造訪 ${visitedCount}/47 個地區`);
    } catch (error) {
      console.error('Search failed:', error);
      setStatus('❌ 查詢失敗');
    } finally {
      setLoading(false);
    }
  };

  const getVisitCountForCounty = (countyTitle: string) => {
    const pref = PREFECTURES.find(p => p.name.startsWith(countyTitle));
    if (!pref) return 0;
    return searchResults[pref.id] || 0;
  };

  const getFillColor = (count: number) => {
    if (count === 0) return COLORS[0];
    if (count === 1) return COLORS[1];
    if (count >= 2 && count <= 5) return COLORS[2];
    if (count >= 6 && count <= 9) return COLORS[3];
    return COLORS[4];
  };

  const totalVisits = useMemo(() => 
    Object.values(searchResults).reduce((sum, count) => sum + count, 0),
  [searchResults]);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      <header className="p-4 flex items-center gap-4 border-b border-white/10 shrink-0 bg-[#121212]">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#ff6b6b] font-black uppercase block">JAPAN FOOTPRINTS</span>
          <h2 className="text-xl font-black tracking-tight text-white leading-tight">日本 47 都道府縣足跡</h2>
        </div>
      </header>

      {/* Search Area */}
      <div className="p-4 bg-[#121212] border-b border-white/10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="email"
              required
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="輸入 Email 查詢好友足跡"
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#ff6b6b] outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || mapLoading}
            className="px-6 bg-[#ff6b6b] text-white font-black rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{status}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Map Section */}
        <div className="relative bg-[#0A0A0A] p-4 min-h-[400px] flex items-center justify-center border-b border-white/10 overflow-hidden">
          {mapLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-[#ff6b6b] animate-spin" />
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">地圖讀取中...</span>
            </div>
          ) : (
            <svg 
              viewBox="0 0 11300 11300" 
              className="w-full h-full max-h-[70vh] drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              preserveAspectRatio="xMidYMid meet"
            >
              <g>
                {japanSvgData?.counties.map((county: any) => {
                  const count = getVisitCountForCounty(county.title);
                  const fill = getFillColor(count);
                  return (
                    <path
                      key={county.id}
                      d={county.path}
                      fill={fill}
                      stroke="#222"
                      strokeWidth="20"
                      className="transition-all duration-500 cursor-pointer hover:stroke-white hover:stroke-[40px] hover:opacity-90"
                    >
                      <title>{`${county.title}: ${count}次`}</title>
                    </path>
                  );
                })}
              </g>
              <g pointerEvents="none">
                {japanSvgData?.counties.map((county: any) => {
                  const count = getVisitCountForCounty(county.title);
                  if (count > 0 && county.center) {
                    return (
                      <text
                        key={`text-${county.id}`}
                        x={county.center[0]}
                        y={county.center[1]}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="180"
                        fill="#000"
                        fontWeight="900"
                        className="pointer-events-none drop-shadow-sm"
                      >
                        {county.title}
                      </text>
                    );
                  }
                  return null;
                })}
              </g>
            </svg>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            {COLORS.map((color, i) => (
              <div key={color} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm border border-white/20" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-[9px] font-bold text-gray-300">
                  {i === 0 ? '0' : i === 1 ? '1' : i === 2 ? '2-5' : i === 3 ? '6-9' : '10+'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6 space-y-8 pb-32">
          {hasSearched ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-[#ff6b6b]" />
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                      查詢帳號: {searchEmail}
                    </h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#ff6b6b] tracking-tighter leading-none">
                      {Object.keys(searchResults).length}
                    </span>
                    <span className="text-xs font-bold text-gray-400">個行政區，共 {totalVisits} 次造訪</span>
                  </div>
                </div>
              </div>

              {/* Grouped Prefecture List */}
              <div className="space-y-6">
                {JAPAN_REGIONS.map(region => {
                  const regionPrefs = PREFECTURES.filter(p => p.region === region);
                  const visitedInRegion = regionPrefs.filter(p => searchResults[p.id] > 0);
                  
                  if (visitedInRegion.length === 0) return null;

                  return (
                    <div key={region} className="space-y-3">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">{region}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {visitedInRegion.map(pref => (
                          <div 
                            key={pref.id}
                            className="bg-[#121212] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-white">{pref.name}</span>
                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{pref.enName}</span>
                            </div>
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border border-white/10"
                              style={{ 
                                backgroundColor: getFillColor(searchResults[pref.id]),
                                color: searchResults[pref.id] >= 2 ? '#000' : '#FFF'
                              }}
                            >
                              {searchResults[pref.id]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="py-20 text-center text-gray-600">
              <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-bold leading-relaxed">
                輸入好友 Email 點亮日本地圖<br />
                查看他們在 47 都道府縣的足跡
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
