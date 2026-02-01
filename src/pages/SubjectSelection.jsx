import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const courseData = {
  anatomy: {
    title: "Anatomy",
    subjects: ["Gross Anatomy", "Histology", "Embryology"]
  },
  physiology: {
    title: "Physiology",
    subjects: ["General Physiology", "Blood Physiology", "Cardiovascular"]
  },
  biochemistry: {
    title: "Biochemistry",
    subjects: ["Intro. To Biochemistry","Amino Acid", "Carbohydrate", "Lipid Metabolism"]
  }
};

const SubjectSelection = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const currentCourse = courseData[courseId];


  if (!currentCourse) return <div className="p-10 text-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      <button 
        onClick={() => navigate('/courses')}
        className="text-white bg-[#171717] border border-white/10 flex items-center gap-2  shadow-xl rounded-full p-2 transition-colors mb-4 group"
      >
          <ChevronLeft size={25} className="text-white group-hover:-translate-x-1 transition-transform" />
      </button>
rif
      <h1 className="text-3xl  font-bold font-['Inter Tight'] text-white mb-2">{currentCourse.title}</h1>
      <p className="text-gray-200 font-san mb-10">Select a specific subject to begin.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCourse.subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => navigate(`/courses/${courseId}/${subject.toLowerCase().replace(" ", "-")}`)}
            className="p-6 rounded-xl bg-[#171717] border border-white/10 text-gray-950 text-left transition-all group"
          >
            <h3 className="font-bold text-gray-100">{subject}</h3>
            <p className="text-xs text-slate-400 mt-1">View Topics →</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;