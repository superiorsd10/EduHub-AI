import { Group } from "@mantine/core";
import React from "react";
import Content from "./Content";
import Details from "./Details";

const Body = () => {
  return (
    <Group h="90vh" gap='0'>
      <Content />
      <Details />
    </Group>
  );
};

export default Body;
