import { Group, Stack } from "@mantine/core";
import React from "react";
import LeftBar from "./LeftBar";
import Content from "./Content";
import RecordingContent from "./RecordingContent";

type HubIntroductoryData = {
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
  theme_color: string;
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

type RecordingPost = {
  created_at: string;
  description: string;
  room_id: string;
  title: string;
  topic: string;
  uuid: string;
};

type HubsData = {
  introductory: HubIntroductoryData;
  paginatedData: Array<{ items: Post | RecordingPost }>;
  role: "teacher" | "student";
};

const Body = (props: HubsData) => {
  const { introductory, paginatedData, role } = props;

  return (
    <Group pos="relative" w="100%" gap="xl" align="flex-start">
      <LeftBar invite_code={introductory.invite_code} role={role} theme_color={introductory.theme_color}/>
      <Stack style={{ flex: 1 }}>
        {paginatedData.map((data, index) => (
          <React.Fragment key={index}>
            {(data.items as RecordingPost).room_id ? (
              <RecordingContent
                key={index}
                post={data.items as RecordingPost}
              />
            ) : (
              <Content key={index} post={data.items as Post} />
            )}
          </React.Fragment>
        ))}
      </Stack>
    </Group>
  );
};

export default Body;
