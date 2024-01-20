import { ActionIcon, Flex, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSquareXTwitter,
  faLinkedin,
  faSquareInstagram,
} from "@fortawesome/free-brands-svg-icons";

const Footer:React.FC = () => {
  return (
    <Stack
      bg="black"
      h="100svh"
      w="100vw"
      maw="100%"
      pl="5vw"
      pr="5vw"
      pb="2vw"
      mt="30vh"
      id='footer'
    >
      <Flex style={{ flex: 1 }} justify="center" align="center">
        <Text color="white" style={{ fontSize: "7em", fontWeight: "bold" }}>
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
          <Text color="white">eduhubai@gmail.com</Text>
          <Text color="white" style={{ textAlign: "right" }}>
            +91-0123456789
          </Text>
        </Stack>
      </Group>
      <Group>
        <Text mr="auto" color="white">
          © 2024 EduHub-AI. All rights reserved
        </Text>
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
    </Stack>
  );
};

export default Footer;
