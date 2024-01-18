import { Flex, Image, Stack, Text, Title } from "@mantine/core";
import React from "react";

type Props = {
  index: boolean;
  title: string;
  description: string;
  illustration: string;
};

const Feature = ({ index, title, description, illustration }: Props) => {
  return (
    <Flex
      direction={{
        sm: "column",
        md: "column-reverse",
        lg: index ? "row-reverse" : "row",
      }}
      w='100vw'
      maw='100%'
      h="60vh"
      pl="5vw"
      pr="5vw"
    >
      <Stack w="45vw" bg="white" justify="center" >
        <Title order={3} size="h3">{title}</Title>
        <Text>{description}</Text>
      </Stack>
      <Flex w="45vw" align="center" justify={index ? "left" : "right"}>
        <Image
          h="60vh"
          src={`/assets/${illustration}.png`}
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      </Flex>
    </Flex>
  );
};

export default Feature;
