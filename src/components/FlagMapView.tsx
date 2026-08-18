/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, Globe, Search, Loader2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useMemo, useState, useEffect } from 'react';
import { COUNTRIES } from '../data/countries';
import { FlagMark } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface FlagMapViewProps {
  onBack: () => void;
  userMarks: FlagMark[];
  currentUserEmail?: string;
}

// World GeoJSON source
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson';

export function FlagMapView({ onBack, userMarks, currentUserEmail }: FlagMapViewProps) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<FlagMark[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [worldData, setWorldData] = useState<any>(null);

  const displayMarks = hasSearched ? searchResults : userMarks;
  const visitedCountryIds = useMemo(() => 
    new Set(displayMarks.filter(m => m.visited).map(m => m.countryId.toUpperCase())),
  [displayMarks]);

  const visitedCountries = useMemo(() => 
    COUNTRIES.filter(c => visitedCountryIds.has(c.id.toUpperCase())),
  [visitedCountryIds]);

  useEffect(() => {
    fetch(WORLD_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setWorldData(data))
      .catch(err => console.error('Failed to load world GeoJSON:', err));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const q = query(
        collection(db, 'flag_marks'),
        where('userEmail', '==', searchEmail.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => doc.data() as FlagMark);
      setSearchResults(results);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'flag_marks');
    } finally {
      setIsSearching(false);
    }
  };

  const onEachFeature = (feature: any, layer: any) => {
    const countryCode = feature.properties.iso_a2;
    const isVisited = countryCode && visitedCountryIds.has(countryCode.toUpperCase());
    
    layer.setStyle({
      fillColor: isVisited ? '#FFD700' : '#222',
      fillOpacity: isVisited ? 0.8 : 0.4,
      color: isVisited ? '#B8860B' : '#444',
      weight: 1,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      <header className="p-4 flex items-center gap-4 border-b border-white/10 shrink-0">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#FFD700] font-black uppercase block">WORLD FLAG COLLECTION</span>
          <h2 className="text-xl font-black tracking-tight text-white leading-tight">全球集國旗地圖</h2>
        </div>
      </header>

      {/* Search Area - Now Above Map */}
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
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#FFD700] outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="px-6 bg-[#FFD700] text-black font-black rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Map Section */}
      <div className="h-[40vh] relative border-b border-white/10 z-0 overflow-hidden">
        <MapContainer 
          center={[20, 0]} 
          zoom={1.5} 
          style={{ height: '100%', width: '100%', background: '#0A0A0A' }}
          zoomControl={false}
          minZoom={1}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {worldData && (
            <GeoJSON 
              key={visitedCountryIds.size} // Force re-render when visited set changes
              data={worldData} 
              onEachFeature={onEachFeature} 
            />
          )}
        </MapContainer>
      </div>

      {/* Visited List */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="flex items-end justify-between mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Flag className="w-4 h-4 text-[#FFD700]" />
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                收藏者: {hasSearched ? searchEmail : (currentUserEmail || '未登入')}
              </h3>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#FFD700] tracking-tighter leading-none">
                {visitedCountries.length}
              </span>
              <span className="text-xs font-bold text-gray-400">面國旗</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {visitedCountries.map((country, idx) => (
              <motion.div
                key={country.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#121212] p-4 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-12 rounded-xl overflow-hidden shadow-xl border border-white/10">
                  <img 
                    src={`https://flagcdn.com/w160/${country.id}.png`}
                    alt={country.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs font-black text-white">{country.name}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {visitedCountries.length === 0 && !isSearching && (
          <div className="py-20 text-center text-gray-600">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold leading-relaxed">
              尚未有任何國旗收藏紀錄<br />
              快去開始您的冒險旅程吧！
            </p>
          </div>
        )}
        
        {hasSearched && (
          <button 
            onClick={() => {
              setHasSearched(false);
              setSearchEmail('');
              setSearchResults([]);
            }}
            className="w-full mt-8 py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl hover:text-white transition-all"
          >
            返回我的收藏
          </button>
        )}
      </div>
    </div>
  );
}
