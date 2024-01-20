import React, { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextProps {
  email: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({ email: null, loading: true });

const AuthProvider: React.FC<AuthProviderProps> = ({ children }: AuthProviderProps) => {
  const [user, loading] = useAuthState(auth);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    console.log("context ", loading, user);
    if (!loading) {
      if (user && user.email) {
        console.log("email", user.email);
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    }
  }, [loading, user]);

  return <AuthContext.Provider value={{ email: userEmail, loading }}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
