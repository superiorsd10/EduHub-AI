import { Button, Group, Stack, Text } from "@mantine/core";
import React, {useContext} from "react";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdLiveTv } from "react-icons/md";
import Link from "next/link";
import NextLink from "@/utils/NextLink";
import { AuthContext } from "@/providers/AuthProvider";

const LeftBar = ({invite_code,room_code}:{invite_code:string,room_code:string}) => {
  const {isCreatePostVisible,setIsCreatePostVisible}=useContext(AuthContext);
  return (
    <Stack w="15%">
      <Stack gap='sm' w='100%' style={{borderRadius:'10px',border:'2px solid #CED4DA'}} p='sm'>
        <Group w='100%' justify="space-between" >
            <Text>Hub Code</Text>
            <BsThreeDotsVertical/>
        </Group>
        <Text c='pink' size='lg' fw='bold'>{invite_code}</Text>
      </Stack>
      <Button color="#C2255C" leftSection={<FaPlus />} justify="flex-start" onClick={()=>setIsCreatePostVisible(true)}>
        Create
      </Button>
      <Button color="#C2255C" leftSection={<PiChatCircleDotsLight />} justify="flex-start">
        Chat with Material
      </Button>
      <Button color="#C92A2A" variant="outline" leftSection={<MdLiveTv />} justify="flex-start">
        <NextLink href={`http://localhost:3000/class/${room_code}`}>
        Start Live Class
        </NextLink>
      </Button>
    </Stack>
  );
};

export default LeftBar;
