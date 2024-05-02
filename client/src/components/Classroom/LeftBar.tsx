import { Button, Group, Stack, Text, CopyButton, Box, Select } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdLiveTv } from "react-icons/md";
import { AppContext } from "@/providers/AppProvider";
import { HubContext } from "@/providers/HubProvider";
import { IoCopySharp } from "react-icons/io5";
import { useRouter } from "next/router";
import CreateRecordingModal from "../Modals/CreateRecording";

const LeftBar = ({
  invite_code,
  role,
  theme_color,
}: {
  invite_code: string;
  role: string;
  theme_color:string
}) => {
  const {
    setIsCreatePostVisible,
    setRoomId,
    roomId,
  } = useContext(HubContext);
  const router = useRouter();
  const [isCreateRecordingVisible, setIsCreateRecordingVisible] =
    useState<boolean>(false);
  const [teacherCode, setTeacherCode] = useState<string | null>(null);
  const [studentCode, setStudentCode] = useState<string | null>(null);
  const hub_id = router.query.hub_id as string;

  const managementToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTQzODc0MzIsImV4cCI6MTcxNTUxMDYzMiwianRpIjoiMDBjMTMyNDItZjAwMS00NzM0LTlhYjgtMmEwNjk3MDI3ZTQ3IiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MTQzODc0MzIsImFjY2Vzc19rZXkiOiI2NjBmY2I1NWJhYmMzM2YwMGU0YWI5NjcifQ.J3CU5ks1zdZ4hX0bm2UB4LwAmXMUjqEFMBlRkWLXYn0";


  const handleCreateRoom = async () => {
    try {
      const URL = "https://api.100ms.live/v2/rooms";
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${managementToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: "660ff95848b3dd31b94ff239",
        }),
      });
      const body = await response.json();
      return body.id;
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetRoomCode = async () => {
    try {
      const roomI = await handleCreateRoom();
      localStorage.setItem(`room_id_${hub_id}`,roomI);
      setRoomId(roomI);
      const URL = `https://api.100ms.live/v2/room-codes/room/${roomI}`;

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
      for (let codes of data.data) {
        if (codes.role === "teacher") teacherCode = codes.code;
        else if (codes.role === "student") {
          studentCode = codes.code;
        }
      }
      setTeacherCode(teacherCode);
      setStudentCode(studentCode);
      setIsCreateRecordingVisible(true);
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
          <Text c={theme_color} size="lg" fw="bold">
            {invite_code}
          </Text>
          <CopyButton value={invite_code}>
            {({ copied, copy }) => (
              <Box p="0" style={{ cursor: "pointer" }}>
                {!copied ? (
                  <IoCopySharp color={theme_color} onClick={copy} />
                ) : (
                  <Text onClick={copy}>Copied</Text>
                )}
              </Box>
            )}
          </CopyButton>
        </Group>
      </Stack>
      <Button
        color={theme_color}
        leftSection={<FaPlus />}
        justify="flex-start"
        onClick={() => setIsCreatePostVisible(true)}
      >
        Create
      </Button>
      <Button
        color={theme_color}
        leftSection={<PiChatCircleDotsLight />}
        justify="flex-start"
      >
        Chat with Material
      </Button>
      {role === "teacher" && (
        <Button
          color={theme_color}
          variant="outline"
          leftSection={<MdLiveTv />}
          justify="flex-start"
          onClick={() => handleGetRoomCode()}
        >
          Start Live Class
        </Button>
      )}
      {role === "teacher" && (
        <CreateRecordingModal
          isCreateRecordingVisible={isCreateRecordingVisible}
          setIsCreateRecordingVisible={setIsCreateRecordingVisible}
          roomId={roomId as string}
          teacherCode={teacherCode as string}
          studentCode={studentCode as string}
        ></CreateRecordingModal>
      )}
    </Stack>
  );
};

export default LeftBar;
