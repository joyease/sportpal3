/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CheckInProps {
  onSave: (location: { lat: number; lng: number; name: string; notes: string; tripcode: string }) => void;
}

export function CheckIn({ onSave }: CheckInProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [tripcode, setTripcode] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tripcode from local storage
  useEffect(() => {
    const savedTripcode = localStorage.getItem('sportpal_tripcode');
    if (savedTripcode) {
      setTripcode(savedTripcode);
    }
  }, []);

  // Save tripcode to local storage
  const handleTripcodeChange = (value: string) => {
    setTripcode(value);
    localStorage.setItem('sportpal_tripcode', value);
  };

  const getGPS = () => {
    setIsLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('您的瀏覽器不支援定位功能');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError('無法取得位置: ' + err.message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    if (coords && locationName) {
      onSave({ ...coords, name: locationName, notes, tripcode });
      setLocationName('');
      setNotes('');
      setCoords(null);
      alert('打卡成功！');
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 pb-32 bg-[#0A0A0A] min-h-screen">
      <header>
        <span className="font-mono text-xs tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-2 block">ADVENTURE CHECK-IN</span>
        <h2 className="text-4xl font-black tracking-tight text-white">運動打卡</h2>
        <p className="text-gray-200 text-base mt-1 font-medium">紀錄您當前的位置與精彩景點</p>
      </header>

      <div className="bg-[#121212] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col gap-8">
        <div className="h-56 bg-black rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden group">
          {coords ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6"
            >
              <div className="w-16 h-16 bg-[#FF512F]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FF512F]/20">
                <MapPin className="w-8 h-8 text-[#FF512F]" />
              </div>
              <div className="text-sm font-mono text-gray-200 space-y-1">
                <div className="flex justify-between gap-4 border-b border-white/5 pb-1">
                  <span className="text-gray-300 uppercase tracking-widest font-bold">LAT</span>
                  <span className="text-white font-bold">{coords.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between gap-4 pt-1">
                  <span className="text-gray-300 uppercase tracking-widest font-bold">LNG</span>
                  <span className="text-white font-bold">{coords.lng.toFixed(6)}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-6">
              <Navigation className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-300 uppercase tracking-[0.2em]">等待 GPS 信號...</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-md flex items-center justify-center z-20">
              <Loader2 className="w-10 h-10 text-[#FF512F] animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={getGPS}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white py-5 rounded-2xl font-black tracking-widest uppercase text-sm shadow-[0_10px_30px_-10px_rgba(255,81,47,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? '定位中...' : '獲取目前位置'}
        </button>

        {error && (
          <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
        )}

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2">
            行程代碼 (Trip Code)
          </label>
          <input
            type="text"
            value={tripcode}
            onChange={(e) => handleTripcodeChange(e.target.value)}
            placeholder="例如：TW2024-SUMMER (將自動儲存)"
            className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#FF512F] transition-all outline-none text-base font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2">
            景點名稱
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="例如：合歡山主峰"
            className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#FF512F] transition-all outline-none text-base font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2">
            心得 / 筆記
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="紀錄一下當下的心情吧..."
            rows={3}
            className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#FF512F] transition-all outline-none text-base font-medium resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!coords || !locationName}
          className="w-full bg-white text-black py-5 rounded-2xl font-black tracking-widest uppercase text-sm hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-20"
        >
          <Save className="w-5 h-5" />
          儲存打卡紀錄
        </button>
      </div>

      <div className="bg-[#121212] border border-white/5 rounded-3xl p-8">
        <h3 className="font-black text-white text-sm uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <div className="w-1 h-3 bg-[#FF512F]"></div>
          打卡貼士
        </h3>
        <ul className="text-sm text-gray-200 space-y-4 font-medium leading-relaxed">
          <li className="flex gap-4">
            <span className="text-[#FF512F] font-mono font-bold">01</span>
            請確保開啟手機的 GPS 定位權限。
          </li>
          <li className="flex gap-4">
            <span className="text-[#FF512F] font-mono font-bold">02</span>
            在室外空曠處獲取的座標會更精準。
          </li>
          <li className="flex gap-4">
            <span className="text-[#FF512F] font-mono font-bold">03</span>
            打卡成功後，紀錄將同步至雲端帳號。
          </li>
        </ul>
      </div>
    </div>
  );
}
