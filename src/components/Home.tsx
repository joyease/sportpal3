/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import mountainsBanner from '../assets/images/taiwan_mountains_banner_1786595545117.jpg';
import townshipsBanner from '../assets/images/taiwan_townships_banner_1786595556925.jpg';
import travelBanner from '../assets/images/travel_checkin_banner_1786595567526.jpg';
import historyBanner from '../assets/images/sports_record_banner_1786595579220.jpg';
import sportpalAvatarIcon from '../assets/images/sportpal_avatar_icon_1786697460164.jpg';

import { User } from '../types';
import { Search, ChevronRight, User as UserIcon } from 'lucide-react';

const SECTIONS = [
  {
    id: 'mountains',
    title: '台灣小百岳',
    eyebrow: 'TOP 100 PEAKS',
    color: '#FF512F',
    bgColor: 'rgba(95, 15, 15, 0.75)', // 勃根地紅
    desc: '挑戰台灣巔峰時刻。',
    image: mountainsBanner,
    link: 'https://joyease.github.io/peak100/index.html',
  },
  {
    id: 'japan_map',
    title: '日本47地通',
    eyebrow: 'JAPAN EXPLORER',
    color: '#FF5E62',
    bgColor: 'rgba(95, 45, 15, 0.75)', // 深琥珀橙
    desc: '探索日本各地區魅力地圖。',
    image: travelBanner,
    link: '#',
  },
  {
    id: 'flag_map',
    title: '旅遊集國旗',
    eyebrow: 'WORLD FLAG COLLECTION',
    color: '#FFD700',
    bgColor: 'rgba(75, 45, 25, 0.75)', // 咖啡棕
    desc: '收集各國國旗，點亮全球足跡。',
    image: townshipsBanner,
    link: '#',
  },
  {
    id: 'travel',
    title: '旅遊打卡地圖',
    eyebrow: 'ADVENTURE MAP',
    color: '#F9D423',
    bgColor: 'rgba(15, 75, 35, 0.75)', // 森林綠
    desc: '紀錄旅程足跡與推薦行程。',
    image: travelBanner,
    link: 'https://aidusu.github.io/3kingdom/260517trackin2.html',
  },
  {
    id: 'history',
    title: '全年運動歷程',
    eyebrow: 'ACTIVITY LOG',
    color: '#00F2FE',
    bgColor: 'rgba(15, 35, 95, 0.75)', // 午夜藍
    desc: '見證一年來的汗水與成就。',
    image: historyBanner,
    link: 'https://sportpal-4a832.web.app/260813historytrend.html',
  },
  {
    id: 'light_tw',
    title: '運動點亮台灣',
    eyebrow: 'LIGHT UP TAIWAN',
    color: '#FFD700',
    bgColor: 'rgba(65, 15, 95, 0.75)', // 深羅蘭紫
    desc: '用運動點亮台灣地圖。',
    image: mountainsBanner,
    link: 'https://www.mysports.net.tw/mHealthWebportal/event/2603LightTW3.html',
  },
];

interface HomeProps {
  onSelectTab: (tab: string) => void;
  user: User | null;
  onLoginRequest: () => void;
}

export function Home({ onSelectTab, user, onLoginRequest }: HomeProps) {
  const handleProfileClick = () => {
    if (user) {
      onSelectTab('profile');
    } else {
      onLoginRequest();
    }
  };

  return (
    <div className="flex flex-col bg-[#D1D1D1] min-h-screen pb-32">
      <header className="h-20 flex justify-between items-center px-6 bg-[#121212] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#FF512F] to-[#DD2476] rounded-lg flex items-center justify-center font-black text-white transform rotate-12 shrink-0">
            S
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white truncate">
            MySportsPal
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90 group overflow-hidden"
            title={user ? "個人中心" : "登入"}
          >
            {user ? (
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />
            )}
          </button>

          <a 
            href="https://sportpal.hermann.tw/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FF512F]/40 transition-all shadow-lg active:scale-95 group"
            title="前往關於頁面"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#FF512F]/60 shrink-0 bg-[#1A1A1A]">
              <img 
                src={sportpalAvatarIcon} 
                alt="愛動咖 My Sports Pal" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-bold text-gray-200 group-hover:text-white tracking-wider">
              關於
            </span>
          </a>
        </div>
      </header>

      {/* Header spacer with subtitle */}
      <div className="py-4 flex items-center bg-[#D1D1D1] px-12 md:px-24">
        <span className="text-sm font-black text-black tracking-[0.1em]">
          愛動咖: 運動旅遊愛打卡
        </span>
      </div>

      <main className="flex-1 flex flex-col px-4 md:px-8 gap-2">
        {SECTIONS.map((section, index) => {
          const isInternal = (section.id === 'flag_map' || section.id === 'travel' || section.id === 'history' || section.id === 'japan_map') && onSelectTab;
          
          const Content = (
            <div className="relative w-full h-full flex flex-col justify-center px-8 md:px-16 overflow-hidden rounded-[24px]">
              <img
                src={section.image}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
              />
              <div 
                className="absolute inset-0 transition-colors duration-500" 
                style={{ backgroundColor: (section as any).bgColor }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
              
              <div className="relative z-10 flex flex-col">
                <span 
                  className="font-mono text-[10px] tracking-[0.3em] mb-1 font-bold uppercase"
                  style={{ color: section.color }}
                >
                  {section.eyebrow}
                </span>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-0.5 group-hover:translate-x-2 transition-transform duration-300">
                  {section.title}
                </h2>
                <p className="text-gray-400 text-[10px] md:text-xs font-medium max-w-xs md:max-w-md">
                  {section.desc}
                </p>
              </div>
            </div>
          );

          if (isInternal) {
            const targetTab = section.id === 'flag_map' ? 'flag_map' : 
                            section.id === 'japan_map' ? 'japan_map' :
                            section.id === 'travel' ? 'map' : 'trend';
            return (
              <motion.div
                key={section.id}
                onClick={() => onSelectTab(targetTab)}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-[85px] shrink-0 cursor-pointer"
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[85px] shrink-0 cursor-pointer"
            >
              {Content}
            </motion.a>
          );
        })}

        {/* Footer spacer */}
        <div className="h-2 bg-[#D1D1D1] shrink-0" />
      </main>
    </div>
  );
}
