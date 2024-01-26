import React from "react";

import { Avatar, Box, Timeline } from "@mantine/core";

type DropDownElement = {
  text: string;
  href: string;
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
  DropDownElements: DropDownElement[];
}) => {
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
        {DropDownElements.map((element, index) => (
          <Timeline.Item
            key={index}
            bullet={
              <Avatar
                size={24}
                radius="lg"
                bg={
                  googleClassroomPalette[
                    Math.floor(Math.random() * googleClassroomPalette.length)
                  ]
                }
                color="white"
              >
                {element.text[0].toUpperCase()}
              </Avatar>
            }
            title={element.text}
            style={{
              fontSize: "14px",
            }}
          ></Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
};

export default UserDrawerDropdown;
