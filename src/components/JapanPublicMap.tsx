/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JapanVisit } from '../types';
import { PREFECTURES } from '../data/japanPrefectures';
import { JAPAN_SVG_DATA } from '../data/japanSvgData';

interface JapanPublicMapProps {
  onBack: () => void;
}

const COLORS = ['#999', '#4CAF50', '#FFEB3B', '#FF9800', '#F44336'];

export function JapanPublicMap({ onBack }: JapanPublicMapProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, number>>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [status, setStatus] = useState('不同顏色顯示到過 1, 2, 3次 與4次以上!');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) {
      setStatus('⚠️ 請輸入 Email');
      return;
    }

    setLoading(true);
    setStatus('🔄 載入用戶資料...');
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
      setStatus(`✅ ${searchEmail} 去過 ${visitedCount}/47 個都道府縣`);
    } catch (error) {
      console.error('Search failed:', error);
      setStatus('❌ 載入失敗，請確認網路連線');
    } finally {
      setLoading(false);
    }
  };

  const getVisitCountForCounty = (countyTitle: string) => {
    // Match county title (e.g. "愛知") with PREFECTURES data (e.g. "愛知縣")
    const pref = PREFECTURES.find(p => p.name.startsWith(countyTitle));
    if (!pref) return 0;
    return searchResults[pref.id] || 0;
  };

  const getFillColor = (count: number) => {
    if (count === 0) return COLORS[0];
    if (count === 1) return COLORS[1];
    if (count === 2) return COLORS[2];
    if (count === 3) return COLORS[3];
    return COLORS[4];
  };

  return (
    <div className="flex flex-col bg-white min-h-screen text-gray-900 font-sans">
      <header className="p-6 bg-[#ff6b6b] text-white flex items-center gap-4 sticky top-0 z-50 shadow-lg">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">日本 47 都道府縣旅遊地圖</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">日本好好玩~你去過哪裡?</h2>
          <p className="text-gray-500 text-lg md:text-xl">跟朋友展示，你在日本47都道府縣的足跡!</p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="輸入 Email 查詢地圖..."
              className="w-full max-w-md border-4 border-gray-100 rounded-2xl py-4 px-6 text-xl text-center focus:border-[#ff6b6b] outline-none transition-all shadow-sm bg-gray-50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-[#ff6b6b] text-white px-10 py-4 rounded-2xl font-black text-xl hover:bg-[#ff5252] transition-all disabled:opacity-50 shadow-lg active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : '🔍 查詢我的地圖'}
            </button>
          </form>
          
          <div id="status" className="text-lg font-bold text-[#ff6b6b] min-h-[1.5rem] mt-4">
            {status}
          </div>
        </div>

        <div className="relative bg-gray-50 rounded-[40px] border-4 border-gray-100 p-4 shadow-inner overflow-hidden">
          <svg 
            viewBox="0 0 11300 11300" 
            className="w-full h-auto drop-shadow-2xl"
            preserveAspectRatio="xMidYMid meet"
          >
            <g>
              {JAPAN_SVG_DATA.counties.map((county: any) => {
                const count = getVisitCountForCounty(county.title);
                const fill = getFillColor(count);
                return (
                  <path
                    key={county.id}
                    d={county.path}
                    fill={fill}
                    stroke="#555"
                    strokeWidth="15"
                    className="transition-all duration-500 cursor-pointer hover:stroke-black hover:stroke-[30px] hover:opacity-90"
                  >
                    <title>{`${county.title}: ${count}次`}</title>
                  </path>
                );
              })}
            </g>
            <g pointerEvents="none">
              {JAPAN_SVG_DATA.counties.map((county: any) => {
                const count = getVisitCountForCounty(county.title);
                if (count > 0 && county.center) {
                  return (
                    <text
                      key={`text-${county.id}`}
                      x={county.center[0]}
                      y={county.center[1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="150"
                      fill="#333"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {county.title}
                    </text>
                  );
                }
                return null;
              })}
            </g>
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-6 pb-12">
          {COLORS.map((color, i) => (
            <div key={color} className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
              <div 
                className="w-10 h-8 rounded-lg border-2 border-gray-800" 
                style={{ backgroundColor: color }}
              />
              <span className="font-bold text-gray-700">
                {i === 0 ? '0 (未去過)' : i === 4 ? '4次以上' : `${i}次`}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
