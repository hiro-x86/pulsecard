import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, X } from 'lucide-react';

// 1. Point these to your actual asset paths
const AVATARS = [
  '/avatars/Avatar-1.png',
  '/avatars/Avatar-2.png',
  '/avatars/Avatar-3.png',
  '/avatars/Avatar-4.png',
  '/avatars/Avatar-5.png',
  '/avatars/Avatar-6.png',
  '/avatars/Avatar-7.png',
  '/avatars/Avatar-8.png',
  '/avatars/Avatar-9.png',
  '/avatars/Avatar-10.png',
  '/avatars/Avatar-11.png',
  '/avatars/Avatar-12.png',
  '/avatars/Avatar-13.png',
  '/avatars/Avatar-14.png',
  '/avatars/Avatar-15.png',
  '/avatars/Avatar-16.png',
  '/avatars/Avatar-17.png',
  '/avatars/Avatar-18.png',
  '/avatars/Avatar-19.png',
  '/avatars/Avatar-20.png',
  '/avatars/Avatar-21.png',
  '/avatars/Avatar-22.png',
  '/avatars/Avatar-23.png',
  '/avatars/Avatar-24.png',
  '/avatars/Avatar-25.png',
  '/avatars/Avatar-26.png',
  '/avatars/Avatar-27.png',
  '/avatars/Avatar-28.png',
  '/avatars/Avatar-29.png',
  '/avatars/Avatar-30.png',
  '/avatars/Avatar-31.png',
  '/avatars/Avatar-33.png',
  '/avatars/Avatar-32.png',
  '/avatars/Avatar-34.png',
  '/avatars/Avatar-35.png',
  '/avatars/Avatar-36.png',
];

const SignInPage = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const { user } = await signInAnonymously(auth);
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name.trim(),
        photoURL: selectedAvatar, // Stores the path string e.g. "/avatars/memoji1.png"
        createdAt: serverTimestamp(),
        streak: 0,
        lastStudyDate: null,
        totalCardsRead: 0,
        dailyProgress: { anatomy: 0, physiology: 0, biochemistry: 0 }
      }, { merge: true });
    } catch {
      setError('Failed to create profile.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-['Inter Tight'] tracking-tight text-white">Welcome!</h1>
          <p className="text-gray-400 mt-2">Pick an avatar and a username</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-8">
          
          {/* COMPACT AVATAR SELECTION */}
          <div className="flex justify-center items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 flex items-center justify-center overflow-hidden rounded-full p-1 bg-linear-to-tr from-blue-500 to-purple-500 shadow-2xl">
                <img
                  src={selectedAvatar}
                  alt="Selected"
                  className="w-full h-full rounded-full bg-neutral-900 object-cover shrink-0"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">Username</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a username"
                className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-lg"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entering...' : 'Start Learning'}
            </button>
          </div>
        </form>
      </div>

      {/* AVATAR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-[#121212] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-3xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white tracking-tight">Choose Avatar</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2 scrollbar-hide">
              {AVATARS.map((url) => (
                <button
                  key={url}
                  type='button'
                  onClick={() => {
                    setSelectedAvatar(url);
                    setIsModalOpen(false);
                  }}
                  className={`relative aspect-square rounded-2xl transition-all overflow-hidden ${
                    selectedAvatar === url ? 'ring-4 ring-blue-500 scale-95' : 'hover:bg-white/5'
                  }`}
                >
                  <img src={url} alt="Option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;