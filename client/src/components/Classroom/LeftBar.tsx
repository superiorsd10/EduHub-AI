import { Button, Group, Stack, Text, CopyButton, Box } from "@mantine/core";
import React, { useContext } from "react";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdLiveTv } from "react-icons/md";
import { AppContext } from "@/providers/AppProvider";
import { HubContext } from "@/providers/HubProvider";
import { IoCopySharp } from "react-icons/io5";
import { useRouter } from "next/router";

const LeftBar = ({
  invite_code,
  role,
}: {
  invite_code: string;
  role: string;
}) => {
  const router = useRouter();
  const {
    isCreatePostVisible,
    setIsCreatePostVisible,
    currentHubData,
    appendPost,
    setRoomId
  } = useContext(HubContext);
  console.log(role);
  const { token } = useContext(AppContext);
  const { introductory } = currentHubData!;
  const { _id } = introductory!;
  const hub_id = router.query.hub_id as string;

  const managementToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTQzODc0MzIsImV4cCI6MTcxNTUxMDYzMiwianRpIjoiMDBjMTMyNDItZjAwMS00NzM0LTlhYjgtMmEwNjk3MDI3ZTQ3IiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MTQzODc0MzIsImFjY2Vzc19rZXkiOiI2NjBmY2I1NWJhYmMzM2YwMGU0YWI5NjcifQ.J3CU5ks1zdZ4hX0bm2UB4LwAmXMUjqEFMBlRkWLXYn0";

  const handleMakeAnnouncement = async (studentRoomCode: string) => {
    console.log(studentRoomCode);
    const formData = new FormData();
    formData.append("type", "announcement");
    formData.append(
      "title",
      `Join Live class here http://localhost:3000/hub/662e9873bc5597d4fda393cc/live/${studentRoomCode}`
    );
    formData.append("topic", "Live Class");

    try {
      const resp = await fetch(
        `http://127.0.0.1:5000/api/${btoa(hub_id)}/create-post`,
        {
          method: "POST",
          headers: {
            Authorization: `${token}`,
          },
          body: formData,
        }
      );
      const data = await resp.json();
      appendPost(data);
      setIsCreatePostVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateRoom = async()=>{
    try {
      const URL = 'https://api.100ms.live/v2/rooms';
      const response = await fetch(URL,{
        method:'POST',
        headers:{
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "template_id": "660ff95848b3dd31b94ff239"
        })
      });
      const body = await response.json();
      return body.id;
    } catch(error) {
      console.log(error);
    }
  }

  const handleGetRoomCode = async () => {
    try {
      const roomId = await handleCreateRoom();
      setRoomId(roomId);
      const URL =
        `https://api.100ms.live/v2/room-codes/room/${roomId}`;
      
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
      });
      let teacherCode: string = "",
        studentCode: string = "";
      const data = await response.json();
      console.log(data)
      for (let codes of data.data) {
        
        if (codes.role === "teacher") teacherCode = codes.code;
        else if (codes.role === "student") {
          studentCode = codes.code;
        } 
      }
      
      await handleMakeAnnouncement(studentCode);
      router.push(`http://localhost:3000/hub/${_id}/live/${teacherCode}`);
    } catch (error) {
      console.error(error);
    }
  };

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
              <Box p="0" style={{ cursor: "pointer" }}>
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
      {role === "teacher" && (
        <Button
          color="#C92A2A"
          variant="outline"
          leftSection={<MdLiveTv />}
          justify="flex-start"
          onClick={() => handleGetRoomCode()}
        >
          Start Live Class
        </Button>
      )}
    </Stack>
  );
};

export default LeftBar;
