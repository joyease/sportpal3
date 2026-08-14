/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] border border-white/10 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-[#FF512F] to-[#DD2476] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                即刻加入愛動咖
              </h2>
              <p className="text-white/40 text-sm mb-10 leading-relaxed px-4">
                請登入以使用「打卡」與「紀錄」功能，開始您的精彩旅程
              </p>

              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-2xl font-black text-sm hover:bg-white/90 transition-all shadow-xl active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                使用 Google 帳號登入
              </button>
            </div>
            
            <div className="bg-white/[0.02] p-6 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest border-t border-white/5">
              SportPal • 點擊背景取消
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
