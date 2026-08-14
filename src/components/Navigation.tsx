/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home as HomeIcon, MapPin, ClipboardList, User as UserIcon, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

type NavItem = {
  id: string;
  label: string;
  icon: typeof HomeIcon;
};

const ITEMS: NavItem[] = [
  { id: 'home', label: '首頁', icon: HomeIcon },
  { id: 'checkin', label: '打卡', icon: MapPin },
  { id: 'map', label: '地圖', icon: MapIcon },
  { id: 'records', label: '紀錄', icon: ClipboardList },
  { id: 'profile', label: '我的', icon: UserIcon },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isLoggedIn: boolean;
}

export function Navigation({ activeTab, onTabChange, isLoggedIn }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#121212]/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 pb-10 z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                isActive ? "text-[#FF512F]" : "text-gray-300 hover:text-white"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center",
                isActive ? "bg-white/10 shadow-inner" : "bg-transparent"
              )}>
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.8px]")} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                {item.id === 'profile' ? (isLoggedIn ? '已登入' : '我的') : item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-nav-dot"
                  className="absolute -top-1 w-1 h-1 bg-[#FF512F] rounded-full shadow-[0_0_8px_#FF512F]" 
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
