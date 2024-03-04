import { BackgroundImage, Flex, Text, Title } from "@mantine/core";
import React from "react";

type Props = {};

const Banner = ({title}: {title:string}) => {
  return (
    <Flex
      bg="pink"
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
