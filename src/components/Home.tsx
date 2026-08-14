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
    desc: '挑戰台灣巔峰時刻。',
    image: mountainsBanner,
    link: 'https://joyease.github.io/mymap/2608small100hills.html',
  },
  {
    id: 'japan',
    title: '日本47地通',
    eyebrow: 'JAPAN EXPLORER',
    color: '#FF5E62',
    desc: '探索日本各地區魅力地圖。',
    image: travelBanner,
    link: 'https://joyease.github.io/game/2603LightJP.html',
  },
  {
    id: 'flag_map',
    title: '旅遊集國旗',
    eyebrow: 'WORLD FLAG COLLECTION',
    color: '#FFD700',
    desc: '收集各國國旗，點亮全球足跡。',
    image: townshipsBanner,
    link: '#',
  },
  {
    id: 'travel',
    title: '旅遊打卡地圖',
    eyebrow: 'ADVENTURE MAP',
    color: '#F9D423',
    desc: '紀錄旅程足跡與推薦行程。',
    image: travelBanner,
    link: 'https://aidusu.github.io/3kingdom/260517trackin2.html',
  },
  {
    id: 'history',
    title: '全年運動歷程',
    eyebrow: 'ACTIVITY LOG',
    color: '#00F2FE',
    desc: '見證一年來的汗水與成就。',
    image: historyBanner,
    link: 'https://sportpal-4a832.web.app/260813historytrend.html',
  },
  {
    id: 'light_tw',
    title: '運動點亮台灣',
    eyebrow: 'LIGHT UP TAIWAN',
    color: '#FFD700',
    desc: '用運動點亮台灣地圖。',
    image: mountainsBanner,
    link: 'https://www.mysports.net.tw/mHealthWebportal/event/2603LightTW3.html',
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
          <a 
            href="https://sportpal.hermann.tw/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all shadow-lg active:scale-95"
            title="前往 SportPal"
          >
            <img 
              src="https://sportpal.hermann.tw/favicon.ico" 
              alt="SportPal Icon" 
              className="w-6 h-6 object-contain"
              onError={(e) => {
                // Fallback to a user icon if favicon is not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex');
              }}
            />
            <UserIcon className="w-5 h-5 text-gray-400 hidden" />
          </a>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {SECTIONS.map((section, index) => {
          const isInternal = (section.id === 'flag_map' || section.id === 'travel' || section.id === 'history') && onSelectTab;
          
          const Content = (
            <>
              <img
                src={section.image}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              
              <div className="relative z-10 flex flex-col">
                <span 
                  className="font-mono text-[10px] tracking-[0.3em] mb-1 font-bold uppercase"
                  style={{ color: section.color }}
                >
                  {section.eyebrow}
                </span>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white mb-0.5 group-hover:translate-x-2 transition-transform duration-300">
                  {section.title}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm font-medium max-w-xs md:max-w-md">
                  {section.desc}
                </p>
              </div>
            </>
          );

          if (isInternal) {
            const targetTab = section.id === 'flag_map' ? 'flag_map' : 
                            section.id === 'travel' ? 'map' : 'trend';
            return (
              <motion.div
                key={section.id}
                onClick={() => onSelectTab(targetTab)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex-1 min-h-[130px] border-b border-white/5 overflow-hidden cursor-pointer flex flex-col justify-center px-8 md:px-16"
              >
                {Content}
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
              className="group relative flex-1 min-h-[130px] border-b border-white/5 overflow-hidden cursor-pointer flex flex-col justify-center px-8 md:px-16"
            >
              {Content}
            </motion.a>
          );
        })}
      </main>
    </div>
  );
}
