/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, ChevronRight, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  ZoomableGroup
} from 'react-simple-maps';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JapanVisit } from '../types';
import { PREFECTURES } from '../data/japanPrefectures';
import { cn } from '../lib/utils';

interface JapanPublicMapProps {
  onBack: () => void;
}

export function JapanPublicMap({ onBack }: JapanPublicMapProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [geoData, setGeoData] = useState<any>(null);
  const [searchedVisits, setSearchedVisits] = useState<JapanVisit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([138.5, 37.5]);

  // Load map data asynchronously to reduce main bundle size
  useEffect(() => {
    import('../data/japanMapData')
      .then((module) => {
        setGeoData(module.JAPAN_MAP_DATA);
        setMapLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load map data dynamically:", err);
        setMapLoading(false);
      });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setLoading(true);
    setSearchedVisits([]);
    try {
      const q = query(
        collection(db, 'japan_visits'), 
        where('userEmail', '==', searchEmail.toLowerCase())
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as JapanVisit);
      setSearchedVisits(data);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrefectureColor = (geo: any) => {
    const name = geo.properties.name;
    const name_local = geo.properties.name_local;
    
    const pref = PREFECTURES.find(p => 
      p.enName === name || 
      p.name === name || 
      p.name === name_local ||
      (name && p.name.includes(name)) ||
      (name_local && name_local.includes(p.name))
    );
    
    if (!pref) return '#666'; 

    const visit = searchedVisits.find(v => v.prefectureId === pref.id);
    const count = visit ? visit.count : 0;

    if (count === 0) return '#666'; 
    if (count === 1) return '#22C55E'; 
    if (count > 1 && count <= 5) return '#EAB308'; 
    return '#EF4444'; 
  };

  const handleZoomIn = () => {
    if (zoom >= 10) return;
    setZoom(prev => prev * 1.5);
  };

  const handleZoomOut = () => {
    if (zoom <= 0.5) return;
    setZoom(prev => prev / 1.5);
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([138.5, 37.5]);
  };

  return (
    <div className="flex flex-col bg-[#0A0A0A] min-h-screen text-white">
      <header className="p-6 bg-[#121212] border-b border-white/10 flex items-center gap-4 sticky top-0 z-50 shadow-xl">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-1 block">JAPAN MAP EXPLORER</span>
          <h2 className="text-2xl font-black tracking-tight text-white">日本 47 地通</h2>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#FF512F] transition-colors" />
          </div>
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="輸入 Gmail 查詢足跡..."
            className="w-full bg-[#121212] border border-white/5 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#FF512F]/40 focus:ring-1 focus:ring-[#FF512F]/40 transition-all font-medium"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-white text-black px-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '查詢'}
          </button>
        </form>

        <div className="relative bg-[#121212] rounded-[40px] border border-white/5 overflow-hidden aspect-[4/5] shadow-2xl flex items-center justify-center">
          {mapLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#121212]">
              <Loader2 className="w-10 h-10 text-[#FF512F] animate-spin mb-4" />
              <span className="text-xs font-bold text-gray-500 tracking-widest uppercase tracking-widest">地圖資料初始化中...</span>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-40 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all shadow-xl active:scale-90">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={handleZoomOut} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all shadow-xl active:scale-90">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={handleReset} className="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all shadow-xl active:scale-90">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Actual Map Content */}
          {geoData && (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1800,
                center: [138.5, 37.5]
              }}
              className="w-full h-full"
            >
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ coordinates, zoom }) => {
                  setCenter(coordinates as [number, number]);
                  setZoom(zoom);
                }}
              >
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const fill = getPrefectureColor(geo);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          style={{
                            default: { fill: fill, outline: "none", stroke: "#000", strokeWidth: 0.5 },
                            hover: { fill: fill === '#666' ? '#888' : fill, outline: "none", stroke: "#FFF", strokeWidth: 1.5 },
                            pressed: { fill: fill, outline: "none" }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          )}

          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl z-30">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">1次</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">2-5次</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">5次+</span>
              </div>
            </div>
            {hasSearched && (
              <span className="text-[10px] font-black text-[#FF512F] uppercase tracking-widest animate-pulse">
                {searchedVisits.length > 0 ? '載入成功' : '無紀錄'}
              </span>
            )}
          </div>
        </div>

        <AnimatePresence>
          {hasSearched && searchedVisits.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              <h4 className="font-black text-xs text-white/40 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <div className="w-1 h-3 bg-[#FF512F]" />
                造訪統計詳細
              </h4>
              <div className="bg-[#121212] rounded-3xl border border-white/5 p-6 grid grid-cols-2 gap-4 shadow-inner">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">總造訪次數</div>
                  <div className="text-3xl font-black text-white tracking-tighter">{searchedVisits.reduce((sum, v) => sum + v.count, 0)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">點亮地區</div>
                  <div className="text-3xl font-black text-white tracking-tighter">{searchedVisits.length}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
