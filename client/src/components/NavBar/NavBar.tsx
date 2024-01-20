import { Button, Container, Flex, Group, Image, Space } from "@mantine/core";
import Link from "next/link";
import React from "react";

const NavBar: React.FC = () => {
  return (
    <Flex h="15vh" pl="5vw" pr="5vw" justify="center" maw="100%">
      <Link href="/">
        <Image
          src="/assets/logo.png"
          alt="Logo"
          style={{ width: '100px', height: '100px' }}
        />
      </Link>
      <Group>
        <Link style={{ textDecoration: "none", color: "black" }} href="/">
          Home
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="/">
          Features
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="/">
          FAQ
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="/">
          Contact
        </Link>
      </Group>
      <Group ml="auto">
        <Link href="signin" passHref>
          <Button variant="default" radius="md">
            Sign In
          </Button>
        </Link>
        <Link href="signup">
          <Button color="black" radius="md">
            Join Today
          </Button>
        </Link>
      </Group>
    </Flex>
  );
};

export default NavBar;
