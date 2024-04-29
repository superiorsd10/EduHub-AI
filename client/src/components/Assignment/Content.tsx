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
  Text,
  Title,
} from "@mantine/core";
import React, { useContext, useState } from "react";
import Question from "./Question";

const Content = () => {
  const { setIsPreviewAssignmentVisible } = useContext(AssignmentContext);
  const [value, setValue] = useState<string | null>("");
  const [assignmentType, setAssignmentType] = useState<"AI" | "Manual">("AI");
  const [questions, setQuestions] = useState<string[]>([]);

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  return (
    <Stack
      h="90vh"
      w="60%"
      pl="5%"
      pr="5%"
      style={{ borderRight: "1px solid #ADB5BD" }}
      pt="lg"
      pb="lg"
      justify="space-between"
    >
      {assignmentType === "AI" ? (
        <Stack mah='85vh' h='85vh' style={{overflowY:'auto'}}>
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
                setIsPreviewAssignmentVisible(true);
              }}
            >
              Preview
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack>
          <Stack>
            <Input placeholder="Title" style={{ border: "none" }}></Input>
            <Input placeholder="Description" style={{ border: "black" }}></Input>
            {questions.map((_, index) => (
              <Question key={index} />
            ))}
            
          </Stack>
        </Stack>
      )}

      <Group h="4.5vh" justify="space-between">
        <Radio
          checked={false}
          color="black"
          label={`Generate Assignment ${
            assignmentType === "AI" ? "by AI" : "Manually"
          }`}
          onClick={() => {
            if (assignmentType === "AI") setAssignmentType("Manual");
            else setAssignmentType("AI");
          }}
        />
        {assignmentType==="Manual" && <Button bg='black' onClick={addQuestion}>Add Question</Button>}
      </Group>
    </Stack>
  );
};

export default Content;
