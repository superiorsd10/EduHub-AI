import { Group, Stack, Text } from "@mantine/core";
import { BiSolidBook } from "react-icons/bi";
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const Content = () => {
  return (
    <Stack style={{ flex: 1 }} >
      <Group
        p="md"
        w="100%"
        style={{ borderRadius: "10px", border: "1px solid #CED4DA" }}
      >
        <BiSolidBook color="#C2255C" size="32px" />
        <Text mr="auto">Someone posted something that I don't understand</Text>
        <Text>4th Feb, 2024</Text>
        <BsThreeDotsVertical />
      </Group>
    </Stack>
  );
};

export default Content;
