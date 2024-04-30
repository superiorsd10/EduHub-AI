import React, { useContext, useEffect, useState } from "react";
import {
  Input,
  Stack,
  Textarea,
  Radio,
  Group,
  Button,
  Text,
  TextInput,
} from "@mantine/core";
import { AssignmentContext } from "@/providers/AssignmentProvider";
import Question from "./Question";
import { useRouter } from "next/router";
import { AppContext } from "@/providers/AppProvider";
import { subscribeToChannel, unsubscribeFromChannel } from "../../api/util/Redis";

const Content = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id;
  const { token } = useContext(AppContext);
  const { setIsPreviewAssignmentVisible } = useContext(AssignmentContext);
  const [assignmentType, setAssignmentType] = useState<"AI" | "Manual">("AI");
  const [questions, setQuestions] = useState<string[]>([]);

  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [topics, setTopics] = useState<string>("");
  const [specificTopics, setSpecificTopics] = useState<string>("");
  const [instructionsForAI, setInstructionsForAI] = useState<string>("");
  const [selectedQuestionType, setSelectedQuestionType] = useState<
    "" | "MCQ" | "SCQ" | "Descriptive" | "Numerical"
  >("");
  const [typesOfQuestions, setTypesOfQuestions] = useState<{
    "single-correct-type": number[];
    "multiple-correct-type": number[];
    "descriptive-type": number[];
    "numerical-type": number[];
  }>({
    "single-correct-type": [0, 0],
    "multiple-correct-type": [0, 0],
    "descriptive-type": [0, 0],
    "numerical-type": [0, 0],
  });

  useEffect(() => {
    const channelId = '9d3e093b-ae99-4e4b-b9e7-7c9d18396eb8';

    const handleMessage = (channel:string, message:string) => {
      console.log(`Received message on channel ${channel}: ${message}`);
      // Handle the message here
    };

    subscribeToChannel(channelId, handleMessage);

    return () => {
      unsubscribeFromChannel(channelId);
    };
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const updateTypesOfQuestions = (index: number, value: number) => {
    switch (selectedQuestionType) {
      case "MCQ":
        setTypesOfQuestions({
          ...typesOfQuestions,
          "multiple-correct-type": [
            index === 0 ? value : typesOfQuestions["multiple-correct-type"][0],
            index === 1 ? value : typesOfQuestions["multiple-correct-type"][1],
          ],
        });
        break;
      case "SCQ":
        setTypesOfQuestions({
          ...typesOfQuestions,
          "single-correct-type": [
            index === 0 ? value : typesOfQuestions["single-correct-type"][0],
            index === 1 ? value : typesOfQuestions["single-correct-type"][1],
          ],
        });
        break;
      case "Descriptive":
        setTypesOfQuestions({
          ...typesOfQuestions,
          "descriptive-type": [
            index === 0 ? value : typesOfQuestions["descriptive-type"][0],
            index === 1 ? value : typesOfQuestions["descriptive-type"][1],
          ],
        });
        break;
      case "Numerical":
        setTypesOfQuestions({
          ...typesOfQuestions,
          "numerical-type": [
            index === 0 ? value : typesOfQuestions["numerical-type"][0],
            index === 1 ? value : typesOfQuestions["numerical-type"][1],
          ],
        });
        break;
      default:
        break;
    }
  };

  const generateAssignment = async (data: any) => {
    const request = await fetch(
      `http://127.0.0.1:5000/api/${btoa(hub_id as string)}/generate-assignment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const response = await request.json();
    console.log(response);
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
          />
          <Textarea
            placeholder="Instructions (optional)"
            minRows={4}
            autosize
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
          />
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
              />
              <Textarea
                placeholder="Any specific syllabus/topic you wanna mention (optional)"
                minRows={4}
                autosize
                value={specificTopics}
                onChange={(event) => setSpecificTopics(event.target.value)}
              />
              <Input
                placeholder="Any specific instruction for AI (optional)"
                value={instructionsForAI}
                onChange={(event) => setInstructionsForAI(event.target.value)}
              />
              <Group gap="0">
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderTopLeftRadius: "10%",
                    borderBottomLeftRadius: "10%",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => setSelectedQuestionType("SCQ")}
                >
                  SCQ
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderLeft: "0px",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => setSelectedQuestionType("MCQ")}
                >
                  MCQ
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderLeft: "0px",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => setSelectedQuestionType("Numerical")}
                >
                  Numerical
                </Button>
                <Button
                  variant="outline"
                  color="gray.7"
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRadius: "0px",
                    borderLeft: "0px",
                    borderTopRightRadius: "10%",
                    borderBottomRightRadius: "10%",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => setSelectedQuestionType("Descriptive")}
                >
                  Descriptive
                </Button>
              </Group>
              <Group>
                <TextInput
                  placeholder="x"
                  w="fit-content"
                  size="sm"
                  p="0"
                  onChange={(event) =>
                    updateTypesOfQuestions(0, parseInt(event.target.value))
                  }
                />
                <Text>{selectedQuestionType} questions of marks</Text>
                <TextInput
                  placeholder="y"
                  onChange={(event) =>
                    updateTypesOfQuestions(1, parseInt(event.target.value))
                  }
                />
                <Text>marks each</Text>
              </Group>
            </Stack>
            <Button
              ml="auto"
              size="sm"
              w="fit-content"
              bg="black"
              onClick={() => {
                const data = {
                  title: title,
                  topics: topics,
                  specific_topics: specificTopics,
                  instructions_for_ai: instructionsForAI,
                  types_of_questions: typesOfQuestions,
                };
                console.log(data);
                generateAssignment(data);

                // setIsPreviewAssignmentVisible(true);
              }}
            >
              Preview
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack>
          <Stack>
            <Input placeholder="Title" style={{ border: "none" }} />
            <Input placeholder="Description" style={{ border: "black" }} />
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
