import { Group, ListItem, Radio, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

type descriptiveProps = {
  questionNumber: number;
  title: string;
};

const Descriptive: React.FC<descriptiveProps> = ({ questionNumber, title }) => {
  return (
    <Group>
      <Text>{questionNumber}.</Text>
      <Text>{title}</Text>
    </Group>
  );
};

export default Descriptive;
