import Banner from "@/components/Classroom/Banner";
import Body from "@/components/Classroom/Body";
import Header from "@/components/Classroom/Header";
import ResizableFlex from "@/utils/ResizableFlex";
import { Stack } from "@mantine/core";
import React, { useEffect, useContext, useState } from "react";
import { AuthContext } from "@/providers/AuthProvider";
import { useRouter } from "next/router";

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
};

const classroom = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const { token } = useContext(AuthContext);
  const [currentHubData, setCurrentHubData] = useState<HubsData | null>(null);
  useEffect(() => {
    const getHub = async () => {
      if(!hub_id) return;
      console.log(hub_id)
      const encoded_base64 = btoa(hub_id);
      const response = await fetch(
        `http://127.0.0.1:5000/api/hub/${encoded_base64}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      const data = await response.json();
      const hubsData: HubsData = data.data;
      console.log(hubsData);
      setCurrentHubData(hubsData);
      console.log(currentHubData)
    };
    getHub();
  }, [router]);
  return (
    <ResizableFlex>
      <Stack pl="2%" pr="2%" gap="xl">
        <Header />
        {currentHubData != null && (
          <Banner title={currentHubData!.introductory.name} />
        )}

        {currentHubData != null && (
          <Body
            introductory={currentHubData!.introductory}
            paginatedData={currentHubData!.paginated}
          />
        )}
      </Stack>
    </ResizableFlex>
  );
};

export default classroom;
