import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { AuthContext } from "../Providers/AuthProvider";
import { useContext, useState } from "react";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const [hubName, setHubName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const { token } = useContext(AuthContext);

  const handleCreateHub = async () => {
    await fetch('http://127.0.0.1:5000/api/create-hub',{
      method:'POST',
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`, 
      },
      body: JSON.stringify({
        hub_name: hubName,
        section: section,
        description: description,
        email: "nikhilranjan1103@gmail.com" 
      }),
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Create Hub"
      centered
      radius="md"
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
        <Button color="black" radius="md" onClick={handleCreateHub}>
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateHubModal;
