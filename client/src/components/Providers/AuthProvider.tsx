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
  navbarHeight: string;
  componentHeight: string;
  isLoggedIn: boolean;
  token: string | null; // Add token to AuthContextProps
}

const AuthContext = createContext<AuthContextProps>({
  email: null,
  loading: true,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  navbarHeight: "15vh",
  componentHeight: "85svh",
  isLoggedIn: false,
  token: null, // Initialize token as null
});

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [user, loading] = useAuthState(auth);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null); // State to hold token

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
        navbarHeight: user ? "10vh" : "15vh",
        componentHeight: user ? "90svh" : "85svh",
        isLoggedIn: !!user,
        token, // Provide token to consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
