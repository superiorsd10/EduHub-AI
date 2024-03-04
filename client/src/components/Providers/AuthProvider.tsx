import React, { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";

interface AuthProviderProps {
  children: React.ReactNode;
}
interface AuthContextProps {
  email: string | null;
  loading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
  isDrawerTemporarilyOpen: boolean;
  setIsDrawerTemporarilyOpen: (isDrawerOpen: boolean) => void;
  navbarHeight: string;
  componentHeight: string;
  isLoggedIn: boolean;
  token: string | null; 
}

const AuthContext = createContext<AuthContextProps>({
  email: null,
  loading: true,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  isDrawerTemporarilyOpen: false,
  setIsDrawerTemporarilyOpen: () => {},
  navbarHeight: "15vh",
  componentHeight: "85svh",
  isLoggedIn: false,
  token: null, 
});

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [user, loading] = useAuthState(auth);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDrawerTemporarilyOpen, setIsDrawerTemporarilyOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null); 

  useEffect(() => {
    if (!loading && user) {
      setUserEmail(user.email);
      user.getIdToken().then(setToken);
    }
  }, [loading, user]);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const newToken = await user.getIdToken();
        setToken(newToken);
      } else {
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        email: userEmail,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
        isDrawerTemporarilyOpen,
        setIsDrawerTemporarilyOpen,
        navbarHeight: user ? "10vh" : "15vh",
        componentHeight: user ? "90svh" : "85svh",
        isLoggedIn: !!user,
        token, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
