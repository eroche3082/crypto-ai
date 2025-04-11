import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGWmVEy2zp6fpqaBkDOpV-Qj_FP6QkZj0",
  authDomain: "erudite-creek-431302-q3.firebaseapp.com",
  projectId: "erudite-creek-431302-q3",
  storageBucket: "erudite-creek-431302-q3.firebasestorage.app",
  messagingSenderId: "744217150021",
  appId: "1:744217150021:web:5aecdac01f6ab64b7c192c",
  measurementId: "G-7SBNGN6M4V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Analytics - only in browser environment
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    throw error;
  }
};

export const loginWithRedirect = () => {
  signInWithRedirect(auth, provider);
};

export const logoutUser = () => {
  return signOut(auth);
};

export { auth, db, analytics };
export default app;
