import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Save, Type, FileText } from 'lucide-react';

const COLORS = [
  { id: 'blue', value: 'bg-yellow-200', label: 'Easy' },
  { id: 'red', value: 'bg-red-400', label: 'Difficult' }, 
  { id: 'emerald', value: 'bg-emerald-200', label: 'Medium' },
];

const CreateFlashcard = () => {
  const { topicId } = useParams(); 
  const navigate = useNavigate();
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setLoading(true);
    try {
      // 1. Reference the specific Topic's subcollection
      // Note: Adjust "topics" collection path based on your exact Firestore structure
      const cardsRef = collection(db, "Flashcards");

      // 2. Add the new card
      await addDoc(cardsRef, {
        question: front,        // FIX: Match the field name "question" used in your display page
        answer: back,          // Match field name "answer"
        topic: topicId,        // This is the link that allows the filter to work
        color: selectedColor.value,
        createdAt: serverTimestamp(),
      });

      // 3. Go back to the previous page
      navigate(-1); 
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Could not save card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-950 p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-transparent rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Add card</h1>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <form onSubmit={handleSave} className="w-full max-w-2xl space-y-6">
        
        {/* Card Preview (Visual Feedback) */}
        <div className={`w-full h-48 rounded-2xl ${selectedColor.value} flex items-center justify-center p-6 shadow-2xl transition-colors duration-500`}>
          <p className="text-center font-serif text-2xl font-medium opacity-90 wrap-break-word w-full">
            {front || "Front Side Preview"}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="bg-white/50 p-4 rounded-2xl border border-slate-800 focus-within:border-blue-500 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
              <Type size={14} /> Front (Question)
            </label>
            <input 
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full bg-transparent text-lg outline-none placeholder-slate-600"
              placeholder="e.g. Origin of the Deltoid?"
              autoFocus
            />
          </div>

          <div className="bg-white/50 p-4 rounded-2xl border border-slate-800 focus-within:border-blue-500 transition-colors">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
              <FileText size={14} /> Back (Answer)
            </label>
            <textarea 
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full bg-transparent text-lg outline-none placeholder-slate-600 resize-none h-24"
              placeholder="Lateral third of clavicle..."
            />
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Card Color</label>
          <div className="flex gap-4">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-12 h-12 rounded-full ${c.value} transition-transform ${selectedColor.id === c.id ? 'ring-4 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
        >
          {loading ? 'Saving...' : <><Save size={20} /> Create Card</>}
        </button>

      </form>
    </div>
  );
};

export default CreateFlashcard;