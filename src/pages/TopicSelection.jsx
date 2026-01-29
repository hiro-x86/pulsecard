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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-gray-950">
        <div className="animate-pulse text-950 font-2xl h-12 w-12">loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Header Section */}
      <div className="px-4 py-4 mb-6">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center bg-transparent border border-gray-100 shadow-xl rounded-full p-1 text-black transition-colors mb-4 group"
          >
            <ChevronLeft size={25} className="group-hover:-translate-x-1 transition-transform" />
            
          </button>

          <h1 className="text-4xl font-black text-black capitalize">
            {subjectId.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-500 mt-2">Select a deck to study</p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="max-w-5xl mx-auto px-6">
        {Object.keys(systems).length > 0 ? (
          Object.entries(systems).map(([systemName, topics]) => (
            <div key={systemName} className="mb-12">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-blue-600"></span>
                {systemName}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/flashcards/${topic.id}`)} 
                    className="flex items-center justify-between p-5 bg-white  rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left"
                  >
                    <div>
                      <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Practice Now</p>
                    </div>
                    <Folder size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
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