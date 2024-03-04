import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Card, Divider, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { useRouter } from "next/router";

type Props = {
  creator_name: string;
  hub_id: string;
  name: string;
};

const Hub = ({ creator_name, hub_id, name }: Props) => {
  const router = useRouter();
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      h="fit-content"
      w="20%"
      withBorder
      onClick={()=>{
        router.push(`http://localhost:3000/hub/${hub_id}`)
      }}
    >
      <Card.Section h="15vh" bg="orange" withBorder pos="relative">
        <Group p="md">
          <Stack>
            <Group justify="space-between">
              <Text color="white" size="xl">
                {name}
              </Text>
              <FontAwesomeIcon
                icon={faEllipsisVertical}
                size="xl"
                style={{
                  color: "#ffffff",
                  position: "absolute",
                  right: "10%",
                }}
              />
            </Group>
            <Text color="white" size="sm">
              {creator_name}
            </Text>
          </Stack>
        </Group>
        <Divider
          w="100%"
          pos="absolute"
          style={{ zIndex: 1000 }}
          left="0"
          bottom="-35%"
          my="xs"
          label={<Avatar size="lg" style={{ marginRight: "-70%" }}></Avatar>}
        />
      </Card.Section>
      <Stack h="25vh"></Stack>
    </Card>
  );
};

export default Hub;
