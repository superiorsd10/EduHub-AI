import React, { useEffect, useState } from "react";
import ResizableFlex from "@/utils/ResizableFlex";
import { Box, Center, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";
import { useRouter } from "next/router";

type PostType = {
  title: string;
  topic: string;
  description: string;
  created_at:string;
};

const post = () => {
  const [postData, setPostData] = useState<PostType>();
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const post_id = router.query.post_id as string;
  const attachment_id = router.query.attachment_id as string;
  console.log("attachment id... ")
  console.log(attachment_id);
  const base64hub_id = btoa(hub_id);

  useEffect(() => {
    const getPost = async () => {
      if (!hub_id || !post_id) return;
      const resp = await fetch(
        `http://127.0.0.1:5000/api/${base64hub_id}/get-post/${post_id}`
      );
      const data = await resp.json();
      setPostData({
        title: data.title,
        topic: data.topic,
        description: data.description,
        created_at:data.created_at
      });
    };
    getPost();
  }, [post_id, hub_id]);

  return (
    <ResizableFlex>
      <Center>
        <Group h="100%" w="80%" gap="0" pt="xl" align="flex-start">
          <Stack w="10%" h="100%" align="flex-start" pt="xs">
            <FaBook size="40" color="#A61E4D" />
          </Stack>
          {postData && (
            <Stack w="90%" justify="flex-start" align="flex-start" h="100%">
              <Group justify="space-between" w="100%">
                <Title size="h2" c="pink.9">
                  {postData.title}
                </Title>
                <BsThreeDotsVertical />
              </Group>
              <Group justify="space-between" w="100%">
                <Text size="lg" c="gray.7">
                  {postData.topic}
                </Text>
                <Text c="gray.7">{postData.created_at}</Text>
              </Group>
              <Divider w="100%" color="pink.9" size="md"></Divider>
              <Text>{postData.description}</Text>
              <Box
                style={{ border: "1px solid #868E96", borderRadius: "10px" }}
                w="15vw"
                h="6vh"
                onClick={() => router.push(`http://localhost:3000/chat`)}
              ></Box>
            </Stack>
          )}
        </Group>
      </Center>
    </ResizableFlex>
  );
};

export default post;
