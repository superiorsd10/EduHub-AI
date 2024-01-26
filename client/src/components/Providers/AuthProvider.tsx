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
}

const AuthContext = createContext<AuthContextProps>({
  email: null,
  loading: true,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  navbarHeight: "15vh",
  componentHeight: "85svh",
  isLoggedIn:false
});

const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps) => {
  const [user, loading] = useAuthState(auth);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && user) {
      setUserEmail(user.email);
    }
  }, [loading, user]);

  return (
    <AuthContext.Provider
      value={{
        email: userEmail,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
        navbarHeight: user ? "10vh" : "15vh",
        componentHeight: user ? "85svh" : "85svh",
        isLoggedIn: user ? true: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
