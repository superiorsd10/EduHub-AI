import { Group, ListItem, Radio, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

type mcqProps = {
  questionNumber: number;
  title: string;
  options: string[];
};

const MCQ: React.FC<mcqProps> = ({ questionNumber, title, options }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  return (
    <Stack>
      <Group>
        <Text>{questionNumber}.</Text>
        <Text>{title}</Text>
      </Group>
      <Stack pl="lg">
        {options.map((option:string,idx:number) => (
          <Radio
            onClick={()=>setSelectedIndex(idx)}
            checked={idx===selectedIndex}
            color="black"
            size="sm"
            label={option}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default MCQ;
