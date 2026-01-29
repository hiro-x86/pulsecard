import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bone, Activity, Flame, Droplets, Layers, Settings2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

const courses = [
  { id: 'anatomy', name: 'Anatomy', icon: <Bone />, color: '#3b82f6', backgroundColor: 'bg-pink-700' },
  { id: 'physiology', name: 'Physiology', icon: <Activity />, color: '#ef4444', backgroundColor: 'bg-cyan-400' },
  { id: 'biochemistry', name: 'Biochemistry', icon: <Droplets />, color: '#10b981', backgroundColor: 'bg-lime-400' },
];

const CourseSelection = ({ user, db }) => {
  const navigate = useNavigate();
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // 1. Local state for the modal
  const [tempGoals, setTempGoals] = useState(user?.dailyGoals || { anatomy: 0, physiology: 0, biochemistry: 0 });

  // 3. FIX: STREAK & DAILY RESET LOGIC
  useEffect(() => {
    const handleDailyReset = async () => {
      // Use uid here to match Firebase Auth standard
      if (!user?.uid || !db) return;

      const today = new Date().toISOString().split('T')[0];
      const lastDate = user?.lastStudyDate;

      // If it's a brand new day...
      if (lastDate !== today) {
        const userRef = doc(db, "users", user.uid);
        let currentStreak = user?.streak || 0;

        // Check if they missed yesterday (to reset streak to 0)
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

  // --- SVG RING MATH ---
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const sectionSize = circumference / 3;

  const segments = courses.map((course, index) => {
    const goal = dailyGoals[course.id] || 1;
    const progress = dailyProgress[course.id] || 0;
    const fillPercentage = Math.min(progress / goal, 1);
    const strokeDash = fillPercentage * sectionSize;
    const offset = -(index * sectionSize);

    return { course, strokeDash, offset };
  });

  // 4. FIX: Save Goals Function
  const saveGoals = async () => {
    // Check for uid instead of id
    if (!user?.uid) {
      console.error("No User UID found!");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { dailyGoals: tempGoals });
      setShowGoalModal(false);
      console.log("Goals saved successfully!");
    } catch (err) {
      console.error("Firebase Update Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 font-serif">
      
      {/* --- GOAL MODAL --- */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-xs shadow-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings2 size={20}/> Set Goals</h3>
            {courses.map(c => (
              <div key={c.id} className="mb-3">
                <label className="text-[10px] font-bold uppercase text-gray-400">{c.name}</label>
                <input 
                  type="number" 
                  value={tempGoals[c.id]} 
                  onChange={(e) => setTempGoals({...tempGoals, [c.id]: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border-b-2 border-gray-100 outline-none focus:border-blue-500 font-bold"
                />
              </div>
            ))}
            <button onClick={saveGoals} className="w-full bg-blue-500 text-white p-3 rounded-xl font-bold mt-2 hover:bg-blue-600 transition-colors">
              Save Goals
            </button>
            <button onClick={() => setShowGoalModal(false)} className="w-full text-gray-400 text-xs mt-4">Cancel</button>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between mb-10 gap-4">
        <div className="flex gap-4">
          <img src={user?.photoURL} alt="Profile" className="w-16 h-16 rounded-full border-4 border-gray-700 shadow-sm bg-blue-100" />
          <div>
            <h1 className="text-2xl font-bold text-gray-950 font-['Roboto Flex']">Welcome, {user?.displayName}!</h1>
            <p className="text-gray-500 text-[10px] font-serif uppercase tracking-widest">Start Learning. Right Now!</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6 bg-transparent p-4">
          <div className="flex flex-col items-center">
            <span className="text-red-500 flex items-center gap-1 font-bold text-xl">
              <Flame size={18} fill="currentColor" /> {user?.streak || 0}
            </span>
            <span className="text-[10px] uppercase text-gray-500 font-semibold">Streak</span>
          </div>
          <div className="flex flex-col items-center px-4">
            <span className="text-blue-400 font-bold text-xl">{user?.totalCardsRead || 0}</span> 
            <span className="text-[10px] uppercase text-gray-500 font-semibold">Cards Viewed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT: ACTIVITY RING --- */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl tracking-tight font-bold font-['Roboto Flex'] text-gray-950">Activity Ring</h2>
            <Settings2 size={18} className="cursor-pointer text-gray-400 hover:text-black" onClick={() => setShowGoalModal(true)} />
          </div>

          <div className="bg-black p-8 rounded-3xl shadow-sm flex flex-col items-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle cx="88" cy="88" r={radius} stroke="#374151" strokeWidth="12" fill="transparent" />
                {segments.map((seg) => (
                  <circle
                    key={seg.course.id}
                    cx="88" cy="88" r={radius}
                    stroke={seg.course.color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${seg.strokeDash} ${circumference}`}
                    strokeDashoffset={seg.offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-white text-[10px] font-bold tracking-widest opacity-50 uppercase">Daily</span>
                 <span className="text-white font-bold text-lg">GOAL</span>
              </div>
            </div>
            
            <div className="mt-6 w-full space-y-2">
              {courses.map(c => (
                <div key={c.id} className="flex justify-between text-[10px] font-bold uppercase text-white tracking-widest">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="text-gray-400">{dailyProgress[c.id] || 0} / {dailyGoals[c.id]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: COURSE SELECTION --- */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl tracking-tight font-bold font-['Roboto Flex'] text-gray-950 flex items-center gap-2">
            <Layers size={20} /> Select A Course
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className={`group cursor-pointer ${course.backgroundColor} h-45 p-6 rounded-4xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between`}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-white/10">
                  {React.cloneElement(course.icon, { size: 28, className: 'text-gray-800' })}
                </div>
                <h3 className="text-xl font-['Roboto Flex'] font-bold text-gray-900">{course.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSelection;