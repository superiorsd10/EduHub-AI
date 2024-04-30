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
      <BackgroundImage src="https://eduhub-ai.s3.ap-south-1.amazonaws.com/banners/banner-example-header.png" radius='lg'>
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
