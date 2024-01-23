import { Flex, Image } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";

const Navbar:React.FC = () => {
  const router = useRouter();
  return (
    <Flex h="15vh" justify="left" w="100vw" maw="100%">
      <Flex h="15vh">
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
