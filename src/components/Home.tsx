/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import mountainsBanner from '../assets/images/taiwan_mountains_banner_1786595545117.jpg';
import townshipsBanner from '../assets/images/taiwan_townships_banner_1786595556925.jpg';
import travelBanner from '../assets/images/travel_checkin_banner_1786595567526.jpg';
import historyBanner from '../assets/images/sports_record_banner_1786595579220.jpg';

import { User as UserIcon } from 'lucide-react';
import { User } from '../types';

const SECTIONS = [
  {
    id: 'mountains',
    title: '台灣小百岳',
    eyebrow: 'TOP 100 PEAKS',
    color: '#FF512F',
    desc: '探索台灣最美的高山步道，挑戰自我的巔峰時刻。',
    image: mountainsBanner,
    link: 'https://joyease.github.io/mymap/2608small100hills.html',
  },
  {
    id: 'flag_map',
    title: '旅遊集國旗',
    eyebrow: 'WORLD FLAG COLLECTION',
    color: '#FFD700',
    desc: '環遊世界，收集每一個造訪國家的國旗，點亮您的全球足跡。',
    image: townshipsBanner,
    link: '#',
  },
  {
    id: 'travel',
    title: '旅遊打卡地圖',
    eyebrow: 'ADVENTURE MAP',
    color: '#F9D423',
    desc: '為您的旅程留下足跡，精選熱門打卡熱點與推薦行程。',
    image: travelBanner,
    link: 'https://aidusu.github.io/3kingdom/260517trackin2.html',
  },
  {
    id: 'history',
    title: '全年運動歷程',
    eyebrow: 'ACTIVITY LOG',
    color: '#00F2FE',
    desc: '可視化您的運動成果，見證這一年來的汗水與成就。',
    image: historyBanner,
    link: 'https://sportpal-4a832.web.app/260813historytrend.html',
  },
];

interface HomeProps {
  onSelectTab?: (tab: string) => void;
  user: User | null;
}

export function Home({ onSelectTab, user }: HomeProps) {
  return (
    <div className="flex flex-col bg-[#0A0A0A] min-h-screen pb-32">
      <header className="h-20 flex justify-between items-center px-8 bg-[#121212] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#FF512F] to-[#DD2476] rounded-lg flex items-center justify-center font-black text-white transform rotate-12">
            S
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            SportPal <span className="text-[#FF512F]">愛動咖</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <div 
              className="w-10 h-10 rounded-full border-2 border-[#FF512F] overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-lg shadow-[#FF512F]/20"
              onClick={() => onSelectTab?.('profile')}
            >
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <button 
              onClick={() => onSelectTab?.('profile')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {SECTIONS.map((section, index) => {
          if ((section.id === 'flag_map' || section.id === 'travel' || section.id === 'history') && onSelectTab) {
            const targetTab = section.id === 'flag_map' ? 'flag_map' : 
                            section.id === 'travel' ? 'map' : 'trend';
            return (
              <motion.div
                key={section.id}
                onClick={() => onSelectTab(targetTab)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex-1 min-h-[160px] border-b border-white/5 overflow-hidden cursor-pointer flex flex-col justify-center px-8 md:px-16"
              >
                <img
                  src={section.image}
                  alt={section.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                
                <div className="relative z-10 flex flex-col">
                  <span 
                    className="font-mono text-xs tracking-[0.3em] mb-1 font-bold uppercase"
                    style={{ color: section.color }}
                  >
                    {section.eyebrow}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-1 group-hover:translate-x-2 transition-transform duration-300">
                    {section.title}
                  </h2>
                  <p className="text-gray-200 text-sm md:text-base font-medium max-w-xs md:max-w-md line-clamp-2">
                    {section.desc}
                  </p>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.a
              key={section.id}
              href={section.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative flex-1 min-h-[160px] border-b border-white/5 overflow-hidden cursor-pointer flex flex-col justify-center px-8 md:px-16"
            >
              <img
                src={section.image}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              
              <div className="relative z-10 flex flex-col">
                <span 
                  className="font-mono text-xs tracking-[0.3em] mb-1 font-bold uppercase"
                  style={{ color: section.color }}
                >
                  {section.eyebrow}
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-1 group-hover:translate-x-2 transition-transform duration-300">
                  {section.title}
                </h2>
                <p className="text-gray-200 text-sm md:text-base font-medium max-w-xs md:max-w-md line-clamp-2">
                  {section.desc}
                </p>
              </div>
            </motion.a>
          );
        })}
      </main>
    </div>
  );
}
