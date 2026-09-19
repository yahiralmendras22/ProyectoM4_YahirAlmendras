import { createContext, useContext, useEffect, useState, type ReactNode, type JSX } from "react";
import { auth } from "../../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth";


interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextValue | null>(null);


export function Authenticator({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });


    return () => unsubscribe();


  }, []);


  const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);


  const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);


  const signInWithGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider());


  const logout = () => signOut(auth);


  const value: AuthContextValue = {
    user, loading, signUp, signIn, signInWithGoogle, logout,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;


}


export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un <Authenticator>");
  return context;


}