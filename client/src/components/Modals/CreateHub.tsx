import NextLink from "@/utils/NextLink";
import { Button, ColorPicker, Group, Input, Modal, Text, Textarea } from "@mantine/core";
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
  const [value, onChange] = useState('#e64980');
  const { setIsCreateHubVisible, displayPhoto, userName, appendHub, token,email } =
    useContext(AppContext);
  
  const handleCreateHub = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`http://127.0.0.1:5000/api/create-hub?email=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          hub_name: hubName,
          section: section,
          description: description,
          theme_color: value,
        }),
      });
      const rr=await resp.json();
      console.log(rr)
      const { hub_id } = rr;
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


      <ColorPicker value={value} onChange={onChange} style={{marginLeft:'auto'}}  fullWidth swatchesPerRow={10} format="hex" swatches={['#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886']} />
      
  
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
