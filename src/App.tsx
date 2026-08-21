/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { CheckIn } from './components/CheckIn';
import { Records } from './components/Records';
import { HistoryTrend } from './components/HistoryTrend';
import { TravelMap } from './components/TravelMap';
import { FlagCollector } from './components/FlagCollector';
import { FlagMapView } from './components/FlagMapView';
import { JapanExplorer } from './components/JapanExplorer';
import { JapanPublicMap } from './components/JapanPublicMap';
import { Navigation } from './components/Navigation';
import { LoginModal } from './components/LoginModal';
import { User, CheckIn as CheckInData, SportRecord, Page, FlagMark, JapanVisit } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, User as UserIcon, Mail, Loader2, Map as MapIcon } from 'lucide-react';
import { auth, db, googleProvider, handleFirestoreError, OperationType, sendEmailVerification } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Real Data State
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [sportRecords, setSportRecords] = useState<SportRecord[]>([]);
  const [flagMarks, setFlagMarks] = useState<FlagMark[]>([]);
  const [japanVisits, setJapanVisits] = useState<JapanVisit[]>([]);

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

  // Firestore Sync - FlagMarks
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const q = query(collection(db, 'flag_marks'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as FlagMark);
        setFlagMarks(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'flag_marks')
    );
    return () => unsubscribe();
  }, [isLoggedIn, user]);

  // Firestore Sync - JapanVisits
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const q = query(collection(db, 'japan_visits'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as JapanVisit);
        setJapanVisits(data);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'japan_visits')
    );
    return () => unsubscribe();
  }, [isLoggedIn, user]);

  const handleTabChange = (tab: string) => {
    const page = tab as Page;
    if ((page === 'checkin' || page === 'records' || page === 'map' || page === 'flags') && !isLoggedIn) {
      setPendingTab(page);
      setIsLoginModalOpen(true);
    } else {
      setActiveTab(page);
    }
  };

  const handleToggleFlagMark = async (countryId: string, visited: boolean) => {
    if (!user) return;
    const path = 'flag_marks';
    const markId = `${user.id}_${countryId}`;
    try {
      const docRef = doc(db, path, markId);
      if (visited) {
        await setDoc(docRef, {
          id: markId,
          userId: user.id,
          userEmail: user.email.toLowerCase(),
          countryId,
          visited: true,
          timestamp: Date.now()
        });
      } else {
        await deleteDoc(docRef);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleToggleJapanVisit = async (prefId: string, currentCount: number) => {
    if (!user) return;
    const path = 'japan_visits';
    const visitId = `${user.id}_${prefId}`;
    
    let nextCount = 0;
    if (currentCount === 0) nextCount = 1;
    else if (currentCount === 1) nextCount = 2;  // Represents 2-5 range
    else if (currentCount === 2) nextCount = 6;  // Represents 6-9 range
    else if (currentCount === 6) nextCount = 10; // Represents 10+ range
    else nextCount = 0;

    try {
      const docRef = doc(db, path, visitId);
      if (nextCount > 0) {
        await setDoc(docRef, {
          id: visitId,
          userId: user.id,
          userEmail: user.email.toLowerCase(),
          prefectureId: prefId,
          count: nextCount,
          timestamp: Date.now()
        });
      } else {
        await deleteDoc(docRef);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setIsLoginModalOpen(false);
      
      // Check if email is verified
      if (result.user && !result.user.emailVerified) {
        // Automatically try to send verification if not verified
        try {
          await sendEmailVerification(result.user);
          setVerificationSent(true);
        } catch (vError: any) {
          console.error('Verification email failed:', vError);
          if (vError.code === 'auth/unauthorized-continue-uri') {
             // Handle domain auth issues
          }
        }
      }

      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorCode = error.code || 'unknown';
      const errorMessage = error.message || '無詳細訊息';
      
      if (errorCode === 'auth/unauthorized-domain') {
        alert(`網域授權失敗 (auth/unauthorized-domain)：\n請將 ${window.location.hostname} 加入 Firebase 控制台的 Authorized Domains。`);
      } else if (errorCode === 'auth/popup-closed-by-user') {
        // Silently handle popup closed
      } else if (errorCode === 'auth/cancelled-popup-request') {
        // Silently handle cancelled
      } else if (errorCode === 'auth/internal-error' || errorCode === 'auth/invalid-action-code' || errorMessage.includes('action is invalid')) {
        alert(`認證無效：請檢查您的網域是否已加入 Firebase 授權清單。\n代碼: ${errorCode}`);
      } else {
        alert(`登入失敗！\n錯誤代碼: ${errorCode}\n訊息: ${errorMessage}`);
      }
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setIsVerifying(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      alert('驗證信已寄出，請檢查您的收件夾');
    } catch (error) {
      console.error('Failed to send verification:', error);
      alert('發送失敗，請確認網域授權或稍後再試');
    } finally {
      setIsVerifying(false);
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

  const handleDeleteRecord = async (recordId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'sport_records', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sport_records/${recordId}`);
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
    // Shared Verification Banner
    const verificationBanner = isLoggedIn && auth.currentUser && !auth.currentUser.emailVerified && (
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-6 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-500 uppercase tracking-wider">電子郵件尚未驗證</h4>
            <p className="text-xs text-amber-200/70 leading-relaxed font-medium">
              為了防止惡意灌水，我們要求所有紀錄功能都必須經過 Email 驗證。請檢查您的 Gmail 收件夾。
            </p>
          </div>
        </div>
        <button
          onClick={handleResendVerification}
          disabled={isVerifying || verificationSent}
          className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-amber-400 transition-all disabled:opacity-50"
        >
          {isVerifying ? '發送中...' : verificationSent ? '已寄出，請檢查信箱' : '重新發送驗證信'}
        </button>
      </div>
    );

    switch (activeTab) {
      case 'home':
        return (
          <div className="flex flex-col">
            {activeTab === 'home' && verificationBanner && (
              <div className="px-6 pt-4">{verificationBanner}</div>
            )}
            <Home onSelectTab={(tab) => setActiveTab(tab as Page)} user={user} onLoginRequest={() => setIsLoginModalOpen(true)} />
          </div>
        );
      case 'checkin':
        return <CheckIn onSave={handleSaveCheckIn} />;
      case 'japan':
        return (
          <JapanExplorer 
            visits={japanVisits}
            onToggleVisit={handleToggleJapanVisit}
            isLoggedIn={isLoggedIn}
            onLoginRequest={() => setIsLoginModalOpen(true)}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'japan_map':
        return <JapanPublicMap onBack={() => setActiveTab('home')} />;
      case 'records':
        return <Records history={sportRecords} onSave={handleSaveRecord} onDelete={handleDeleteRecord} />;
      case 'map':
        return <TravelMap onBack={() => setActiveTab('home')} />;
      case 'flags':
        return (
          <FlagCollector 
            marks={flagMarks} 
            onToggleMark={handleToggleFlagMark} 
            isLoggedIn={isLoggedIn}
            onLoginRequest={() => setIsLoginModalOpen(true)}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'flag_map':
        return (
          <FlagMapView 
            onBack={() => setActiveTab('home')}
            userMarks={flagMarks}
            currentUserEmail={user?.email}
          />
        );
      case 'trend':
        return <HistoryTrend records={sportRecords} currentUserEmail={user?.email} onBack={() => setActiveTab('home')} onDeleteRecord={handleDeleteRecord} />;
      case 'profile':
        return (
          <div className="p-8 flex flex-col gap-8 bg-[#0A0A0A] min-h-screen">
            <header>
              <span className="font-mono text-xs tracking-[0.3em] text-[#FF512F] font-bold uppercase mb-2 block">USER PROFILE</span>
              <h2 className="text-4xl font-black tracking-tight text-white">個人中心</h2>
            </header>

            {verificationBanner}

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
                  <div className="col-span-2 bg-gradient-to-br from-[#FF512F] to-[#DD2476] rounded-[32px] p-8 text-white shadow-xl shadow-[#FF512F]/10">
                    <div className="text-xs font-black uppercase tracking-widest text-white/90 mb-2">打卡筆數</div>
                    <div className="text-4xl font-black tracking-tighter">{checkIns.length}</div>
                  </div>
                  <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 text-white">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-200 mb-2">記運動筆數</div>
                    <div className="text-4xl font-black tracking-tighter">{sportRecords.length}</div>
                  </div>
                  <div className="bg-[#121212] border border-white/5 rounded-[32px] p-8 text-white">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-200 mb-2">集國徽筆數</div>
                    <div className="text-4xl font-black tracking-tighter">{Object.keys(flagMarks).length}</div>
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
        return (
          <Home 
            onSelectTab={(tab) => {
              if (tab === 'map') setActiveTab('travel');
              else if (tab === 'trends') setActiveTab('trends');
              else if (tab === 'flag_map') setActiveTab('flag_map');
              else if (tab === 'japan_map') setActiveTab('japan_map');
              else setActiveTab('trends');
            }} 
            user={user} 
            onLoginRequest={() => {}}
          />
        );
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
