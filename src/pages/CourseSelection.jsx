import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bone, LucideBook, Activity, Flame, Droplets, Layers, Settings2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { motion as Motion, useMotionValue, AnimatePresence } from 'framer-motion';

const courses = [
  { id: 'anatomy', name: 'Anatomy', color: '#F56565', backgroundColor: 'bg-pink-800' },
  { id: 'physiology', name: 'Physiology', color: '#FFBF33', backgroundColor: 'bg-yellow-300' },
  { id: 'biochemistry', name: 'Biochemistry', color: '#10b981', backgroundColor: 'bg-green-400' },
];

const CourseSelection = ({ user, db }) => {
  const navigate = useNavigate();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoals, setTempGoals] = useState(user?.dailyGoals || { anatomy: 0, physiology: 0, biochemistry: 0 });

  // --- 3D & RUBBER BANDING STATE ---
  const y = useMotionValue(0);
  

  useEffect(() => {
    const handleDailyReset = async () => {
      if (!user?.uid || !db) return;
      const today = new Date().toISOString().split('T')[0];
      const lastDate = user?.lastStudyDate;

      if (lastDate !== today) {
        const userRef = doc(db, "users", user.uid);
        let currentStreak = user?.streak || 0;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate !== yesterdayStr && lastDate !== null) {
          currentStreak = 0; 
        }

        await updateDoc(userRef, {
          dailyProgress: { anatomy: 0, physiology: 0, biochemistry: 0 },
          lastStudyDate: today,
          streak: currentStreak
        });
      }
    };
    handleDailyReset();
  }, [user?.uid, user?.lastStudyDate, user?.streak, db]);

  const dailyGoals = user?.dailyGoals || { anatomy: 1, physiology: 1, biochemistry: 1 };
  const dailyProgress = user?.dailyProgress || { anatomy: 0, physiology: 0, biochemistry: 0 };

  // --- NESTED RING MATH ---
  const ringConfig = courses.map((course, i) => {
    const radius = 70 - i * 18; // Each ring is 18px smaller
    const circumference = 2 * Math.PI * radius;
    const goal = dailyGoals[course.id] || 1;
    const progress = dailyProgress[course.id] || 0;
    const percentage = Math.min(progress / goal, 1);
    
    return {
      ...course,
      radius,
      circumference,
      strokeDash: percentage * circumference
    };
  });

  const saveGoals = async () => {
    if (!user?.uid) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { dailyGoals: tempGoals });
      setShowGoalModal(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden p-4 md:p-8 font-serif" style={{ perspective: '1200px' }}>
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <AnimatePresence>
        {showGoalModal && (
          <Motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-hidden flex items-center justify-center p-4"
          >
            <Motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111] border border-white/20 p-6 rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings2 size={20}/> Set Goals</h3>
              {courses.map(c => (
                <div key={c.id} className="mb-3">
                  <label className="text-[10px] font-bold uppercase text-gray-400">{c.name}</label>
                  <input 
                    type="number" 
                    value={tempGoals[c.id]} 
                    onChange={(e) => setTempGoals({...tempGoals, [c.id]: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/5 p-2 rounded-lg border border-white/10 outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              ))}
              <button onClick={saveGoals} className="w-full bg-white p-3 text-black rounded-xl font-bold mt-2">Save</button>
              <button onClick={() => setShowGoalModal(false)} className="w-full text-gray-400 text-xs mt-4">Cancel</button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <Motion.div 
        style={{y}}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4} // Rubber-banding effect
        className="max-w-7xl mx-auto flex flex-col touch-none gap-8"
      >
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 items-center">
            <img src={user?.photoURL} alt="P" className="w-18 h-18 bg-white rounded-full border-2 border-white/10" />
            <div>
              <h1 className="text-2xl font-bold text-white">Hello, {user?.displayName}!</h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Study Less. Remember More!</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-3 flex flex-col items-center">
               <span className="text-red-500 font-bold text-xl flex items-center gap-1"><Flame size={18}/> {user?.streak || 0}</span>  
            </div>
            <div className='bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-3 flex flex-col items-center'>
              <span className="text-blue-400  font-bold text-xl flex items-center gap-1"><LucideBook size={18}/> {user?.totalCardsRead || 0}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* --- ACTIVITY RINGS (Apple Watch Style) --- */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-white px-2">
              <h2 className="text-lg font-bold">Activity</h2>
              <Settings2 size={18} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => setShowGoalModal(true)} />
            </div>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex flex-col-1 gap-2 items-center">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  {ringConfig.map((ring) => (
                    <React.Fragment key={ring.id}>
                      {/* Track */}
                      <circle
                        cx="96" cy="96" r={ring.radius}
                        stroke="currentColor" strokeWidth="14" fill="none"
                        className="text-white/5"
                      />
                      {/* Progress */}
                      <Motion.circle
                        cx="96" cy="96" r={ring.radius}
                        stroke={ring.color} strokeWidth="14" fill="none"
                        strokeDasharray={ring.circumference}
                        initial={{ strokeDashoffset: ring.circumference }}
                        animate={{ strokeDashoffset: ring.circumference - ring.strokeDash }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </React.Fragment>
                  ))}
                </svg>
              </div>
              
              <div className="mt-8 w-full space-y-2">
                {ringConfig.map(ring => (
                  <div key={ring.id} className="flex justify-between text-[12px] font-['Inter Tight'] text-gray-100 uppercase tracking-tighter">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ring.color }} />
                      {ring.id}
                    </span>
                    <span>{dailyProgress[ring.id] || 0}/{dailyGoals[ring.id]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- COURSE SELECTION --- */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-3">
            {courses.map((course) => (
              <Motion.div
                key={course.id}
                whileHover={{ scale: 1.02, rotateY: 10 }}
                onClick={() => navigate(`/courses/${course.id}`)}
                className={`${course.backgroundColor}  shadow-${course.backgroundColor}/40 p-8 rounded-4xl flex flex-col justify-between h-48 cursor-pointer `}
              >  
                <div className="flex justify-center items-center">
                  <h3 className="text-xl font-bold text-black">{course.name}</h3>
                </div> 
                 <span className="text-black text-center text-7xl mt-4">{dailyProgress[course.id] || 0}</span>
                 <span className="text-black text-center text-sm">card(s) read</span>
                       
                
              </Motion.div>
            ))}
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default CourseSelection;