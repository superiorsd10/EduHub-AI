import { Button, Container, Flex, Group, Image, Space } from "@mantine/core";
import Link from "next/link";
import React from "react";

const NavBar: React.FC = () => {
  return (
    <Flex h="15vh" pl="5vw" pr="5vw" justify="center" maw="100%">
      <Flex>
        <Image src="/assets/logo.png"></Image>
      </Flex>
      <Group>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Home
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Features
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          FAQ
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Contact
        </Link>
      </Group>
      <Group ml="auto">
        <Button variant="default" radius="md">
          Sign In
        </Button>
        <Button color="black" radius="md">
          Join Today
        </Button>
      </Group>
    </Flex>
  );
};

export default NavBar;
