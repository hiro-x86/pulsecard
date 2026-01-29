import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AVATARS = [
  'https://api.dicebear.com/9.x/toon-head/svg?seed=Jameson&eyebrows=sad&eyes=happy&hair=sideComed&mouth=smile&skinColor=a36b4f',
  'https://api.dicebear.com/9.x/toon-head/svg?seed=Christian&eyebrows=sad&eyes=happy&hair=sideComed&mouth=smile&skinColor=a36b4f'
];

const SignInPage = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Sign in (this triggers App.jsx listener immediately)
      const { user } = await signInAnonymously(auth);

      // 2. Write Profile
      // App.jsx will see this update via onSnapshot and rerender automatically
      await setDoc(
        doc(db, 'users', user.uid),
        {
          displayName: name.trim(),
          photoURL: selectedAvatar,
          createdAt: serverTimestamp(),
          streak: 0, // Initialize streak
          lastStudyDate: null,
          totalCardsRead: 0,
          dailyGoals: {
            anatomy: 0,
            physiology: 0,
            biochemistry: 0,
          },
          dailyProgress:{
            anatomy: 0,
            physiology: 0,
            biochemistry: 0,
          }
        },
        { merge: true }
      );
      
      // No need to navigate manually, App.jsx handles it via <Navigate />
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to create profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-['Roboto Flex'] font-bold text-slate-800">Welcome!</h1>
          <p className="text-slate-500 mt-2">Create your profile to start learning</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="flex justify-center gap-4 flex-wrap">
            {AVATARS.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedAvatar(url)}
                className={`rounded-full p-1 transition-all ${
                  selectedAvatar === url
                    ? 'ring-4 ring-blue-500 scale-110'
                    : 'opacity-70'
                }`}
              >
                <img
                  src={url}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full bg-slate-100"
                />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-blue-700
                       text-white font-bold py-3 rounded-xl
                       transition-colors disabled:bg-slate-400"
          >
            {loading ? 'Creating Profile...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;