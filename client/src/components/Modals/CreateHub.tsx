import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { AppContext } from "../../providers/AppProvider";
import { useContext, useState } from "react";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const [hubName, setHubName] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setIsCreateHubVisible, displayPhoto, userName, appendHub, token,email } =
    useContext(AppContext);

  const handleGetRoomCode = async () => {
    const URL =
      "https://api.100ms.live/v2/room-codes/room/6610f313e4bed7263690583b";
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTM5NjAxNjMsImV4cCI6MTcxNDU2NDk2MywianRpIjoiZjk4YzVkZTAtY2I2Mi00Y2NhLWI2MGYtYjc4NzdjOGVkYmY1IiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MTM5NjAxNjMsImFjY2Vzc19rZXkiOiI2NjBmY2I1NWJhYmMzM2YwMGU0YWI5NjcifQ.7I8lXaijeT9NO5pTfnDJra-7cEyz_qZOZz9ebg0dzoo";
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    let room_code_student,room_code_ta,room_code_teacher;
    for (let codes of data.data) {
      if(codes.role==="teacher") room_code_teacher=codes.code;
      else if(codes.role==="student") room_code_student=codes.code;
      else if(codes.role==="teaching-assistant") room_code_ta=codes.code;
    }
    return {
      room_code_teacher: room_code_teacher,
      room_code_ta: room_code_ta,
      room_code_student: room_code_student,
    };
  };
  const handleCreateHub = async () => {
    setLoading(true);
    try {
      const { room_code_teacher, room_code_ta, room_code_student } =
        await handleGetRoomCode();
      const resp = await fetch("http://127.0.0.1:5000/api/create-hub", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          hub_name: hubName,
          section: section,
          description: description,
          email: email,
          room_code_teacher: room_code_teacher,
          room_code_ta: room_code_ta,
          room_code_student: room_code_student,
        }),
      });
      const { hub_id } = await resp.json();
      const newHub = {
        creator_name: userName!,
        name: hubName!,
        hub_id: hub_id,
        photo_url: displayPhoto!,
      };
      appendHub(newHub);
      setIsCreateHubVisible(false);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setIsCreateHubVisible(false)}
      title="Create Hub"
      centered
      radius="md"
      zIndex={10001}
    >
      <Input
        placeholder="Hub Name"
        value={hubName}
        onChange={(event) => setHubName(event.currentTarget.value)}
        radius="md"
      />
      <Input
        placeholder="Section"
        value={section}
        onChange={(event) => setSection(event.currentTarget.value)}
        mt="sm"
        radius="md"
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
        mt="sm"
        mb="sm"
        radius="md"
        autosize
        minRows={4}
        maxRows={4}
      />
      <Group mt="sm" justify="flex-end">
        <Button
          onClick={close}
          variant="default"
          radius="md"
          color="black"
          style={{
            borderColor: "none",
            borderWidth: "0",
            bg: "white",
          }}
        >
          <NextLink href="#">Cancel</NextLink>
        </Button>
        <Button
          loading={loading}
          color="black"
          radius="md"
          onClick={handleCreateHub}
        >
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateHubModal;
