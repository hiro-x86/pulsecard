import React, {useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bone, LucideBook, Activity, Flame, Droplets, Layers, Settings2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const courses = [
  { id: 'anatomy', name: 'Anatomy', textColor: 'text-red-500', glowColor: '#ef4444' },
  { id: 'physiology', name: 'Physiology', textColor: 'text-blue-400', glowColor: '#60a5fa'},
  { id: 'biochemistry', name: 'Biochemistry', textColor: 'text-yellow-400', glowColor: '#facc15' },
];

const CourseSelection = ({ user, db }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDailyReset = async () => {
      if (!user?.uid || !db) return;
      const today = new Date().toISOString().split('T')[0];
      const lastDate = user?.lastStudyDate;

      if (lastDate && lastDate!== today) {
        const userRef = doc(db, "users", user.uid);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let updates = {
          dailyProgress: { anatomy: 0, physiology: 0, biochemistry: 0 },
          lastStudyDate: today,
        };

        // If they didn't study today or yesterday, reset
        if (lastDate !== yesterdayStr) {
          updates.streak = 0;
        }

        try {
          await updateDoc(userRef, updates);
        } catch (e) {
          console.error("Reset Error", e);
        }
      }
    };
    handleDailyReset();
  }, [user?.uid, user?.lastStudyDate, user?.streak, db]);

  const dailyProgress = user?.dailyProgress || { anatomy: 0, physiology: 0, biochemistry: 0 };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-serif relative overflow-y-auto">
      
      {/* Background Glows - Fixed so they don't scroll */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 pb-20">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-4 items-center self-start">
            <img 
              src={user?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="w-16 h-16 bg-blue-300 rounded-full border-2 border-white/10 object-cover" 
            />
            <div>
              <h1 className="text-2xl font-bold">Hi, {user?.displayName}!</h1>
              <p className="text-gray-400 text-[10px] tracking-[0.2em]"><i>Study Smart. Excel More!</i></p>
            </div>
          </div>

          <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-6 gap-8 md:w-auto justify-around">
            <div className="flex flex-col items-center">
               <span className="text-red-500 font-bold text-xl flex items-center gap-2"><Flame size={16} fill="currentColor"/> {user?.streak || 0}</span>
               <span className="text-[10px] text-white uppercase font-medium">Streak</span>
            </div>
            <div className='flex flex-col items-center border-l border-white/10 pl-8'>
              <span className="text-blue-400 font-bold text-xl flex items-center gap-2"><LucideBook size={18}/> {user?.totalCardsRead || 0}</span>
              <span className="text-[10px] text-white uppercase font-medium">Total</span>
            </div>
          </div>
        </header>

        {/* --- COURSE SELECTION --- */}
        <h2 className="text-white text-xl font-bold uppercase text-['Inter Tight'] tracking-widest mb-4 ml-2">Select a Course</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Motion.div
              key={course.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-4xl flex flex-col items-center justify-center h-48 cursor-pointer hover:border-white/20 transition-colors"
            >  
              <h3 className="text-lg font-bold text-white mb-2">{course.name}</h3>
              <span className={`text-7xl font-extralight font-san tracking-tighter ${course.textColor}`}
                style={{ 
                  textShadow: `0 0 25px ${course.glowColor}`,
                  filter: 'brightness(1.1)'
                }}>
                {dailyProgress[course.id] || 0}
              </span>
              <span className="text-gray-100 text-[8px] uppercase">Cards studied today</span>
            </Motion.div>
          ))}
        </div>

        <footer className="mt-12 text-center font-serif  text-gray-600 text-[14px]">
           {new Date().getFullYear()} &copy; Pulsecard . All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default CourseSelection;