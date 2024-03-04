import { Button, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";

const LeftBar = () => {
  return (
    <Stack w="15%">
      <Stack gap='sm' w='100%' style={{borderRadius:'10px',border:'2px solid #CED4DA'}} p='sm'>
        <Group w='100%' justify="space-between" >
            <Text>Hub Code</Text>
            <BsThreeDotsVertical/>
        </Group>
        <Text c='pink' size='lg' fw='bold'>fcpvbhw</Text>
      </Stack>
      <Button color="#C2255C" leftSection={<FaPlus />} justify="flex-start">
        Create
      </Button>
      <Button color="#C2255C" leftSection={<PiChatCircleDotsLight />} justify="flex-start">
        Chat with Material
      </Button>
    </Stack>
  );
};

export default LeftBar;
