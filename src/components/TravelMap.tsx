/*
 * Copyright 2026 Google LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Map as MapIcon, Search, Loader2, MapPin, RotateCw, ChevronLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckIn } from '../types';

// Marker icon fix for Leaflet in React bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const COLOR_GROUPS = [
  { key: 'blue', line: '#2563eb', fill: '#3b82f6', label: '藍' },
  { key: 'red', line: '#dc2626', fill: '#ef4444', label: '紅' },
  { key: 'black', line: '#1a1f1c', fill: '#374151', label: '黑' },
  { key: 'purple', line: '#9333ea', fill: '#a855f7', label: '紫' },
];

function getGroupColor(index: number) {
  return COLOR_GROUPS[Math.floor(index / 10) % COLOR_GROUPS.length];
}

function MapBoundsUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

interface TravelMapProps {
  onBack?: () => void;
}

export function TravelMap({ onBack }: TravelMapProps) {
  const [email, setEmail] = useState('');
  const [tripCode, setTripCode] = useState('');
  const [points, setPoints] = useState<CheckIn[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('請輸入 Gmail 與行程代碼後按查詢');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    const savedTripCode = localStorage.getItem('sportpal_tripcode');
    const savedEmail = localStorage.getItem('sportpal_last_email');
    if (savedTripCode) setTripCode(savedTripCode);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const fetchOsrmRoute = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      }
      return [start, end];
    } catch {
      return [start, end];
    }
  };

  const handleSearch = async () => {
    if (!email || !tripCode) {
      setErrorMessage('請輸入完整資訊');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('正在從雲端讀取行程軌跡...');
    setPoints([]);
    setRouteCoordinates([]);
    setBounds(null);

    localStorage.setItem('sportpal_last_email', email);
    localStorage.setItem('sportpal_tripcode', tripCode);

    try {
      const emailTrimmed = email.trim();
      const tripCodeTrimmed = tripCode.trim();

      let q = tripCodeTrimmed
        ? query(collection(db, 'check_ins'), where('userEmail', '==', emailTrimmed), where('tripcode', '==', tripCodeTrimmed))
        : query(collection(db, 'check_ins'), where('userEmail', '==', emailTrimmed));

      let snapshot = await getDocs(q);

      if (snapshot.empty && emailTrimmed !== emailTrimmed.toLowerCase()) {
        q = tripCodeTrimmed
          ? query(collection(db, 'check_ins'), where('userEmail', '==', emailTrimmed.toLowerCase()), where('tripcode', '==', tripCodeTrimmed))
          : query(collection(db, 'check_ins'), where('userEmail', '==', emailTrimmed.toLowerCase()));
        snapshot = await getDocs(q);
      }

      if (snapshot.empty) {
        setStatusMessage('找不到此帳號與行程的打卡紀錄');
        setIsLoading(false);
        return;
      }

      const checkInList: CheckIn[] = [];
      snapshot.forEach((doc) => {
        checkInList.push(doc.data() as CheckIn);
      });

      checkInList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setPoints(checkInList);

      if (checkInList.length > 0) {
        const latLngs = checkInList.map((p) => L.latLng(p.lat, p.lng));
        setBounds(L.latLngBounds(latLngs));
      }

      if (checkInList.length >= 2) {
        setStatusMessage('正在規劃路徑軌跡...');
        const allRoutes: [number, number][] = [];
        for (let i = 0; i < checkInList.length - 1; i++) {
          const segment = await fetchOsrmRoute(
            [checkInList[i].lat, checkInList[i].lng],
            [checkInList[i + 1].lat, checkInList[i + 1].lng]
          );
          allRoutes.push(...segment);
        }
        setRouteCoordinates(allRoutes);
      }

      setStatusMessage(`✓ 共載入 ${checkInList.length} 個位置，行程軌跡已更新`);
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage('查詢失敗: ' + (err.message || '未知錯誤'));
      setStatusMessage('查詢發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      <header className="bg-[#121212] text-white p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all mr-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="bg-[#FF512F]/20 p-2 rounded-lg border border-[#FF512F]/30">
            <MapIcon className="w-5 h-5 text-[#FF512F]" />
          </div>
          <h1 className="font-black text-xl tracking-tight text-white">旅遊打卡地圖</h1>
        </div>
      </header>

      <div className="bg-[#121212] border-b border-white/10 p-4 space-y-3 shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-200 uppercase tracking-widest">Gmail 帳號</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full bg-black border border-gray-500 rounded-lg p-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-amber-400 transition-all font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-200 uppercase tracking-widest">行程代碼 (Trip Code)</label>
            <input
              type="text"
              value={tripCode}
              onChange={(e) => setTripCode(e.target.value)}
              placeholder="TRIP2024"
              className="w-full bg-black border border-gray-500 rounded-lg p-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-amber-400 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          立即查詢
        </button>

        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${errorMessage ? 'text-red-400' : 'text-gray-200'}`}>
            {statusMessage}
          </span>
          {points.length > 0 && (
            <div className="flex gap-2">
              {COLOR_GROUPS.slice(0, Math.ceil(points.length / 10)).map((group, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: group.fill }} />
                  <span className="text-gray-300 font-bold">
                    #{idx * 10 + 1}-{Math.min((idx + 1) * 10, points.length)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer
          center={[23.5, 121]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundsUpdater bounds={bounds} />

          {points.map((point, index) => {
            const color = getGroupColor(index);
            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: white; border: 2.5px solid ${color.line}; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      <div style="background-color: ${color.fill}; width: 6px; height: 6px; border-radius: 50%;"></div>
                     </div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });

            return (
              <Marker key={point.id || index} position={[point.lat, point.lng]} icon={customIcon}>
                <Popup>
                  <div className="min-w-[160px] p-1 text-black">
                    <div className="font-bold mb-1 text-[#FF512F] text-sm">{point.locationName}</div>
                    <div className="text-[10px] text-gray-500 mb-2">
                      {new Date(point.timestamp).toLocaleString()}
                    </div>
                    {point.notes && (
                      <div className="text-xs text-gray-800 bg-gray-100 p-2 rounded mb-2 border-l-2 border-[#FF512F]">
                        {point.notes}
                      </div>
                    )}
                    <div className="text-[9px] text-gray-400 font-mono">
                      {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {routeCoordinates.length > 0 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#FF512F',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round',
                dashArray: '1, 8',
              }}
            />
          )}
        </MapContainer>

        <AnimatePresence>
          {points.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="bg-[#121212]/95 p-8 rounded-[32px] shadow-2xl border border-white/10 flex flex-col items-center gap-4 text-center max-w-[280px]">
                <div className="w-16 h-16 bg-amber-500/20 rounded-[20px] flex items-center justify-center border border-amber-500/30">
                  <MapIcon className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">地圖查詢</h3>
                  <p className="text-sm text-gray-200 mt-2 font-medium">
                    請輸入您的帳號資訊
                    <br />
                    以載入行程軌跡圖
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="bg-[#121212] border-t border-white/10 p-4 flex items-center justify-between shrink-0 mb-16 md:mb-0">
        <div className="flex items-center gap-2">
          {points.length > 0 ? (
            <>
              <div className="bg-white/10 text-amber-400 border border-amber-400/30 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
                {email.split('@')[0]} · {tripCode || '所有行程'}
              </div>
              <span className="text-xs text-gray-200 font-bold">共 {points.length} 個點</span>
            </>
          ) : (
            <span className="text-xs text-gray-200 font-bold italic flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> 等待載入資料...
            </span>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="text-gray-200 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
        >
          <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </footer>
    </div>
  );
}
