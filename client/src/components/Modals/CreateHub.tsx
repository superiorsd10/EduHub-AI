import NextLink from "@/utils/NextLink";
import {
  Button,
  ColorPicker,
  Group,
  Input,
  Modal,
  Tabs,
  Text,
  Textarea,
} from "@mantine/core";
import { AppContext } from "../../providers/AppProvider";
import { useContext, useState } from "react";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void; view: string }> = ({
  opened,
  close,
  view="first"
}) => {
  const [hubName, setHubName] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>(view);
  const [roomCode, setRoomCode] = useState<string>("");
  const [value, onChange] = useState("#e64980");
  const {
    setIsCreateHubVisible,
    displayPhoto,
    userName,
    appendHub,
    token,
    email,
    socket
  } = useContext(AppContext);

  const handleCreateHub = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        `http://127.0.0.1:5000/api/create-hub?email=${email}`,
        {
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
        }
      );
      const rr = await resp.json();
      const { hub_id } = rr;
      const newHub = {
        creator_name: userName!,
        name: hubName!,
        hub_id: hub_id,
        theme_color: value,
      };
      appendHub(newHub);
      setIsCreateHubVisible(false);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const handleJoinHub = async () => {
    setLoading(true);
    try {
      const inviteData = {
        invite_code: roomCode,
        email: email
      }
      console.log(inviteData);
      socket.emit("invite-sent", inviteData, (response:any) => {
        console.log(response);
      });
      setIsCreateHubVisible(false);
    } catch (error) {
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
      zIndex={10001}
    >
      <Tabs
        color="black"
        defaultValue="first"
        value={activeTab}
        onChange={setActiveTab}
      >
      <Tabs.List>
        <Tabs.Tab value="first">Create Hub</Tabs.Tab>
        <Tabs.Tab value="second">Join Hub</Tabs.Tab>
      </Tabs.List>
        <Tabs.Panel value="first" pt="xs">
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

          <ColorPicker
            value={value}
            onChange={onChange}
            style={{ marginLeft: "auto" }}
            fullWidth
            swatchesPerRow={10}
            format="hex"
            swatches={[
              "#e64980",
              "#be4bdb",
              "#7950f2",
              "#4c6ef5",
              "#228be6",
              "#15aabf",
              "#12b886",
            ]}
          />

          <Group mt="sm" justify="flex-end">
            <Button
              onClick={()=>setIsCreateHubVisible(false)}
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
        </Tabs.Panel>
        <Tabs.Panel value="second" pt="xs">
          <Input
            placeholder="Room Code"
            value={roomCode}
            onChange={(event) => setRoomCode(event.currentTarget.value)}
            radius="md"
          />
          <Group mt="sm" justify="flex-end">
            <Button
              onClick={close}
              variant="default"
              radius="md"
              color="gray"
              style={{
                borderColor: "transparent",
                bg: "white",
              }}
            >
              <NextLink href="#">Cancel</NextLink>
            </Button>
            <Button
              loading={loading}
              color="black"
              radius="md"
              onClick={handleJoinHub}
            >
              Join
            </Button>
          </Group>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default CreateHubModal;
