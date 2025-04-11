import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "cryptopulse-app"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cryptopulse-app",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "cryptopulse-app"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const app = initializeApp(firebaseConfig);
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

export { auth, db };
export default app;
