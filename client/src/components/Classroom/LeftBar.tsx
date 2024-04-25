import {
  Button,
  Group,
  Stack,
  Text,
  CopyButton,
  Avatar,
  Box,
} from "@mantine/core";
import React, { useContext } from "react";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdLiveTv } from "react-icons/md";
import Link from "next/link";
import NextLink from "@/utils/NextLink";
import { AppContext } from "@/providers/AppProvider";
import { HubContext } from "@/providers/HubProvider";
import { IoCopySharp } from "react-icons/io5";

const LeftBar = ({
  invite_code,
  room_code,
}: {
  invite_code: string;
  room_code: string;
}) => {
  const { isCreatePostVisible, setIsCreatePostVisible,currentHubData } =
    useContext(HubContext);
  const {introductory} = currentHubData!;
  const {_id}= introductory!;

  return (
    <Stack w="15%">
      <Stack
        gap="sm"
        w="100%"
        style={{ borderRadius: "10px", border: "2px solid #CED4DA" }}
        p="sm"
      >
        <Group w="100%" justify="space-between">
          <Text>Hub Code</Text>
          <BsThreeDotsVertical />
        </Group>
        <Group w="100%" justify="space-between">
          <Text c="pink" size="lg" fw="bold">
            {invite_code}
          </Text>
          <CopyButton value={invite_code}>
            {({ copied, copy }) => (
              <Box p="0" style={{cursor:'pointer'}}>
                {!copied ? (
                  <IoCopySharp color="#D6336C" onClick={copy} />
                ) : (
                  <Text onClick={copy}>Copied</Text>
                )}
              </Box>
            )}
          </CopyButton>
        </Group>
      </Stack>
      <Button
        color="#C2255C"
        leftSection={<FaPlus />}
        justify="flex-start"
        onClick={() => setIsCreatePostVisible(true)}
      >
        Create
      </Button>
      <Button
        color="#C2255C"
        leftSection={<PiChatCircleDotsLight />}
        justify="flex-start"
      >
        Chat with Material
      </Button>
      <Button
        color="#C92A2A"
        variant="outline"
        leftSection={<MdLiveTv />}
        justify="flex-start"
      >
        <NextLink href={`http://localhost:3000/hub/${_id}/live/${room_code}`}>
          Start Live Class
        </NextLink>
      </Button>
    </Stack>
  );
};

export default LeftBar;
