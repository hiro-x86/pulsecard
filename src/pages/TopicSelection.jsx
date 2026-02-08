import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Folder, ChevronLeft,BookOpen } from 'lucide-react';

const TopicSelection = () => {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  
  const [systems, setSystems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const topicsRef = collection(db, "topics");
        const q = query(topicsRef, where("subjectId", "==", subjectId));
        const querySnapshot = await getDocs(q);
        
        const fetchedTopics = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        
        const grouped = fetchedTopics.reduce((acc, topic) => {
          const systemName = topic.system || "General";
          if (!acc[systemName]) acc[systemName] = [];
          acc[systemName].push(topic);
          return acc;
        }, {});

        setSystems(grouped);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
      setLoading(false);
    };

    fetchTopics();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-gray-100">
        <div className=" text-gray-100 font-bold text-xl">loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      {/* Header Section */}
       

         

      <div className="px-4 py-4 mb-6">
        <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex  mt-1 items-center bg-[#171717] border border-white/10 shadow-xl rounded-full p-2 text-gray-100 transition-colors mb-4 group"
          >
            <ChevronLeft size={25} className="group-hover:-translate-x-1 transition-transform" />            
          </button>
        <div className="max-w-5xl mx-auto">
           <h1 className="text-3xl font-black text-white font-['Inter Tight'] capitalize">
            {subjectId.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-400 mt-2">Select a deck to study</p>
         
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-5xl mx-auto px-6">
        {Object.keys(systems).length > 0 ? (
          Object.entries(systems).map(([systemName, topics]) => (
            <div key={systemName} className="mb-12">
              <h2 className="text-sm font-bold text-blue-600 uppercase  tracking-widest mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-blue-600"></span>
                {systemName}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/flashcard/${courseId}/${topic.id}`)} 
                    className="flex items-center justify-between p-5 bg-[#171717] border border-white/10  rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left"
                  >
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-600 transition-colors">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-gray-200 mt-1">Practice Now</p>
                    </div>
                  </button>
                ))}
                
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-700 rounded-3xl">
            <p className="text-slate-400">No topics found in the database for this subject yet.</p>
          </div>
        )}
        
      </div>
    </div>

  );
};

export default TopicSelection;