import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { useContext, useState } from "react";
import { HubContext } from "@/providers/HubProvider";
import { AppContext } from "@/providers/AppProvider";
import { useRouter } from "next/router";

const CreateRecordingModal: React.FC<{
  isCreateRecordingVisible: boolean;
  setIsCreateRecordingVisible: (isCreateRecordingVisible: boolean) => void;
  roomId: string;
  teacherCode: string;
  studentCode: string;
}> = ({
  isCreateRecordingVisible,
  setIsCreateRecordingVisible,
  roomId,
  teacherCode,
  studentCode
}) => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useContext(AppContext);
  const {appendPost} = useContext(HubContext);
  const hub_id = router.query.hub_id as string;

  const handleMakeAnnouncement = async () => {
    const formData = new FormData();
    formData.append("type", "announcement");
    formData.append("title",`Live Class on topic ${topic} has started.`)
    formData.append(
      "description",
      `Join Live class here http://localhost:3000/hub/662e9873bc5597d4fda393cc/live/${studentCode}`
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateRecording = async () => {
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:5000/api/${btoa(hub_id)}/create-recording`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          title: title,
          topic: topic,
          description: description,
          room_id: roomId,
        }),
      });
      await handleMakeAnnouncement();
      setLoading(false);
      setIsCreateRecordingVisible(false);
      await router.push(`http://localhost:3000/hub/${hub_id}/live/${teacherCode}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      opened={isCreateRecordingVisible}
      onClose={() => setIsCreateRecordingVisible(false)}
      title="Create Recording"
      centered
      radius="md"
      zIndex={10001}
    >
      <Input
        placeholder="Recording Title"
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        radius="md"
      />
      <Input
        placeholder="Topic"
        value={topic}
        onChange={(event) => setTopic(event.currentTarget.value)}
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
          onClick={() => setIsCreateRecordingVisible(false)}
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
          onClick={handleCreateRecording}
        >
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateRecordingModal;
