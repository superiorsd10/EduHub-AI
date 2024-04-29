import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { AppContext } from "../../providers/AppProvider";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import { HubContext } from "@/providers/HubProvider";

const CreateRecordingModal: React.FC<{
  isCreateRecordingVisible: boolean;
  setIsCreateRecordingVisible: (isCreateRecordingVisible: boolean) => void;
  roomId: string;
}> = ({ isCreateRecordingVisible, setIsCreateRecordingVisible, roomId }) => {
  const [title, setTitle] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setRecordingData } = useContext(HubContext);

  const handleCreateHub = async () => {
    setLoading(true);
    try {
      setRecordingData({
        title: title,
        topic: topic,
        description: description,
        room_id: roomId,
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
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

export default CreateRecordingModal;
