import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bone, LucideBook, Activity, Flame, Droplets,} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const courses = [
  { id: 'anatomy', name: 'Anatomy', Icon:<Bone  /> },
  { id: 'physiology', name: 'Physiology', Icon: <Activity />},
  { id: 'biochemistry', name: 'Biochemistry',  Icon: <Droplets/> },
];

const CourseSelection = ({ user }) => {
  const navigate = useNavigate();

  const dailyProgress = user?.dailyProgress || { anatomy: 0, physiology: 0, biochemistry: 0 };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans relative overflow-y-auto">

      <div className="max-w-4xl mx-auto relative z-10 pb-20">
        {/* --- HEADER --- */}
        <header className="flex flex-row justify-between items-center gap-6 mb-10">
          <div className="flex gap-4 items-center self-start">
            <img 
              src={user?.photoURL || '/avatar.png'} 
              alt="Profile" 
              className="w-16 h-16 bg-blue-200 rounded-full border border-white/10 " 
            />
            <div>
              <h1 className="text-2xl"><span className='text-3xl font-medium'>Hi, </span> {user?.displayName}!</h1>
            </div>
          </div>

          <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-4 gap-8 md:w-auto justify-around">
            <div className="flex flex-col items-center">
               <span className="text-red-500 font-bold font-sans  text-[15px] flex items-center gap-1"><Flame size={16} fill="currentColor"/> {user?.streak || 0}</span>               
            </div>
            <div className='flex flex-col items-center border-l border-white/10 pl-6'>
              <span className="text-blue-400 font-bold font-sans text-[15px] flex items-center gap-2"><LucideBook size={16}/> {user?.totalCardsRead || 0}</span>              
            </div>
          </div>
        </header>

        {/* --- COURSE SELECTION --- */}
        <h2 className="text-white text-xl font-medium font-['Inter Tight'] tracking-widest mb-4 ml-2">Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Motion.div
              key={course.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-4xl flex flex-col items-center justify-center aspect-1:1 cursor-pointer hover:border-white/20 transition-colors"
            > 
              <h3 className="text-[20px] font-['Inter Tight'] flex gap-2 font-bold text-white mb-1">{course.Icon} {course.name}</h3>
              <span className={`text-[40px]  font-medium font-sans tracking-2%`}>
                {dailyProgress[course.id] || 0}
              </span>
              <span className="text-gray-100 font-sans font-medium text-[10px]">Cards studied today</span>
            </Motion.div>
          ))}
        </div>

        <footer className="mt-12 text-center font-sans fixed bottom-4  text-gray-100 text-[12px]">
            &copy;  {new Date().getFullYear()} Pulsecard. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default CourseSelection;