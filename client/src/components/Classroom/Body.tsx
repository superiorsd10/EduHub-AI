import { Group, Stack } from "@mantine/core";
import React from "react";
import LeftBar from "./LeftBar";
import Content from "./Content";

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
  paginatedData: { items: Post }[];
  role: "teacher" | "student";
};

const Body = (props: HubsData) => {
  const { introductory, paginatedData, role } = props;
  return (
    <Group pos="relative" w="100%" gap="xl" align="flex-start">
      <LeftBar invite_code={introductory.invite_code} role={role} />
      <Stack style={{ flex: 1 }}>
        {paginatedData.map((post, id) => (
          <Content key={id} post={post.items} />
        ))}
      </Stack>
    </Group>
  );
};

export default Body;
