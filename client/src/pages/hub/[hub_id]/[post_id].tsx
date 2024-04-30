import React, { useEffect, useState } from "react";
import ResizableFlex from "@/utils/ResizableFlex";
import { Box, Center, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";
import { useRouter } from "next/router";
import { HubProvider } from "@/providers/HubProvider";

type PostType = {
  title: string;
  topic: string;
  description: string;
  created_at: string;
};

const PostWithoutContext = () => {
  const [postData, setPostData] = useState<PostType>();
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const post_id = router.query.post_id as string;
  const base64hub_id = btoa(hub_id);

  useEffect(() => {
    const getPost = async () => {
      if (!hub_id || !post_id) return;
      const resp = await fetch(
        `http://127.0.0.1:5000/api/${base64hub_id}/get-post/${post_id}`
      );
      let data = await resp.json();
      data = data.message;
      setPostData({
        title: data.title,
        topic: data.topic,
        description: data.description,
        created_at: data.created_at,
      });
    };
    getPost();
  }, [post_id, hub_id]);

  return (
    <ResizableFlex>
      <Center>
        <Stack w="100%" gap="xs" pl="5%" pr="5%" h="95%">
          <Stack>
            <Group w="100%" gap="0" pt="md" align="flex-start">
              <Stack h="100%" align="flex-start" pt="xs" pr="lg" w="5%">
                <FaBook size="40" color="#A61E4D" />
              </Stack>
              {postData && (
                <Stack w="95%" justify="flex-start" align="flex-start" h="100%">
                  <Group justify="space-between" w="100%">
                    <Title size="h2" c="pink.9">
                      {postData.title}
                    </Title>
                    <BsThreeDotsVertical size="32" color="#A61E4D" />
                  </Group>
                  <Group justify="space-between" w="100%">
                    <Text size="lg" c="gray.7">
                      {postData.topic}
                    </Text>
                    <Text c="gray.7">{postData.created_at}</Text>
                  </Group>
                </Stack>
              )}
            </Group>

            <Divider w="100%" color="pink.9" size="md"></Divider>
          </Stack>
          <Text>{postData?.description}</Text>
        </Stack>
      </Center>
    </ResizableFlex>
  );
};

const post = ()=>{
  return (
    <HubProvider>
      <PostWithoutContext/>
    </HubProvider>
  )
}

export default post;
