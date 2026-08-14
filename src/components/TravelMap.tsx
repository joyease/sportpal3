import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, RefreshCw, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = [
  { key: 'blue', line: '#2563eb', fill: '#3b82f6', label: '藍' },
  { key: 'red', line: '#dc2626', fill: '#ef4444', label: '紅' },
  { key: 'black', line: '#1a1f1c', fill: '#374151', label: '黑' },
  { key: 'purple', line: '#9333ea', fill: '#a855f7', label: '紫' },
];

function colorForIndex(i: number) {
  return COLORS[Math.floor(i / 10) % COLORS.length];
}

interface MapRecord {
  lat: number;
  lng: number;
  userEmail: string;
  locationName: string;
  notes?: string;
  timestamp: number;
  tripcode: string;
}

// Map Updater Component to handle bounds
function MapBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [bounds, map]);
  return null;
}

export function TravelMap() {
  const [email, setEmail] = useState('');
  const [tripcode, setTripcode] = useState('');
  const [records, setRecords] = useState<MapRecord[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('請輸入 Gmail 與行程代碼後按查詢');
  const [error, setError] = useState<string | null>(null);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  // Load last searched tripcode from local storage
  useEffect(() => {
    const savedTripcode = localStorage.getItem('sportpal_tripcode');
    const savedEmail = localStorage.getItem('sportpal_last_email');
    if (savedTripcode) setTripcode(savedTripcode);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const getRoadCoords = async (a: [number, number], b: [number, number]) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      }
      return [a, b];
    } catch {
      return [a, b];
    }
  };

  const doSearch = async () => {
    if (!email || !tripcode) {
      setError('請輸入完整資訊');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('正在從雲端讀取行程軌跡...');
    setRecords([]);
    setRouteCoords([]);
    setBounds(null);

    // Save to local storage
    localStorage.setItem('sportpal_last_email', email);
    localStorage.setItem('sportpal_tripcode', tripcode);

    try {
      const searchEmail = email.trim();
      const searchTripcode = tripcode.trim();

      let q;
      if (searchTripcode) {
        q = query(
          collection(db, 'check_ins'),
          where('userEmail', '==', searchEmail),
          where('tripcode', '==', searchTripcode)
        );
      } else {
        q = query(
          collection(db, 'check_ins'),
          where('userEmail', '==', searchEmail)
        );
      }
      
      let querySnapshot = await getDocs(q);

      // If no docs found and searchEmail has uppercase letters, try lowercase as fallback
      if (querySnapshot.empty && searchEmail !== searchEmail.toLowerCase()) {
        if (searchTripcode) {
          q = query(
            collection(db, 'check_ins'),
            where('userEmail', '==', searchEmail.toLowerCase()),
            where('tripcode', '==', searchTripcode)
          );
        } else {
          q = query(
            collection(db, 'check_ins'),
            where('userEmail', '==', searchEmail.toLowerCase())
          );
        }
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        setStatus('找不到此帳號與行程的打卡紀錄');
        setIsLoading(false);
        return;
      }

      const rows: MapRecord[] = [];
      querySnapshot.forEach((doc) => {
        rows.push(doc.data() as MapRecord);
      });

      // Sort by timestamp ascending in memory
      rows.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      setRecords(rows);

      // Set map bounds
      if (rows.length > 0) {
        const latLngs = rows.map(r => L.latLng(r.lat, r.lng));
        setBounds(L.latLngBounds(latLngs));
      }

      // Calculate route segments
      if (rows.length >= 2) {
        setStatus('正在規劃路徑軌跡...');
        const allSegments: [number, number][] = [];
        for (let i = 0; i < rows.length - 1; i++) {
          const seg = await getRoadCoords([rows[i].lat, rows[i].lng], [rows[i+1].lat, rows[i+1].lng]);
          allSegments.push(...seg);
        }
        setRouteCoords(allSegments as [number, number][]);
      }

      setStatus(`✓ 共載入 ${rows.length} 個位置，行程軌跡已更新`);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('查詢失敗: ' + (err.message || '未知錯誤'));
      setStatus('查詢發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="bg-[#121212] text-white p-4 flex items-center gap-3 border-b border-white/10 shrink-0">
        <div className="bg-[#FF512F]/20 p-2 rounded-lg border border-[#FF512F]/30">
          <MapPin className="w-5 h-5 text-[#FF512F]" />
        </div>
        <h1 className="font-black text-xl tracking-tight text-white">旅遊打卡地圖</h1>
      </header>

      {/* Query Panel */}
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
              value={tripcode}
              onChange={(e) => setTripcode(e.target.value)}
              placeholder="TRIP2024"
              className="w-full bg-black border border-gray-500 rounded-lg p-2.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-amber-400 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={doSearch}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          立即查詢
        </button>

        <div className="flex items-center justify-between text-xs">
          <span className={`font-medium ${error ? 'text-red-400' : 'text-gray-200'}`}>
            {status}
          </span>
          {records.length > 0 && (
            <div className="flex gap-2">
              {COLORS.slice(0, Math.ceil(records.length / 10)).map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.fill }}></div>
                  <span className="text-gray-300 font-bold">#{i * 10 + 1}-{Math.min((i + 1) * 10, records.length)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
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
          
          <MapBounds bounds={bounds} />

          {/* Markers */}
          {records.map((r, idx) => {
            const color = colorForIndex(idx);
            return (
              <Marker 
                key={idx} 
                position={[r.lat, r.lng]}
                icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `<div style="background-color: white; border: 2.5px solid ${color.line}; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                          <div style="background-color: ${color.fill}; width: 6px; height: 6px; border-radius: 50%;"></div>
                         </div>`,
                  iconSize: [14, 14],
                  iconAnchor: [7, 7]
                })}
              >
                <Popup>
                  <div className="min-w-[160px] p-1">
                    <div className="font-bold mb-1 text-[#FF512F] text-sm">{r.locationName}</div>
                    <div className="text-[10px] text-gray-500 mb-2">{new Date(r.timestamp).toLocaleString()}</div>
                    {r.notes && <div className="text-xs text-gray-800 bg-gray-100 p-2 rounded mb-2 border-l-2 border-[#FF512F]">{r.notes}</div>}
                    <div className="text-[9px] text-gray-400 font-mono">{r.lat.toFixed(5)}, {r.lng.toFixed(5)}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route Line */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: '#FF512F',
                weight: 4,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round',
                dashArray: '1, 8'
              }}
            />
          )}
        </MapContainer>

        <AnimatePresence>
          {records.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none"
            >
              <div className="bg-[#121212]/95 p-8 rounded-[32px] shadow-2xl border border-white/10 flex flex-col items-center gap-4 text-center max-w-[280px]">
                <div className="w-16 h-16 bg-amber-500/20 rounded-[20px] flex items-center justify-center border border-amber-500/30">
                  <MapPin className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">地圖查詢</h3>
                  <p className="text-sm text-gray-200 mt-2 font-medium">請輸入您的帳號資訊<br/>以載入行程軌跡圖</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Toolbar */}
      <footer className="bg-[#121212] border-t border-white/10 p-4 flex items-center justify-between shrink-0 mb-16 md:mb-0">
        <div className="flex items-center gap-2">
          {records.length > 0 ? (
            <>
              <div className="bg-white/10 text-amber-400 border border-amber-400/30 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
                {email.split('@')[0]} · {tripcode || '所有行程'}
              </div>
              <span className="text-xs text-gray-200 font-bold">共 {records.length} 個點</span>
            </>
          ) : (
            <span className="text-xs text-gray-200 font-bold italic flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-400" /> 等待載入資料...
            </span>
          )}
        </div>
        
        <button 
          onClick={doSearch}
          className="text-gray-200 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </footer>
    </div>
  );
}
