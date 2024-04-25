import { Button, Group, Text, Title } from "@mantine/core";
import React from "react";
import { FaBook } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  return (
    <Group
      h="10vh"
      justify="space-between"
      style={{ borderBottom: "1px solid #ADB5BD" }}
      pl="2.5vw"
      pr="2.5vw"
    >
      <Group>
        <IoCloseSharp size="20px" onClick={()=>router.back()} style={{cursor:'pointer'}}/>
        <FaBook size="20px" color="#C2255C" />
        <Title size="h5">Create Assignment</Title>
      </Group>
      <Button variant="filled" c="white" bg="pink.8">
        Assign
      </Button>
    </Group>
  );
};

export default Navbar;