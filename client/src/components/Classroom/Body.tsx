import { Group } from "@mantine/core";
import React, { useContext } from "react";
import LeftBar from "./LeftBar";
import Content from "./Content";
import { AuthContext } from "../Providers/AuthProvider";

type Props = {};

const Body = (props: Props) => {
  const { componentHeight } = useContext(AuthContext);
  return (
    <Group pos="relative" w='100%' gap='xl' align="flex-start">
      <LeftBar />
      <Content />
    </Group>
  );
};

export default Body;
