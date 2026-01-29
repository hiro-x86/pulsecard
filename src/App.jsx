import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
// 1. ADD 'onSnapshot' to imports for real-time updates
import { doc, updateDoc, onSnapshot } from 'firebase/firestore'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your pages...
import LandingPage from './pages/LandingPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import CourseSelection from './pages/CourseSelection.jsx';
import SubjectSelection from './pages/SubjectSelection.jsx';
import TopicSelection from './pages/TopicSelection.jsx';
import Flashcard from './pages/FlashCard.jsx';
import AddFlashcard from './pages/AddFlashcard.jsx';

const ProtectedRoute = ({ user, children }) => {
  // If still loading, show nothing or a spinner (handled in App component)
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  if (!user.displayName) {
     return <Navigate to="/signin" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null; // Variable to hold the DB listener

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // If a previous DB listener exists, detach it to avoid memory leaks
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", firebaseUser.uid);

      // 🔥 FIX: Use onSnapshot instead of getDoc
      // This waits for the 'SignInPage' to finish creating the doc
      unsubscribeSnapshot = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // --- STREAK CHECK LOGIC ---
          const today = new Date().toDateString();
          const lastStudyDate = userData.lastStudyDate;

          if (lastStudyDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toDateString();

            // If last study wasn't today AND wasn't yesterday, reset streak
            if (lastStudyDate !== today && lastStudyDate !== yesterdayString) {
              // Only update if streak is not already 0 to prevent loops
              if (userData.streak !== 0) {
                 await updateDoc(userRef, { streak: 0 });
                 // Local update is handled by the snapshot re-firing
              }
            }
          }
          // --- STREAK CHECK END ---

          setUser({
            uid: firebaseUser.uid,
            ...userData
          });
        } else {
          // Doc doesn't exist yet (Race Condition handled here)
          // We set a temporary user so they don't get kicked out, 
          // but the data will arrive in a few milliseconds.
          setUser({ uid: firebaseUser.uid });
        }
        
        setLoading(false);
      });
    });

    // Cleanup both listeners on unmount
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA] text-gray-950">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* If user exists, go to courses, else show sign in */}
        <Route 
          path="/signin" 
          element={user && user.displayName ? <Navigate to="/courses" /> : <SignInPage />} 
        />

        <Route 
          path="/courses" 
          element={<ProtectedRoute user={user}><CourseSelection user={user} db={db} /></ProtectedRoute>} 
        />
        <Route 
          path="/courses/:courseId" 
          element={<ProtectedRoute user={user}><SubjectSelection user={user} /></ProtectedRoute>} 
        />
        <Route 
          path="/courses/:courseId/:subjectId" 
          element={<ProtectedRoute user={user}><TopicSelection user={user} /></ProtectedRoute>} 
        />
        <Route 
          path="/flashcard/:courseId/:topicId" 
          element={<ProtectedRoute user={user}><Flashcard user={user} /></ProtectedRoute>}
        />
        <Route 
          path="/add-flashcard/:courseId/:topicId" 
          element={<ProtectedRoute user={user}><AddFlashcard user={user} /></ProtectedRoute>} 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;