import React, { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";

type Hub = {
  creator_name: string;
  hub_id: string;
  name: string;
  photo_url: string;
};

type Hubs = {
  student: Hub[];
  teacher: Hub[];
};

interface AppProviderProps {
  children: React.ReactNode;
}
interface AppContextProps {
  userName: string|null;
  displayPhoto: string|null;
  email: string | null;
  loading: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
  isDrawerTemporarilyOpen: boolean;
  setIsDrawerTemporarilyOpen: (isDrawerOpen: boolean) => void;
  navbarHeight: string;
  componentHeight: string;
  isLoggedIn: boolean;
  isCreateHubVisible: boolean;
  setIsCreateHubVisible: (isCreateHubVisible: boolean) => void;
  token: string | null;
  hubList:Hubs;
  fetchHubs: () => void;
  appendHub:(newHub:Hub)=>void;
}

const AppContext = createContext<AppContextProps>({
  email: null,
  userName: null,
  displayPhoto:null,
  loading: true,
  isDrawerOpen: false,
  setIsDrawerOpen: () => {},
  isDrawerTemporarilyOpen: false,
  setIsDrawerTemporarilyOpen: () => {},
  navbarHeight: "15vh",
  componentHeight: "85svh",
  isLoggedIn: false,
  isCreateHubVisible: false,
  setIsCreateHubVisible: () => {},
  token: null,
  hubList:{
    student: [],
    teacher: [],
  },
  fetchHubs: () => {},
  appendHub: () => {},
});

const AppProvider: React.FC<AppProviderProps> = ({
  children,
}: AppProviderProps) => {
  const [user, loading] = useAuthState(auth);
  const [hubList, setHubList] = useState<Hubs>({
    student: [],
    teacher: [],
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string|null>(null);
  const [displayPhoto, setDisplayPhoto] = useState<string|null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isDrawerTemporarilyOpen, setIsDrawerTemporarilyOpen] =
    useState<boolean>(false);
  const [isCreateHubVisible, setIsCreateHubVisible] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  const fetchHubs = async () => {
    const response = await fetch(`http://127.0.0.1:5000/api/get-hubs?email=${userEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    const data = await response.json();
    const hubs: Hubs = data.data[0];

    setHubList(hubs);
  };

  useEffect(() => {
    if (!loading && user) {
      setUserEmail(user.email);
      setUserName(user.displayName);
      setDisplayPhoto(user.photoURL);
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

  const appendHub = (newHub: Hub) => {
      const updatedTeacherHubs = [newHub, ...hubList.teacher];
      const updatedHubList = {
        ...hubList,
        teacher: updatedTeacherHubs,
      };
      setHubList(updatedHubList);
  };

  return (
    <AppContext.Provider
      value={{
        email: userEmail,
        userName,
        displayPhoto,
        loading,
        isDrawerOpen,
        setIsDrawerOpen,
        isDrawerTemporarilyOpen,
        setIsDrawerTemporarilyOpen,
        navbarHeight: user ? "10vh" : "15vh",
        componentHeight: user ? "90svh" : "85svh",
        isLoggedIn: !!user,
        token,
        isCreateHubVisible,
        setIsCreateHubVisible,
        hubList,
        fetchHubs,
        appendHub
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppProvider, AppContext };
