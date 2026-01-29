import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { Plus,ArrowLeft } from 'lucide-react';

const Flashcard = ({ user }) => { // 1. Receive User Prop
  const { topicId } = useParams();
  const navigate = useNavigate(); 
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const flashcardsRef = collection(db, "Flashcards");
        const q = query(flashcardsRef, where("topic", "==", topicId));
        const querySnapshot = await getDocs(q);
        
        const fetchedCards = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCards(fetchedCards);
      } catch (error) {
        console.error("Error fetching cards: ", error);
      }
      setLoading(false);
    };

    fetchCards();
  }, [topicId]);

  // --- NEW: FUNCTION TO UPDATE STATS ---
  const handleNextCard = async () => {
  setIsFlipped(false);
  if (currentIndex < cards.length - 1) {
    setCurrentIndex(prev => prev + 1);
  }

  if (user && cards[currentIndex]) {
    const userRef = doc(db, "users", user.uid);
    const today = new Date().toISOString().split('T')[0]; // Use YYYY-MM-DD for consistency
    const lastStudyDate = user.lastStudyDate;
    
    // Normalize courseId to match: anatomy, physiology, or biochemistry
    const rawCourseId = cards[currentIndex].courseId || "anatomy";
    const courseKey = rawCourseId.toLowerCase().trim();

    let streakUpdate = {};
    if (lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastStudyDate === yesterdayStr) {
        streakUpdate = { streak: increment(1) };
      } else {
        streakUpdate = { streak: 1 }; // Reset to 1 if they missed a day
      }
    }

    try {
      await updateDoc(userRef, {
        totalCardsRead: increment(1),
        [`dailyProgress.${courseKey}`]: increment(1), // Key must match 'anatomy', etc.
        lastStudyDate: today,
        ...streakUpdate
      });
    } catch (error) {
      console.error("Firebase Update Error:", error);
    }
  }
};

  if (loading) return <div className="flex h-screen bg-[#FAFAFA] items-center justify-center">Loading Cards...</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-gray-950">

      <div className=" fixed top-2 left-2 text-gray-900 bg-transparent border border-gray-100 flex items-center gap-2  shadow-xl rounded-full p-1 transition-colors mb-4 group">
        <button onClick={() => navigate(-1)} className="p-2 bg-transparent rounded-full">
          <ArrowLeft size={24} />
        </button>
      </div>
      
      {cards.length === 0 ? (
        /* --- VIEW WHEN EMPTY --- */
        <div className="text-center">
          <p className="text-slate-400 mb-4">No cards found for this topic.</p>
          <p className="text-sm text-blue-500 font-bold">Click the + to add your first card!</p>
        </div>
      ) : (
        /* --- VIEW WHEN CARDS EXIST --- */
        <>
          
          <div className="mb-8 text-slate-400 font-medium">
            Card {currentIndex + 1} of {cards.length}
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full max-w-md h-80 cursor-pointer perspective-1000 group"
          >
            <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className={`absolute inset-0 ${currentCard.color} shadow-2xl  flex items-center justify-center p-8 backface-hidden `}>
                <p className="text-[18px] md:text-2xl text-center font-bold text-black">{currentCard.question}</p>
                <p className="absolute bottom-4 text-xs text-slate-400 font-bold uppercase tracking-widest">Tap to Flip</p>
              </div>
              <div className={`absolute inset-0 ${currentCard.color} text-black shadow-2xl  flex items-center justify-center p-8 backface-hidden rotate-y-180`}>
                <p className="text-[18px] md:text-xl text-center font-medium leading-relaxed">{currentCard.answer}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button 
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
              className="px-6 py-3 bg-slate-800 text-white rounded-xl shadow hover:bg-slate-700 disabled:opacity-30 transition-colors font-bold"
            >
              Previous
            </button>
            <button 
              onClick={handleNextCard}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 font-bold"
            >
              {currentIndex === cards.length - 1 ? 'Finish Set' : 'Next Card'}
            </button>
          </div>
        </>
      )}

      {/* --- ALWAYS VISIBLE BUTTON --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/add-flashcard/${topicId}`);
        }}
        className="fixed top-5 right-2 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-1000"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Flashcard;