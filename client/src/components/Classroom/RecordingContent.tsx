import { Group, Stack, Text } from "@mantine/core";
import { BiSolidBook } from "react-icons/bi";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrAnnounce } from "react-icons/gr";
import { FaVideo } from "react-icons/fa";

import { useRouter } from "next/router";

type RecordingPost = {
  created_at: string;
  description: string;
  room_id: string;
  title: string;
  topic: string;
  uuid: string;
};

const RecordingContent = ({ post }: { post: RecordingPost }) => {
  const router = useRouter();
  const hub_id = router.query.hub_id as string;

  return (
    <Group
      p="md"
      w="100%"
      style={{
        borderRadius: "10px",
        border: "1px solid #CED4DA",
        cursor: "pointer",
      }}
      onClick={() => {
        router.push(`http://localhost:3000/recording/${hub_id}/${post.uuid}`);
      }}
    >
      <FaVideo size="32px" color="#C2255C" />

      <Text mr="auto">{post.title}</Text>
      <Text>{post.created_at.substring(0, 10)}</Text>
      <BsThreeDotsVertical />
    </Group>
  );
};

export default RecordingContent;
