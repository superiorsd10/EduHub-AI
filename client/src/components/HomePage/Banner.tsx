import { Button, Flex, Group, Image, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import React, { useContext } from "react";
import { AuthContext } from "../Providers/AuthProvider";

const Banner:React.FC = () => {
  const {componentHeight} = useContext(AuthContext);
  return (
    <Flex
      direction={{ base:'column-reverse',sm: "column-reverse", md: "column-reverse", lg: "row" }}
      w="100vw"
      maw="100%"
      h={componentHeight}
      pl="5vw"
      pr="5vw"
      mb='10vh'
      justify='center'
    >
      <Stack w={{base:'90vw',sm:'90vw',md:'45vw',lg:'45vw'}} bg="white" justify="center">
        <Title size="h1" display={{base:'none',sm:'none',md:'flex',lg:'flex'}}>Unleashing Knowledge, Revolutionizing Learning</Title>
        <Title size="h4" display={{base:'flex',sm:'flex',md:'none',lg:'none'}}>Unleashing Knowledge, Revolutionizing Learning</Title>
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
      <Flex maw={{base:'90vw',sm:'90vw',md:'45vw',lg:'45vw'}} h={{base:'40svh',sm:'40svh',md:componentHeight,lg:componentHeight}}>
        <Image
          style={{objectFit:'contain'}}
          src="/assets/HomeBanner.png"
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      </Flex>
    </Flex>
  );
};

export default Banner;
