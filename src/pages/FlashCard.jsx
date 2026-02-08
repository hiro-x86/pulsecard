import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { Plus, ChevronLeft, Pencil, ChevronRight} from 'lucide-react';

const Flashcard = ({ user }) => { // 1. Receive User Prop
  const { topicId, courseId } = useParams();
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
  
  if (user && cards[currentIndex]) {
    const userRef = doc(db, "users", user.uid);
    // Use the exact same date format as App.js
    const today = new Date().toLocaleDateString('en-CA'); 
    const lastStudyDate = user.lastStudyDate;
    const courseKey = courseId.toLowerCase().trim();

    let streakUpdate = {};

    // Only update streak if they haven't already gained a point today
    if (lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      if (lastStudyDate === yesterdayStr) {
        // They studied yesterday! Streak grows.
        streakUpdate = { streak: increment(1) };
      } else {
        // They missed a day (or are new). Start fresh at 1.
        streakUpdate = { streak: 1 };
      }
    }

    try {
      await updateDoc(userRef, {
        totalCardsRead: increment(1),
        [`dailyProgress.${courseKey}`]: increment(1),
        lastStudyDate: today,
        ...streakUpdate
      });
    } catch (error) {
      console.error("Firebase Update Error:", error);
    }
  }

  // Move to next card or finish
  if (currentIndex < cards.length - 1) {
    setCurrentIndex(prev => prev + 1);
  } else {
    // Optional: Navigate back to topics when finished
    // navigate(-1); 
  }
};

  if (loading) return <div className="flex h-screen bg-[#050505] items-center text-white justify-center">Loading Cards...</div>;

  const currentCard = cards[currentIndex];

  return (
    <div className="relative min-h-screen  bg-[#050505] flex flex-col items-center justify-center p-6 text-gray-100">

      <div className=" fixed top-2 left-2 text-gray-100 bg-[#171717] border border-white/10 flex items-center gap-2  shadow-xl rounded-full p-1 transition-colors mb-4 group">
        <button onClick={() => navigate(-1)} className="p-2 bg-transparent rounded-full">
          <ChevronLeft size={24} />
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
            <div className={`relative w-full  h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              <div className={`absolute inset-0 rounded-xl bg-[#171717] backdrop-blur-md border border-white/10 text-white shadow-2xl  flex items-center justify-center p-8 backface-hidden `}>
                 <button 
                    onClick={(e) => {
                    e.stopPropagation(); // Don't flip the card back when clicking edit
                    navigate(`/edit-flashcard/${courseId}/${topicId}/${currentCard.id}`);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <Pencil size={18} />
               </button>
                {currentCard.imageUrl && (
                  <div className="w-full h-40 mb-4 overflow-hidden rounded-lg">
                    <img 
                        src={currentCard.imageUrl} 
                        alt="diagram" 
                        className="w-full h-full object-contain" 
                    />
                  </div>
                )}
                <p className="text-[18px] pt-3 overflow-y-auto custom-scrollbar whitespace-pre-wrap md:text-2xl text-center font-bold">{currentCard.question}</p>
                <p className="absolute bottom-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Tap to Flip</p>
              </div>
              <div className={`absolute  inset-0 overflow-y-auto custom-scrollbar whitespace-pre-wrap text-white shadow-2xl rounded-xl bg-[#171717] backdrop-blur-md border border-white/10 p-8 backface-hidden rotate-y-180`}>
                <div className='min-h-full flex flex-col justify-between'>
             
                 <p className="text-[18px] md:text-xl text-center font-medium leading-relaxed mb-12">{currentCard.answer}</p>

                 <div className="mt-auto pt-4 w-full text-center border-t border-white/5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] px-4 leading-loose">
                            Created by: {currentCard.createdBy || 'Original Contributor'}
                            {currentCard.lastEditedBy && (
                                <span className="block mt-1">Edited by: {currentCard.lastEditedBy}</span>
                              )}
                      </p>
                 </div> 
                </div>              
              </div>
            </div>
          </div>

          <div className="flex gap-35 mt-12">
            <button 
              disabled={currentIndex === 0}
              onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
              className="p-4 bg-[#171717] border border-white/10 text-white rounded-full shadow hover:bg-slate-700 disabled:opacity-30 transition-colors font-bold"
            >
              <ChevronLeft/>
            </button>
            <button 
              onClick={handleNextCard}
              className="p-4 bg-white  text-black rounded-full shadow-lg shadow-white/30  transition-all transform active:scale-95 font-bold"
            >
              {currentIndex === cards.length - 1 ? 'Done' : <ChevronRight/>}
            </button>
          </div>
        </>
      )}

      {/* --- ALWAYS VISIBLE BUTTON --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/add-flashcard/${courseId}/${topicId}`);
        }}
        className="fixed top-3 right-2 w-12 h-12 bg-[#171717] border border-white/10  text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-1000"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Flashcard;