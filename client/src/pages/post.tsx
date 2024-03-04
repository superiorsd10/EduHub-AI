import ResizableFlex from "@/utils/ResizableFlex";
import { Box, Center, Divider, Group, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaBook } from "react-icons/fa6";

const post = () => {
  return (
    <ResizableFlex>
      <Center>
      <Group h="100%" w="80%" gap="0" pt="xl" align="flex-start">
      <Stack w="10%" h="100%" align="flex-start" pt='xs'>
        <FaBook size='40' color="#A61E4D"/>
      </Stack>
      <Stack w="90%" justify="flex-start" align="flex-start" h="100%">
        <Group justify="space-between" w="100%">
          <Title size="h2" c="pink.9">
            CODEUI.apk Event
          </Title>
          <BsThreeDotsVertical />
        </Group>
        <Group justify="space-between" w="100%">
          <Text size="lg" c="gray.7">
            Nikhil Ranjan
          </Text>
          <Text c="gray.7">04 Feb, 2024</Text>
        </Group>
        <Divider w="100%" color="pink.9" size="md"></Divider>
        <Text>A brief description about the CodeUI.apk Event.</Text>
        <Box
          style={{ border: "1px solid #868E96", borderRadius: "10px" }}
          w="15vw"
          h="6vh"
        ></Box>
      </Stack>
    </Group>
      </Center>
    </ResizableFlex>
  );
};

export default post;
