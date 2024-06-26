import { Avatar, Button, Group, Modal, Stack, Text } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { HubContext } from "@/providers/HubProvider";
import NextLink from "@/utils/NextLink";
import { FaCircleCheck } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { useRouter } from "next/router";
import { AppContext } from "@/providers/AppProvider";

const AcceptRequests: React.FC<{ id: string }> = ({ id }) => {
  const { setIsAcceptRequestsVisible, isAcceptRequestsVisible } =
    useContext(HubContext);
  const { socket } = useContext(AppContext)
  const router = useRouter();
  const hub_id = router.query.hub_id as string;

  const [invitationList, setInvitationList] = useState<string[]>([]);

  const getInvitationList = async () => {
    const resp = await fetch(
      `http://127.0.0.1:5000/api/${btoa(hub_id)}/get-invitation-list`
    );
    const body = await resp.json();
    const list: string[] = body.message;
    setInvitationList(list);
  };

  useEffect(() => {
    if(!isAcceptRequestsVisible) return;
    getInvitationList();
  }, [isAcceptRequestsVisible]);
  return (
    <Modal
      opened={isAcceptRequestsVisible}
      onClose={() => setIsAcceptRequestsVisible(false)}
      title="Pending Requests"
      centered
      radius="md"
      zIndex={10001}
    >
      <Stack mt="sm">
        {invitationList.map((email) => (
          <Group justify="space-between" pl="lg" pr="lg">
            <Group>
              <Avatar />
              <Text>Nikhil Ranjan</Text>
            </Group>
            <Group>
              <FaCircleCheck size="24px" onClick={()=>{
                console.log("clicked accept requests")
                  socket.emit("accept-request", {
                    email: email,
                    hub_id: hub_id
                  });
              }}/>
              <RxCross1 size="24px" onClick={()=>{
                  socket.emit("reject-request", {
                    email: email,
                    hub_id: hub_id
                  });
              }}/>
            </Group>
          </Group>
        ))}
      </Stack>
      <Group mt="lg" justify="center">
        <Button
          onClick={() => setIsAcceptRequestsVisible(false)}
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
