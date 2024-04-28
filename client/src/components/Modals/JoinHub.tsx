import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal } from "@mantine/core";
import { AppContext } from "../../providers/AppProvider";
import { useContext, useState } from "react";
import io from 'socket.io-client';

const JoinhubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const [roomCode, setRoomCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { socket,email } = useContext(AppContext);

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
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Join Hub"
      centered
      radius="md"
      zIndex={10001}
    >
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
          color="blue"
          radius="md"
          onClick={handleJoinHub}
        >
          Join
        </Button>
      </Group>
    </Modal>
  );
};

export default JoinhubModal;
