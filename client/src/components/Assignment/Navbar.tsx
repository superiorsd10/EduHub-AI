import { Button, Group, Text, Title } from "@mantine/core";
import React, { useContext } from "react";
import { FaBook } from "react-icons/fa6";
import { IoCloseSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import { AppContext } from "@/providers/AppProvider";
import { AssignmentContext, AssignmentProvider } from "@/providers/AssignmentProvider";

const Navbar = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const { id } = useContext(AssignmentContext);
  const {email,token} = useContext(AppContext);
  const {title,topic,instructions,points,isAutomaticFeedbackEnabled,setIsAutomaticFeedbackEnabled,isAutomaticGradingEnabled,isEnabledPlagriasmChecker} = useContext(AssignmentContext);
  
  const handleAssignAssignment = async () => {
    console.log(email,id);
    const request = await fetch(
      `http://127.0.0.1:5000/api/${btoa(hub_id)}/create-assignment-using-ai/${btoa(id as string)}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
          body:JSON.stringify({
            "title":title,
            "topic":topic,
            "instructions":instructions,
            "due_datetime":Date.now(),
            "total_points":points,
            "automatic_grading_enabled":isAutomaticGradingEnabled,
            "automatic_feedback_enabled":isAutomaticFeedbackEnabled,
            "plagiarism_checker_enabled":isEnabledPlagriasmChecker
          })
        },
      }
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
