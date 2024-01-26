import React from "react";
import { useRouter } from "next/router";
import { Flex, Image } from "@mantine/core";

const Navbar: React.FC = () => {
  const router = useRouter();
  return (
    <Flex h="15vh" justify="left" w="100vw" maw="100%">
      <Flex h={{ base: "10vh", sm: "10vh", md: "15vh", lg: "15vh" }}>
        <Image
          src="/assets/logo.png"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        ></Image>
      </Flex>
    </Flex>
  );
};

export default Navbar;
