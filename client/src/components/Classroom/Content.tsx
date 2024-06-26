import { Collapse, Group, Stack, Text } from "@mantine/core";
import { BiSolidBook } from "react-icons/bi";
import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrAnnounce } from "react-icons/gr";

import { useRouter } from "next/router";

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

const Content = ({ post }: { post: Post }) => {
  const [isDVisible,setIsDVisible] = useState<boolean>(false);
  let attachment_id = "";
  if (post.attachments_url.length > 0) {
    let url = post.attachments_url[0];
    let str = url.split("/");
    attachment_id = str[str.length - 1].replace(".pdf", "");
  }
  const router = useRouter();
  return (
    <Stack
      p="md"
      w="100%"
      style={{
        borderRadius: "10px",
        border: "1px solid #CED4DA",
        cursor: "pointer",
      }}
    >
      <Group
        onClick={() => {
          const hub_id = router.query.hub_id as string;
          if (attachment_id === "") {
            setIsDVisible(!isDVisible);
          } else
            router.push(
              `http://localhost:3000/hub/${hub_id}/${post.uuid}/${attachment_id}`
            );
        }}
      >
        {post.type === "announcement" ? (
          <GrAnnounce color="#C2255C" size="32px" />
        ) : (
          <BiSolidBook color="#C2255C" size="32px" />
        )}

        <Text mr="auto">{post.title}</Text>
        <Text>{post.created_at.substring(0, 10)}</Text>
        <BsThreeDotsVertical />
      </Group>
      {post.type === "announcement" && (
        <Collapse in={isDVisible}>
          <Text size="md">{post.description}</Text>
        </Collapse>
      )}
    </Stack>
  );
};

export default Content;
