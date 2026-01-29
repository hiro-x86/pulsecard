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
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <button 
        onClick={() => navigate('/courses')}
        className="text-gray-900 bg-transparent border border-gray-100 flex items-center gap-2  shadow-xl rounded-full p-1 transition-colors mb-4 group"
      >
          <ChevronLeft size={25} className="text-gray-950 group-hover:-translate-x-1 transition-transform" />
      </button>

      <h1 className="text-3xl font-serif font-bold text-gray-950 mb-2">{currentCourse.title}</h1>
      <p className="text-gray-500 font-serif mb-10">Select a specific subject to begin.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCourse.subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => navigate(`/courses/${courseId}/${subject.toLowerCase().replace(" ", "-")}`)}
            className="p-6 bg-white shadow-sm rounded-xl text-gray-950 text-left transition-all group"
          >
            <h3 className="font-bold text-gray-950">{subject}</h3>
            <p className="text-xs text-slate-400 mt-1">View Topics →</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelection;