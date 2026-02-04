import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Save, Type, FileText } from 'lucide-react';

const EditFlashcard = ({ user }) => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      const docRef = doc(db, "Flashcards", cardId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFront(data.question);
        setBack(data.answer);
      }
      setLoading(false);
    };
    fetchCard();
  }, [cardId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cardRef = doc(db, "Flashcards", cardId);
      await updateDoc(cardRef, {
        question: front,
        answer: back,
        lastEditedBy: user?.displayName || "Anonymous", // Tracks who fixed it
        updatedAt: serverTimestamp(),
      });
      navigate(-1);
    } catch (error) {
      console.error("Update Error:", error);
      alert("Failed to update card.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full"><ArrowLeft /></button>
        <h1 className="text-xl font-bold font-['Inter Tight']">Edit Card</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleUpdate} className="w-full max-w-2xl space-y-6">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-2"><Type size={14}/> Question</label>
          <textarea value={front} onChange={(e) => setFront(e.target.value)} className="w-full bg-transparent outline-none resize-none h-20" />
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mb-2"><FileText size={14}/> Answer</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} className="w-full bg-transparent outline-none resize-none h-40" />
        </div>

        <button type="submit" disabled={saving} className="w-full py-4 bg-white text-black font-bold rounded-2xl">
          {saving ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditFlashcard;