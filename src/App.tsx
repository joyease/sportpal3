/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CheckIn } from './components/CheckIn';
import { Records } from './components/Records';
import { Navigation } from './components/Navigation';
import { LoginModal } from './components/LoginModal';
import { TravelMap } from './components/TravelMap';
import { User, CheckIn as CheckInData, SportRecord, Page } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  // Real Data State
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [sportRecords, setSportRecords] = useState<SportRecord[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '愛動玩家',
          picture: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
        };
        
        // Sync user to Firestore
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), userData, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
        }
        
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setCheckIns([]);
        setSportRecords([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync - CheckIns
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const q = query(collection(db, 'check_ins'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckInData));
        setCheckIns(data.sort((a, b) => b.timestamp - a.timestamp));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'check_ins')
    );
    return () => unsubscribe();
  }, [isLoggedIn, user]);

  // Firestore Sync - SportRecords
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const q = query(collection(db, 'sport_records'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SportRecord));
        setSportRecords(data.sort((a, b) => b.timestamp - a.timestamp));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'sport_records')
    );
    return () => unsubscribe();
  }, [isLoggedIn, user]);

  const handleTabChange = (tab: string) => {
    const page = tab as Page;
    if ((page === 'checkin' || page === 'records') && !isLoggedIn) {
      setPendingTab(page);
      setIsLoginModalOpen(true);
    } else {
      setActiveTab(page);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoginModalOpen(false);
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('登入失敗，請稍後再試');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveCheckIn = async (loc: { lat: number; lng: number; name: string; notes: string; tripcode: string }) => {
    if (!user) return;
    const path = 'check_ins';
    try {
      const docRef = doc(collection(db, path));
      const newCheckIn: CheckInData = {
        id: docRef.id,
        userId: user.id,
        userEmail: user.email,
        tripcode: loc.tripcode,
        lat: loc.lat,
        lng: loc.lng,
        locationName: loc.name,
        notes: loc.notes,
        timestamp: Date.now(),
      };
      await setDoc(docRef, newCheckIn);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSaveRecord = async (rec: { type: string; duration: number; distance?: number; notes: string; timestamp?: number }) => {
    if (!user) return;
    const path = 'sport_records';
    try {
      const docRef = doc(collection(db, path));
      const finalTimestamp = rec.timestamp || Date.now();
      const newRecord: SportRecord = {
        id: docRef.id,
        userId: user.id,
        userEmail: user.email,
        type: rec.type,
        duration: rec.duration,
        distance: rec.distance,
        notes: rec.notes,
        date: new Date(finalTimestamp).toISOString(),
        timestamp: finalTimestamp,
      };
      await setDoc(docRef, newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="w-10 h-10 text-[#FF512F] animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onSelectTab={(tab) => setActiveTab(tab as Page)} />;
      case 'checkin':
        return <CheckIn onSave={handleSaveCheckIn} />;
      case 'records':
        return <Records history={sportRecords} onSave={handleSaveRecord} />;
      case 'map':
        return <TravelMap />;
      case 'profile':
        return (
          <div className="p-8 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
            <header>
              <span className="font-mono text-xs tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-2 block">USER PROFILE</span>
              <h2 className="text-4xl font-black tracking-tight text-white">個人中心</h2>
            </header>

            {isLoggedIn && user ? (
              <div className="space-y-8">
                <div className="bg-[#121212] rounded-[32px] p-8 shadow-2xl border border-white/5 flex items-center gap-5">
                  <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-[24px] bg-white/5 border border-white/10 p-1" />
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                    <div className="flex items-center gap-2 text-gray-200 text-sm mt-1 font-medium">
                      <Mail className="w-4 h-4 text-gray-300" /> {user.email}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#FF512F] to-[#DD2476] rounded-[32px] p-8 text-white shadow-xl shadow-[#FF512F]/10">
                    <div className="text-xs font-black uppercase tracking-widest text-white/90 mb-2">打卡</div>
                    <div className="text-4xl font-black tracking-tighter">{checkIns.length}</div>
                  </div>
                  <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 text-white">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-200 mb-2">紀錄</div>
                    <div className="text-4xl font-black tracking-tighter">{sportRecords.length}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full bg-white/10 text-gray-100 py-5 rounded-2xl font-black tracking-widest uppercase text-base hover:bg-white/20 hover:text-white transition-all flex items-center justify-center gap-3 border border-white/10"
                >
                  <LogOut className="w-5 h-5" />
                  登出帳號
                </button>
              </div>
            ) : (
              <div className="bg-[#121212] rounded-[32px] p-12 shadow-2xl border border-white/5 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <UserIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">尚未登入</h3>
                <p className="text-base text-gray-200 mb-10 leading-relaxed font-medium">登入後即可開始紀錄您的運動足跡，並將資料安全同步至雲端。</p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-white text-black px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-sm hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
                >
                  立即登入
                </button>
              </div>
            )}

            <div className="mt-4 p-8 bg-[#121212] border border-white/5 rounded-[32px] space-y-4">
              <h4 className="font-black text-white text-sm uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1 h-3 bg-green-500"></div>
                雲端同步保護
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed font-medium">
                您的運動紀錄與位置資訊已與 Google 帳號安全同步。您可以隨時在不同裝置上存取您的紀錄。我們使用最高規格的加密技術保護您的數據。
              </p>
            </div>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans text-white max-w-md mx-auto relative overflow-x-hidden border-x border-white/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <Navigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isLoggedIn={isLoggedIn}
      />

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
