import React, { useMemo } from "react";
import { Avatar, Box, Text, Timeline } from "@mantine/core";
import { useRouter } from "next/router";

type Hub = {
  creator_name: string;
  hub_id: string;
  name: string;
  theme_color: string;
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

const UserDrawerDropdown = ({
  DropDownElements,
}: {
  DropDownElements: Hub[];
}) => {
  const router = useRouter();
  return (
    <Box maw="12vw" mt="-2vh" style={{ zIndex: -1 }} mb="2vh">
      <Timeline pos="relative" active={0} lineWidth={2} bulletSize={24}>
        <Timeline.Item
          title="&#8203;"
          color="white"
          style={{
            root: {
              "--tl-color": "#FFFFFF",
            },
            width: 0,
            borderColor: "white",
          }}
        ></Timeline.Item>
        {DropDownElements.map((element, index) => {
          const memoizedColor = useMemo(() => {
            const randomColor =
              googleClassroomPalette[
                Math.floor(Math.random() * googleClassroomPalette.length)
              ];
            return randomColor;
          }, [googleClassroomPalette]);
          return (
            <Timeline.Item
              key={index}
              bullet={
                <Avatar size={24} radius="lg" bg={element.theme_color} color="white">
                  {element.name.toUpperCase()[0]}
                </Avatar>
              }
              title={
                <Text
                  style={{
                    fontSize: "14px",
                  }}
                >
                  {element.name}
                </Text>
              }
              onClick={()=>{router.push(`http://localhost:3000/hub/${element.hub_id}`)}}
            ></Timeline.Item>
          );
        })}
      </Timeline>
    </Box>
  );
};

export default UserDrawerDropdown;
