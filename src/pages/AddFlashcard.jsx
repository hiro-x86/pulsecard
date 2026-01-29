import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db} from '../firebase'; // Ensure storage is exported from your firebase.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// New imports
import { ArrowLeft, Save, Type, FileText, Image as ImageIcon, X } from 'lucide-react';

const CreateFlashcard = () => {
  const { topicId, courseId } = useParams(); 
  const navigate = useNavigate();
  
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    setLoading(true);
    try {
      let imageUrl = null;

      // 1. Upload Image if one is selected
     if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'flashcard-img'); // Replace this
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dhhqqung3/image/upload`, // Replace Cloud Name
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      imageUrl = data.secure_url; // This is the link to your image
    }

      // 2. Save to Firestore
      const cardsRef = collection(db, "Flashcards");
      await addDoc(cardsRef, {
        question: front,
        answer: back,
        imageUrl: imageUrl, // Save the link here
        topic: topicId, 
        courseId: courseId,
        color: 'bg-white', // Defaulting to white for better image visibility
        createdAt: serverTimestamp(),
      });

      navigate(-1); 
    } catch (error) {
      console.error("Error:", error);
      alert("Could not save card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)}><ArrowLeft /></button>
        <h1 className="text-xl font-bold">Add Medical Card</h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSave} className="w-full max-w-2xl space-y-6">
        {/* Image Upload Section */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-white">
          {imagePreview ? (
            <div className="relative w-full h-48">
              <img src={imagePreview} className="w-full h-full object-contain rounded-lg" alt="Preview" />
              <button 
                type="button"
                onClick={() => {setImageFile(null); setImagePreview(null);}}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center cursor-pointer py-8">
              <ImageIcon size={40} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500 font-medium">Add Diagram/Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest"><Type size={12}/> Front</label>
          <input value={front} onChange={(e) => setFront(e.target.value)} className="w-full p-2 outline-none text-lg" placeholder="Question..." />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest"><FileText size={12}/> Back</label>
          <textarea value={back} onChange={(e) => setBack(e.target.value)} className="w-full p-2 outline-none text-lg resize-none h-24" placeholder="Answer..." />
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl">
          {loading ? 'Uploading...' : 'Create Card'}
        </button>
      </form>
    </div>
  );
};

export default CreateFlashcard;