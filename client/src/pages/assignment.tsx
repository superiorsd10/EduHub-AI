import React from "react";
import { NextPageWithLayout } from "./_app";
import EmptyLayout from "@/components/EmptyLayout";
import { Button, Group, Stack, Text } from "@mantine/core";
import Navbar from "@/components/Assignment/Navbar";
import Body from "@/components/Assignment/Body";
import { AssignmentProvider } from "@/providers/AssignmentProvider";
import PreviewAssignment from "@/components/Modals/PreviewAssignment";

const AssignmentWithoutContext: NextPageWithLayout = () => {
  return (
    <Stack gap="0">
      <Navbar />
      <Body />
      <PreviewAssignment />
    </Stack>
  );
};

const Assignment = () => {
  return (
    <AssignmentProvider>
      <AssignmentWithoutContext/>
    </AssignmentProvider>
  )
}

export default Assignment;
Assignment.getLayout = EmptyLayout;
