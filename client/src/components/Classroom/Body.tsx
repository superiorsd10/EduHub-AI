import { Group, Stack } from "@mantine/core";
import React, { useContext } from "react";
import LeftBar from "./LeftBar";
import Content from "./Content";
import { AuthContext } from "../../providers/AuthProvider";

type HubIntroductoryData = {
  auth_option: string;
  description: string;
  invite_code: string;
  members_id: {[key: string]: any}; 
  messages: any[]; 
  name: string;
  posts: any[]; 
  quizzes: any[]; 
  recordings: any[]; 
  section: string;
  streaming_url: string;
  _id: string;
}
type Post={
  attachments_type: string[];
  attachments_url: string[];
  created_at: string;
  description: string;
  emoji_reactions: Record<string, any>; // Assuming emoji_reactions can be any key-value pair
  poll_options: any[]; // Assuming poll_options can be any type of array
  title: string;
  topic: string;
  type: string;
  uuid: string;
}

type HubsData = {
  introductory: HubIntroductoryData,
  paginatedData: {items:Post}[]
}

const Body = (props: HubsData) => {
  const { componentHeight } = useContext(AuthContext);
  return (
    <Group pos="relative" w='100%' gap='xl' align="center">
      <LeftBar invite_code={props.introductory.invite_code}/>
      <Stack style={{ flex: 1 }}>
      {props.paginatedData.map((post,id)=><Content key={id} post={post.items}/>)}
      </Stack>
      
    </Group>
  );
};

export default Body;
