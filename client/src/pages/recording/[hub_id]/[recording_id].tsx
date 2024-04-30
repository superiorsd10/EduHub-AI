import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Center,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import ResizableFlex from "@/utils/ResizableFlex";
import ChatWithRecording from "@/components/Material/ChatWithRecording";
import { FaBook, FaVideo } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import VideoPlayer from "@/components/Material/VideoPlayer";

type RecordingPost = {
  created_at: string;
  description: string;
  room_id: string;
  title: string;
  topic: string;
  uuid: string;
  playlist_file_url: string;
};

const Recording = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const recording_id = router.query.recording_id as string;
  const [recordingData, setRecordingData] = useState<RecordingPost | null>(
    null
  );
  const fetchRecording = async () => {
    try {
      const req = await fetch(
        `http://127.0.0.1:5000/api/${btoa(
          hub_id
        )}/get-recording/${recording_id}`
      );
      const resp = await req.json();
      const data: RecordingPost = resp.message;
      setRecordingData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchRecording();
  }, []);
  return (
    <ResizableFlex>
      <Stack pl="5%" pr="5%" h="95%">
        <Center>
          <Stack w="100%" gap="xs">
            <Group w="100%" gap="0" pt="md" align="flex-start">
              <Stack  h="100%" align="flex-start" pt="xs" pr='lg' w='5%'>
                <FaVideo size="40" color="#A61E4D" />
              </Stack>
              {recordingData && (
                <Stack w="95%" justify="flex-start" align="flex-start" h="100%">
                  <Group justify="space-between" w="100%">
                    <Title size="h2" c="pink.9">
                      {recordingData.title}
                    </Title>
                    <BsThreeDotsVertical size="32" color="#A61E4D" />
                  </Group>
                  <Group justify="space-between" w="100%">
                    <Text size="lg" c="gray.7">
                      {recordingData.topic}
                    </Text>
                    <Text c="gray.7">{recordingData.created_at}</Text>
                  </Group>

                  <Text>{recordingData.description}</Text>
                </Stack>
              )}
            </Group>
            <Divider w="100%" color="pink.9" size="md"></Divider>
          </Stack>
        </Center>
        {recordingData && (
          <Group w="100%" h="100%" gap="0">
            <Box w="70%" h="100%">
              <VideoPlayer videoUrl={recordingData.playlist_file_url} />
            </Box>
            <Stack w="30%" h="100%">
              <ChatWithRecording roomId={recordingData.room_id} />
            </Stack>
          </Group>
        )}
      </Stack>
    </ResizableFlex>
  );
};

export default Recording;
