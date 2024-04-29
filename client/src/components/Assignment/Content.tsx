import { AssignmentContext } from "@/providers/AssignmentProvider";
import {
  Input,
  Stack,
  Textarea,
  Radio,
  MultiSelect,
  Group,
  Button,
} from "@mantine/core";
import React, { useContext, useState } from "react";
import Question from "./Question";

const Content = () => {
  const { setIsPreviewAssignmentVisible } = useContext(AssignmentContext);
  const [assignmentType, setAssignmentType] = useState<"AI" | "Manual">("AI");
  const [questions, setQuestions] = useState<string[]>([]);

  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [topics, setTopics] = useState<string>("");
  const [specificTopics, setSpecificTopics] = useState<string>("");
  const [instructionsForAI, setInstructionsForAI] = useState<string>("");
  const [typeOfQuestions, setTypeOfQuestions] = useState<string>("");

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
        <Stack mah="85vh" h="85vh" style={{ overflowY: "auto" }}>
          <Input
            placeholder="Title"
            style={{ border: "black" }}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          ></Input>
          <Textarea
            placeholder="Instructions (optional)"
            minRows={5}
            autosize
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
          ></Textarea>
          <Stack>
            <Radio
              checked={true}
              color="black"
              label="Generate Assignment using AI"
            />
            <Stack pl="xl">
              <Input
                placeholder="Select Topics"
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
              ></Input>
              <Textarea
                placeholder="Any specific syllabus/topic you wanna mention (optional)"
                minRows={5}
                autosize
                value={specificTopics}
                onChange={(event) => setSpecificTopics(event.target.value)}
              ></Textarea>
              <Input
                placeholder="Any specific instruction for AI (optional)"
                value={instructionsForAI}
                onChange={(event) => setInstructionsForAI(event.target.value)}
              ></Input>
              <Group gap="0">
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRight: "0px",
                    borderRadius: "0px",
                    borderTopLeftRadius: "10%",
                    borderBottomLeftRadius: "10%",
                  }}
                  pl="md"
                  pr="md"
                >
                  SCQ
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRight: "0px",
                    borderLeft:'0px',
                    borderRadius: "0px",
                  }}
                  pl="md"
                  pr="md"
                >
                  MCQ
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRight: "0px",
                    borderLeft:'0px',
                    borderRadius: "0px",
                  }}
                  pl="md"
                  pr="md"
                >
                  Numerical
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRadius: "0px",
                    borderLeft:'0px',
                    borderTopLeftRadius:'0',
                    borderBottomLeftRadius:'0',
                    borderTopRightRadius: "10%",
                    borderBottomRightRadius: "10%",
                  }}
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
            <Input
              placeholder="Description"
              style={{ border: "black" }}
            ></Input>
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
            assignmentType === "AI" ? "Manually" : "by AI"
          }`}
          onClick={() => {
            if (assignmentType === "AI") setAssignmentType("Manual");
            else setAssignmentType("AI");
          }}
        />
        {assignmentType === "Manual" && (
          <Button bg="black" onClick={addQuestion}>
            Add Question
          </Button>
        )}
      </Group>
    </Stack>
  );
};

export default Content;
