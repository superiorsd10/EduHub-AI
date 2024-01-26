import { ActionIcon, Flex, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareXTwitter,
  faLinkedin,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons";

const Footer: React.FC = () => {
  return (
    <Stack
      bg="black"
      h="100svh"
      w="100vw"
      maw="100%"
      pl="5vw"
      pr="5vw"
      pb="2vw"
      mt="10vh"
      id="footer"
    >
      <Flex style={{ flex: 1 }} justify="center" align="center">
        <Text
          color="white"
          display={{ base: "none", sm: "none", md: "flex", lg: "flex" }}
          style={{ fontSize: "7em", fontWeight: "bold" }}
        >
          EduHub-AI
        </Text>
        <Text
          color="white"
          display={{ base: "flex", sm: "flex", md: "none", lg: "none" }}
          style={{ fontSize: "4em", fontWeight: "bold" }}
        >
          EduHub-AI
        </Text>
      </Flex>
      <Group align="flex-end">
        <Group mr="auto">
          <ActionIcon color="black">
            <FontAwesomeIcon icon={faSquareXTwitter} color="white" size="2x" />
          </ActionIcon>
          <ActionIcon color="black">
            <FontAwesomeIcon icon={faLinkedin} color="white" size="2x" />
          </ActionIcon>
          <ActionIcon color="black">
            <FontAwesomeIcon icon={faSquareInstagram} color="white" size="2x" />
          </ActionIcon>
        </Group>
        <Stack>
          <Text color="white" style={{ textAlign: "right", lineHeight: 1 }}>
            eduhubai@gmail.com
          </Text>
          <Text color="white" style={{ textAlign: "right", lineHeight: 1 }}>
            +91-0123456789
          </Text>
        </Stack>
      </Group>
      <Flex direction={{ base: "column-reverse", sm: 'column-reverse', md: 'row', lg: 'row' }} gap={{ base: 'sm', sm: 'sm', md: 0, lg: 0 }}>
        <Text mr="auto" color="white" style={{ lineHeight: 1 }}>
          © 2024 EduHub-AI. All rights reserved
        </Text>
        <Group>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link href="#" style={{ color: "white", textDecoration: "none" }}>
            Cookies
          </Link>
        </Group>
      </Flex>
    </Stack>
  );
};

export default Footer;
