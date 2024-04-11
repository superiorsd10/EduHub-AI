import React, { createContext, useState } from "react";

type HubIntroductoryData = {
  assignments: any[];
  auth_option: string;
  description: string;
  invite_code: string;
  members_id: { [key: string]: any };
  messages: any[];
  name: string;
  posts: any[];
  quizzes: any[];
  recordings: any[];
  section: string;
  streaming_url: string;
  room_code_teacher: string;
  room_code_student: string;
  _id: string;
};

type Post = {
  attachments_type: string[];
  attachments_url: string[];
  created_at: string;
  description: string;
  emoji_reactions: Record<string, any>;
  poll_options: any[];
  title: string;
  topic: string;
  type: string;
  uuid: string;
};

type HubsData = {
  introductory: HubIntroductoryData;
  paginated: { items: Post }[];
  role: "teacher"|"student";
};

interface HubProviderProps {
  children: React.ReactNode;
}
interface HubContextProps {
  isCreatePostVisible: boolean;
  setIsAcceptRequestsVisible: (isCreatePostVisible: boolean) => void;
  isAcceptRequestsVisible: boolean;
  setIsCreatePostVisible: (isCreatePostVisible: boolean) => void;
  currentHubData: HubsData | null;
  appendPost: (newPost: Post) => void;
  fetchHubData: (hubId: string, token: string | null) => void;
}

const HubContext = createContext<HubContextProps>({
  isCreatePostVisible: false,
  setIsCreatePostVisible: () => {},
  isAcceptRequestsVisible: false,
  setIsAcceptRequestsVisible: () => {},
  appendPost: () => {},
  currentHubData: null,
  fetchHubData: () => {},
});

const HubProvider: React.FC<HubProviderProps> = ({
  children,
}: HubProviderProps) => {
  const [currentHubData, setCurrentHubData] = useState<HubsData | null>(null);
  const [isCreatePostVisible, setIsCreatePostVisible] =
    useState<boolean>(false);
  const [isAcceptRequestsVisible, setIsAcceptRequestsVisible] = useState<boolean>(false);

  const fetchHubData = async (hubId: string, token: string | null) => {
    const encodedBase64 = btoa(hubId);
    const response = await fetch(
      `http://127.0.0.1:5000/api/hub/${encodedBase64}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    const data = await response.json();
    console.log(data);
    const hubsData: HubsData = data.data;
    setCurrentHubData(hubsData);
  };

  const appendPost = (newPost: Post) => {
    if (currentHubData) {
      const updatedPosts = [{ items: newPost }, ...currentHubData.paginated];
      const updatedHubData = {
        ...currentHubData,
        paginated: updatedPosts,
      };
      setCurrentHubData(updatedHubData);
    }
  };

  return (
    <HubContext.Provider
      value={{
        isCreatePostVisible,
        setIsCreatePostVisible,
        isAcceptRequestsVisible,
        setIsAcceptRequestsVisible,
        fetchHubData,
        currentHubData,
        appendPost,
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export { HubProvider, HubContext };
