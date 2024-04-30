import { BackgroundImage, Flex, Text, Title } from "@mantine/core";
import React from "react";

const Banner = ({title,theme_color}: {title:string,theme_color:string}) => {
  return (
    <Flex
      bg={theme_color}
      h="30vh"
      style={{ borderRadius: "24px" }}
      pos="relative"
    >
      <BackgroundImage src="" radius='lg'>
        <Title
          size="h3"
          style={{ color: "white" }}
          pos="absolute"
          bottom="5%"
          right="2%"
        >
          {title}
        </Title>
      </BackgroundImage>
    </Flex>
  );
};

export default Banner;
