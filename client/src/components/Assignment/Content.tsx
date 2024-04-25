import {
  AssignmentContext,
  AssignmentProvider,
} from "@/providers/AssignmentProvider";
import {
  Input,
  Stack,
  Textarea,
  Radio,
  MultiSelect,
  Group,
  Button,
  Box,
} from "@mantine/core";
import React, { useContext, useState } from "react";

const Content = () => {
  const { setIsPreviewAssignmentVisible } = useContext(AssignmentContext);
  const [value, setValue] = useState<string | null>("");
  return (
    <Stack
      h="100%"
      w="60%"
      pl="5%"
      pr="5%"
      style={{ borderRight: "1px solid #ADB5BD" }}
      pt="lg"
    >
      <Input placeholder="Title" style={{ border: "black" }}></Input>
      <Textarea
        placeholder="Instructions (optional)"
        minRows={5}
        autosize
      ></Textarea>
      <Stack>
        <Radio
          checked={true}
          color="black"
          label="Generate Assignment using AI"
        />
        <Stack pl="xl">
          <MultiSelect
            data={["Cryptography", "Discrete Mathematics"]}
            searchable
            placeholder="Select topics"
            nothingFoundMessage="Nothing found..."
            checkIconPosition="left"
            maxDropdownHeight={200}
            comboboxProps={{
              transitionProps: { transition: "pop", duration: 200 },
            }}
          ></MultiSelect>
          <Textarea
            placeholder="Any specific syllabus/topic you wanna mention (optional)"
            minRows={5}
            autosize
          ></Textarea>
          <Input placeholder="Any specific instruction for AI (optional)"></Input>
          <Group gap="0">
            <Button
              variant="outline"
              color="gray.7"
              style={{ border: "2px solid black" }}
              pl="md"
              pr="md"
            >
              SCQ
            </Button>
            <Button
              variant="outline"
              color="gray.7"
              style={{ border: "2px solid black" }}
              pl="md"
              pr="md"
            >
              MCQ
            </Button>
            <Button
              variant="outline"
              color="gray.7"
              style={{ border: "2px solid black" }}
              pl="md"
              pr="md"
            >
              Numerical
            </Button>
            <Button
              variant="outline"
              color="gray.7"
              style={{ border: "2px solid black" }}
              pl="md"
              pr="md"
            >
              Descriptive
            </Button>
          </Group>
        </Stack>
        <Button
          ml="auto"
          size="sm"
          w="fit-content"
          bg="black"
          onClick={() => {
            setIsPreviewAssignmentVisible(true)
            console.log("ff")
          }}
        >
          Preview
        </Button>
      </Stack>
      <Stack>
        <Radio
          checked={false}
          color="black"
          label="Generate Assignment manually"
        />
      </Stack>
    </Stack>
  );
};

export default Content;
