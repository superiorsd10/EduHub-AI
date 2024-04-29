import { Button, Group, Radio, Stack, Text, TextInput } from "@mantine/core";
import React, { useState } from "react";

type EditableSCQProps = {
  questionNumber: number;
  title: string;
  options: string[];
};

const EditableSCQ: React.FC = () => {
  
  const [title, setTitle] = useState<string>("Untitled Question");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [optionInputs, setOptionInputs] = useState<string[]>([]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...optionInputs];
    newOptions[index] = value;
    setOptionInputs(newOptions);
  };

  const addOption = () => {
    setOptionInputs([...optionInputs, ""]);
  };

  return (
    <Stack>
      <Stack>
        <TextInput
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
          placeholder="Enter Question"
        />
      </Stack>
      <Stack>
        {optionInputs.map((option: string, idx: number) => (
          <Radio
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            checked={idx === selectedIndex}
            color="black"
            size="sm"
            label={
              <TextInput
                value={option}
                onChange={(event) =>
                  handleOptionChange(idx, event.currentTarget.value)
                }
                placeholder={`Option ${idx + 1}`}
              />
            }
          />
        ))}
        <Button onClick={addOption} bg="gray">
          Add Option
        </Button>
      </Stack>
    </Stack>
  );
};

export default EditableSCQ;
