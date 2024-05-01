import { Button, Group, Text, Title } from "@mantine/core";
import React, { useContext } from "react";
import { FaBook } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import { AppContext } from "@/providers/AppProvider";
import { AssignmentContext } from "@/providers/AssignmentProvider";

const Navbar = () => {
  const router = useRouter();
  const { id } = useContext(AssignmentContext);
  const {email} = useContext(AppContext);
  
  const handleAssignAssignment = async () => {
    console.log(email,id);
    const request = await fetch(
      `http://127.0.0.1:5000/api/submit-assignment/${btoa(id as string)}?email=${email}`
    );
    const req = await request.json();
    console.log(req);
  };
  return (
    <Group
      h="10vh"
      justify="space-between"
      style={{ borderBottom: "1px solid #ADB5BD" }}
      pl="2.5vw"
      pr="2.5vw"
    >
      <Group>
        <IoCloseSharp
          size="20px"
          onClick={() => router.back()}
          style={{ cursor: "pointer" }}
        />
        <FaBook size="20px" color="#C2255C" />
        <Title size="h5">Create Assignment</Title>
      </Group>
      <Button variant="filled" c="white" bg="pink.8" onClick={() => handleAssignAssignment()}>
        Assign
      </Button>
    </Group>
  );
};

export default Navbar;
