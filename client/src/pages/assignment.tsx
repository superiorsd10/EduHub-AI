import React from "react";
import { NextPageWithLayout } from "./_app";
import EmptyLayout from "@/components/EmptyLayout";
import { Button, Group, Stack, Text } from "@mantine/core";
import { IoCloseSharp } from "react-icons/io5";
import { FaBook } from "react-icons/fa";
import Navbar from "@/components/Assignment/Navbar";
import Body from "@/components/Assignment/Body";

type Props = {};

const assignment: NextPageWithLayout = (props: Props) => {
  return (
    <Stack gap="0">
      <Navbar />
      <Body />
    </Stack>
  );
};

export default assignment;
assignment.getLayout = EmptyLayout;
