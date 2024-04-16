import { Avatar, Button, Group, Modal, Stack, Text } from "@mantine/core";
import React, { useContext } from "react";
import { HubContext } from "@/providers/HubProvider";
import NextLink from "@/utils/NextLink";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";

const AcceptRequests:React.FC<{id: string;}> = ({id}) => {
  const { setIsAcceptRequestsVisible, isAcceptRequestsVisible } =
    useContext(HubContext);
  return (
    <Modal
      opened={isAcceptRequestsVisible}
      onClose={() => setIsAcceptRequestsVisible(false)}
      title="Pending Requests"
      centered
      radius="md"
      zIndex={10001}
    >
      <Stack mt='sm'>
        <Group justify="space-between" pl='lg' pr='lg'>
          <Group>
            <Avatar/>
            <Text>Nikhil Ranjan</Text>
          </Group>
          <Group>
            <FaCircleCheck size="24px"/>
            <RxCross1 size="24px"/>
          </Group>
        </Group>
        <Group justify="space-between" pl='lg' pr='lg'>
          <Group>
            <Avatar/>
            <Text>Nikhil Ranjan</Text>
          </Group>
          <Group>
            <FaCircleCheck size="24px"/>
            <RxCross1 size="24px"/>
          </Group>
        </Group>
        <Group justify="space-between" pl='lg' pr='lg'>
          <Group>
            <Avatar/>
            <Text>Nikhil Ranjan</Text>
          </Group>
          <Group>
            <FaCircleCheck size="24px"/>
            <RxCross1 size="24px"/>
          </Group>
        </Group>
        <Group justify="space-between" pl='lg' pr='lg'>
          <Group>
            <Avatar/>
            <Text>Nikhil Ranjan</Text>
          </Group>
          <Group>
            <FaCircleCheck size="24px"/>
            <RxCross1 size="24px"/>
          </Group>
        </Group>
      </Stack>
      <Group mt="lg" justify="center">
        <Button
          onClick={()=>setIsAcceptRequestsVisible(false)}
          variant="default"
          radius="md"
          color="black"
          style={{
            borderColor: "none",
            borderWidth: "0",
            bg: "white",
          }}
        >
          <NextLink href="#">Close</NextLink>
        </Button>
        <Button loading={false} color="black" radius="md">
          Accept All
        </Button>
      </Group>
    </Modal>
  );
};

export default AcceptRequests;