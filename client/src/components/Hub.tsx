import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar, Card, Divider, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { useRouter } from "next/router";

type Props = {
  creator_name: string;
  hub_id: string;
  name: string;
  photo_url: string;
};

const googleClassroomPalette = [
  "#1E88E5",
  "#D32F2F", // Bright red
  "#388E3C", // Dark green
  "#FFB300", // Vivid yellow
  "#FF7043", // Light red/orange
  "#00ACC1", // Cyan blue
  "#FDD835", // Yellow
  "#6D4C41", // Brown
];

const Hub = ({ creator_name, hub_id, name, photo_url }: Props) => {
  console.log(name,photo_url)
  if(photo_url===undefined) console.log(name,true)
  const router = useRouter();
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      h="fit-content"
      w='18%'
      withBorder
      onClick={() => {
        router.push(`http://localhost:3000/hub/${hub_id}`);
      }}
      style={{cursor:'pointer'}}
    >
      <Card.Section
        h="15vh"
        bg={
          googleClassroomPalette[
            Math.floor(Math.random() * googleClassroomPalette.length)
          ]
        }
        withBorder
        pos="relative"
      >
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
          label={
            <Avatar
              size="lg"
              style={{ marginRight: "-70%" }}
              src={photo_url===undefined?'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/batman_hero_avatar_comics-512.png':photo_url}
            ></Avatar>
          }
        />
      </Card.Section>
      <Stack h="25vh"></Stack>
    </Card>
  );
};

export default Hub;
