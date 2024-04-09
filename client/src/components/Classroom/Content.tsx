import { Group, Stack, Text } from "@mantine/core";
import { BiSolidBook } from "react-icons/bi";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/router";

type Post={
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
}

const Content = ({post}:{post:Post}) => {
  let url=post.attachments_url[0];
  let str=url.split('/');
  const attachment_id = str[str.length - 1].replace('.pdf', '');
  const router = useRouter();
  return (
      <Group
        p="md"
        w="100%"
        style={{ borderRadius: "10px", border: "1px solid #CED4DA" }}
        onClick={()=>router.push(`http://localhost:3000/post/${post.uuid}/${attachment_id}`)}
      >
        <BiSolidBook color="#C2255C" size="32px" />
        <Text mr="auto">{post.title}</Text>
        <Text>{post.created_at.substring(0,10)}</Text>
        <BsThreeDotsVertical />
      </Group>
  );
};

export default Content;
