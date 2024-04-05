import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { AuthContext } from "../../providers/AuthProvider";
import { useContext, useState } from "react";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const [hubName, setHubName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token,setIsCreateHubVisible } = useContext(AuthContext);

  const handleCreateHub = async () => {
    setLoading(true);
    try {
      const resp=await fetch('http://127.0.0.1:5000/api/create-hub',{
        method:'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, 
        },
        body: JSON.stringify({
          hub_name: hubName,
          section: section,
          description: description,
          email: "mail@gmail.com"
        }),
      });
      setIsCreateHubVisible(false);
    }
    catch (error){
      console.log(error);
    }
    setLoading(false);
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
        <Button loading={loading} color="black" radius="md" onClick={handleCreateHub}>
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateHubModal;
