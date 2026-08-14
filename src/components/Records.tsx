/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { ClipboardList, Save, History, TrendingUp, Clock, Map, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface RecordsProps {
  onSave: (record: { type: string; duration: number; distance?: number; notes: string; timestamp?: number }) => void;
  history: any[];
}

export function Records({ onSave, history }: RecordsProps) {
  const [type, setType] = useState('跑步');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (type && duration) {
      // 如果用戶輸入了日期，我們需要將其轉換為時間戳，並補足當前時間的小時/分鐘
      let timestamp = Date.now();
      if (date) {
        const selectedDate = new Date(date);
        const now = new Date();
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        timestamp = selectedDate.getTime();
      }

      onSave({
        type,
        duration: Number(duration),
        distance: distance ? Number(distance) : undefined,
        notes,
        timestamp,
      });
      setDuration('');
      setDistance('');
      setNotes('');
      alert('紀錄已儲存！');
    }
  };

  const SPORT_TYPES = ['跑步', '登山', '騎車', '游泳', '健身', '其他'];

  return (
    <div className="flex flex-col gap-8 p-8 pb-32 bg-[#0A0A0A] min-h-screen">
      <header>
        <span className="font-mono text-xs tracking-[0.3em] text-[#00F2FE] font-bold uppercase mb-2 block">ACTIVITY LOGGING</span>
        <h2 className="text-4xl font-black tracking-tight text-white">運動紀錄</h2>
        <p className="text-gray-200 text-base mt-1 font-medium">追蹤您的運動成效與挑戰汗水</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-[#121212] rounded-[32px] p-8 shadow-2xl border border-white/5 flex flex-col gap-6">
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#00F2FE]" /> 運動日期 (YYYY/MM/DD)
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white focus:border-[#00F2FE] transition-all outline-none text-base font-medium"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2">
            運動項目
          </label>
          <div className="flex flex-wrap gap-2">
            {SPORT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                  type === t 
                    ? 'bg-[#00F2FE] text-black shadow-[0_4px_15px_-3px_rgba(0,242,254,0.4)]' 
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#00F2FE]" /> 時間 (MIN)
            </label>
            <input
              type="number"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#00F2FE] transition-all outline-none text-base font-medium"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
              <Map className="w-3.5 h-3.5 text-[#00F2FE]" /> 距離 (KM)
            </label>
            <input
              type="number"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.0"
              className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#00F2FE] transition-all outline-none text-base font-medium"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-gray-200 uppercase tracking-[0.3em] ml-2">
            心情 / 備註
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="紀錄一下今天的運動心情吧..."
            className="w-full bg-black border border-gray-500 rounded-2xl p-5 text-white placeholder:text-gray-400 focus:border-[#00F2FE] transition-all outline-none text-base font-medium h-32 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00F2FE] text-black py-5 rounded-2xl font-black tracking-widest uppercase text-sm shadow-[0_10px_30px_-10px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Save className="w-5 h-5 inline-block mr-2" />
          儲存運動紀錄
        </button>
      </form>

      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="font-black text-white text-sm uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-1 h-3 bg-[#00F2FE]"></div>
            最近紀錄
          </h3>
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">TOTAL {history.length}</span>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 text-center text-gray-300 font-bold uppercase tracking-widest text-sm">
              尚無紀錄
            </div>
          ) : (
            history.slice(0, 5).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#121212] p-6 rounded-[24px] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-black border border-white/5 rounded-2xl flex items-center justify-center group-hover:border-[#00F2FE]/20 transition-all">
                    <TrendingUp className="w-6 h-6 text-[#00F2FE]" />
                  </div>
                  <div>
                    <h4 className="font-black text-white tracking-tight uppercase text-base">{item.type}</h4>
                    <p className="text-xs font-mono text-gray-300 uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#00F2FE] tracking-tighter">{item.duration}<span className="text-xs font-mono ml-1 text-gray-300">M</span></div>
                  {item.distance && <div className="text-xs font-mono text-gray-200 uppercase tracking-tighter">{item.distance} KM</div>}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
