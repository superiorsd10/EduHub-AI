import { Group, ListItem, Radio, Stack, Text } from "@mantine/core";
import React, { useState } from "react";

type MultiSelectMCQProps = {
  questionNumber: number;
  title: string;
  options: string[];
};

const MultiSelectMCQ: React.FC<MultiSelectMCQProps> = ({ questionNumber, title, options }) => {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const handleClick = (index: number) => {
    // Update selected indexes based on click
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  return (
    <Stack>
      <Group>
        <Text>{questionNumber}.</Text>
        <Text>{title}</Text>
      </Group>
      <Stack pl="lg">
        {options.map((option: string, idx: number) => (
          <Radio
            key={idx} 
            onClick={() => handleClick(idx)}
            checked={selectedIndexes.includes(idx)}
            color="black"
            size="sm"
            label={option} 
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default MultiSelectMCQ;
