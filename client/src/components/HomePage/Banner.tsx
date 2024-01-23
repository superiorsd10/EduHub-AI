import { Button, Flex, Group, Image, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import React from "react";

const Banner:React.FC = () => {
  return (
    <Flex
      direction={{ sm: "column", md: "column-reverse", lg: "row" }}
      w="100vw"
      maw="100%"
      h="85vh"
      pl="5vw"
      pr="5vw"
      mb='10vh'
      id='features'
    >
      <Stack w="45vw" bg="white" justify="center">
        <Title order={1} size="h1" >Unleashing Knowledge, Revolutionizing Learning</Title>
        <Text color='gray.7'>
          Empower your education journey with EduHub-AI, where students,
          teachers, and artificial intelligence converge for an unparalleled
          learning experience.
        </Text>
        <Group>
        <Link href="signup">
          <Button color="black" radius="md">
            Join Today
          </Button>
        </Link>
          <Button variant="default">Learn More</Button>
        </Group>
      </Stack>
      <Flex w="45vw">
        <Image
          src="/assets/HomeBanner.png"
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      </Flex>
    </Flex>
  );
};

export default Banner;
