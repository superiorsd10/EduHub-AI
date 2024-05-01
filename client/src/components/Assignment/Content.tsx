import React, { useContext, useEffect, useState } from "react";
import {
  Input,
  Stack,
  Textarea,
  Radio,
  Group,
  Button,
  Text,
} from "@mantine/core";
import { AssignmentContext } from "@/providers/AssignmentProvider";
import Question from "./Question";
import { useRouter } from "next/router";
import { AppContext } from "@/providers/AppProvider";

const Content = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id;
  const { token } = useContext(AppContext);
  const {
    setIsPreviewAssignmentVisible,
    setId,
    setPoints,
    title,
    instructions,
    setTitle,
    setInstructions,
    typesOfQuestions,
    setTypesOfQuestions,
  } = useContext(AssignmentContext);

  const [assignmentType, setAssignmentType] = useState<"AI" | "Manual">("AI");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [topics, setTopics] = useState<string>("");
  const [specificTopics, setSpecificTopics] = useState<string>("");
  const [instructionsForAI, setInstructionsForAI] = useState<string>("");

  const [hasBeenSelected, setHasBeenSelected] = useState<{
    SCQ: boolean;
    MCQ: boolean;
    Descriptive: boolean;
    Numerical: boolean;
  }>({
    SCQ: false,
    MCQ: false,
    Descriptive: false,
    Numerical: false,
  });

  const toggleQuestionType = (type: keyof typeof hasBeenSelected) => {
    setHasBeenSelected((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const modifyTypesOfQuestions = (
    type: keyof typeof typesOfQuestions,
    index: number,
    value: number
  ) => {
    setTypesOfQuestions((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
  };

  useEffect(() => {
    setPoints(
      Object.values(typesOfQuestions).reduce(
        (acc, curr) => acc + (curr[0] || 0) * (curr[1] || 0),
        0
      )
    );
  }, [typesOfQuestions, setPoints]);

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const generateAssignment = async (data: any) => {
    try {
      const request = await fetch(
        `http://127.0.0.1:5000/api/${btoa(
          hub_id as string
        )}/generate-assignment`,
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
      const id = response.message.split("Generate Assignment ID: ")[1];
      setId(id);
      const req = await fetch(`/api/subscribe?id=${id}`);
      const resp = await req.json();
      setIsPreviewAssignmentVisible(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePreviewAssignment = async () => {
    setIsLoading(true);
    const data = {
      title: title,
      topics: topics,
      specific_topics: specificTopics,
      instructions_for_ai: instructionsForAI,
      types_of_questions: typesOfQuestions,
    };
    generateAssignment(data);
    setTimeout(() => {
      setIsPreviewAssignmentVisible(true);
    }, 3000);
    setIsLoading(false);
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
            minRows={1}
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
                minRows={1}
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
                  color={hasBeenSelected["SCQ"] ? "white" : "gray.7"}
                  bg={hasBeenSelected["SCQ"] ? "gray.7" : "white"}
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRadius: 0,
                    borderTopLeftRadius: "10%",
                    borderBottomLeftRadius: "10%",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => {
                    toggleQuestionType("SCQ");
                    modifyTypesOfQuestions("single-correct-type", 0, 0);
                    modifyTypesOfQuestions("single-correct-type", 1, 0);
                  }}
                >
                  SCQ
                </Button>
                <Button
                  variant="outline"
                  color={hasBeenSelected["MCQ"] ? "white" : "gray.7"}
                  bg={hasBeenSelected["MCQ"] ? "gray.7" : "white"}
                  style={{
                    border: "2px solid #ADB5BD",
                    borderLeft: "0px",
                    borderRadius: 0,
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => {
                    toggleQuestionType("MCQ");
                    modifyTypesOfQuestions("multiple-correct-type", 0, 0);
                    modifyTypesOfQuestions("multiple-correct-type", 1, 0);
                  }}
                >
                  MCQ
                </Button>
                <Button
                  variant="outline"
                  color={hasBeenSelected["Numerical"] ? "white" : "gray.7"}
                  bg={hasBeenSelected["Numerical"] ? "gray.7" : "white"}
                  style={{
                    border: "2px solid #ADB5BD",
                    borderLeft: "0px",
                    borderRadius: 0,
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => {
                    toggleQuestionType("Numerical");
                    modifyTypesOfQuestions("numerical-type", 0, 0);
                    modifyTypesOfQuestions("numerical-type", 1, 0);
                  }}
                >
                  Numerical
                </Button>
                <Button
                  variant="outline"
                  color={hasBeenSelected["Descriptive"] ? "white" : "gray.7"}
                  bg={hasBeenSelected["Descriptive"] ? "gray.7" : "white"}
                  style={{
                    border: "2px solid #ADB5BD",
                    borderRadius: "0px",
                    borderLeft: "0px",
                    borderTopRightRadius: "10%",
                    borderBottomRightRadius: "10%",
                  }}
                  pl="md"
                  pr="md"
                  onClick={() => {
                    toggleQuestionType("Descriptive");
                    modifyTypesOfQuestions("descriptive-type", 0, 0);
                    modifyTypesOfQuestions("descriptive-type", 1, 0);
                  }}
                >
                  Descriptive
                </Button>
              </Group>
              {hasBeenSelected["SCQ"] && (
                <Group>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["single-correct-type"][0]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "single-correct-type",
                        0,
                        parseInt(event.target.value)
                      )
                    }
                    style={{
                      border: "0px solid black",
                    }}
                  />
                  <Text size="sm"> SCQs of</Text>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["single-correct-type"][1]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "single-correct-type",
                        1,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm">marks each</Text>
                </Group>
              )}
              {hasBeenSelected["MCQ"] && (
                <Group>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["multiple-correct-type"][0]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "multiple-correct-type",
                        0,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm"> MCQs questions of</Text>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["multiple-correct-type"][1]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "multiple-correct-type",
                        1,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm">marks each</Text>
                </Group>
              )}
              {hasBeenSelected["Descriptive"] && (
                <Group>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["descriptive-type"][0]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "descriptive-type",
                        0,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm"> Descriptive questions of</Text>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["descriptive-type"][1]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "descriptive-type",
                        1,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm">marks each</Text>
                </Group>
              )}
              {hasBeenSelected["Numerical"] && (
                <Group>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["numerical-type"][0]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "numerical-type",
                        0,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm"> Numerical questions of</Text>
                  <Input
                    type="number"
                    placeholder="x"
                    w="fit-content"
                    size="xs"
                    p="0"
                    value={typesOfQuestions["numerical-type"][1]}
                    onChange={(event) =>
                      modifyTypesOfQuestions(
                        "numerical-type",
                        1,
                        parseInt(event.target.value)
                      )
                    }
                  />
                  <Text size="sm">marks each</Text>
                </Group>
              )}
            </Stack>
            <Button
              ml="auto"
              size="sm"
              w="fit-content"
              bg="black"
              loading={isLoading}
              onClick={() => {handlePreviewAssignment()}}
            >
              Preview
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack>
          <Stack>
            <Input
              placeholder="Title"
              style={{ border: "none" }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Description"
              style={{ border: "black" }}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Group gap="0">
              <Button
                variant="outline"
                color={hasBeenSelected["SCQ"] ? "white" : "gray.7"}
                bg={hasBeenSelected["SCQ"] ? "gray.7" : "white"}
                style={{
                  border: "2px solid #ADB5BD",
                  borderRadius: 0,
                  borderTopLeftRadius: "10%",
                  borderBottomLeftRadius: "10%",
                }}
                pl="md"
                pr="md"
                onClick={() => {
                  toggleQuestionType("SCQ");
                  modifyTypesOfQuestions("single-correct-type", 0, 0);
                  modifyTypesOfQuestions("single-correct-type", 1, 0);
                }}
              >
                SCQ
              </Button>
              <Button
                variant="outline"
                color={hasBeenSelected["MCQ"] ? "white" : "gray.7"}
                bg={hasBeenSelected["MCQ"] ? "gray.7" : "white"}
                style={{
                  border: "2px solid #ADB5BD",
                  borderLeft: "0px",
                  borderRadius: 0,
                }}
                pl="md"
                pr="md"
                onClick={() => {
                  toggleQuestionType("MCQ");
                  modifyTypesOfQuestions("multiple-correct-type", 0, 0);
                  modifyTypesOfQuestions("multiple-correct-type", 1, 0);
                }}
              >
                MCQ
              </Button>
              <Button
                variant="outline"
                color={hasBeenSelected["Numerical"] ? "white" : "gray.7"}
                bg={hasBeenSelected["Numerical"] ? "gray.7" : "white"}
                style={{
                  border: "2px solid #ADB5BD",
                  borderLeft: "0px",
                  borderRadius: 0,
                }}
                pl="md"
                pr="md"
                onClick={() => {
                  toggleQuestionType("Numerical");
                  modifyTypesOfQuestions("numerical-type", 0, 0);
                  modifyTypesOfQuestions("numerical-type", 1, 0);
                }}
              >
                Numerical
              </Button>
              <Button
                variant="outline"
                color={hasBeenSelected["Descriptive"] ? "white" : "gray.7"}
                bg={hasBeenSelected["Descriptive"] ? "gray.7" : "white"}
                style={{
                  border: "2px solid #ADB5BD",
                  borderRadius: "0px",
                  borderLeft: "0px",
                  borderTopRightRadius: "10%",
                  borderBottomRightRadius: "10%",
                }}
                pl="md"
                pr="md"
                onClick={() => {
                  toggleQuestionType("Descriptive");
                  modifyTypesOfQuestions("descriptive-type", 0, 0);
                  modifyTypesOfQuestions("descriptive-type", 1, 0);
                }}
              >
                Descriptive
              </Button>
            </Group>
            {hasBeenSelected["SCQ"] && (
              <Group>
                <Text size="sm"> SCQs of</Text>
                <Input
                  type="number"
                  placeholder="x"
                  w="fit-content"
                  size="xs"
                  p="0"
                  value={typesOfQuestions["single-correct-type"][1]}
                  onChange={(event) =>
                    modifyTypesOfQuestions(
                      "single-correct-type",
                      1,
                      parseInt(event.target.value)
                    )
                  }
                />
                <Text size="sm">marks each</Text>
              </Group>
            )}
            {hasBeenSelected["MCQ"] && (
              <Group>
                <Text size="sm"> MCQs questions of</Text>
                <Input
                  type="number"
                  placeholder="x"
                  w="fit-content"
                  size="xs"
                  p="0"
                  value={typesOfQuestions["multiple-correct-type"][1]}
                  onChange={(event) =>
                    modifyTypesOfQuestions(
                      "multiple-correct-type",
                      1,
                      parseInt(event.target.value)
                    )
                  }
                />
                <Text size="sm">marks each</Text>
              </Group>
            )}
            {hasBeenSelected["Descriptive"] && (
              <Group>
                <Text size="sm"> Descriptive questions of</Text>
                <Input
                  type="number"
                  placeholder="x"
                  w="fit-content"
                  size="xs"
                  p="0"
                  value={typesOfQuestions["descriptive-type"][1]}
                  onChange={(event) =>
                    modifyTypesOfQuestions(
                      "descriptive-type",
                      1,
                      parseInt(event.target.value)
                    )
                  }
                />
                <Text size="sm">marks each</Text>
              </Group>
            )}
            {hasBeenSelected["Numerical"] && (
              <Group>
                <Text size="sm"> Numerical questions of</Text>
                <Input
                  type="number"
                  placeholder="x"
                  w="fit-content"
                  size="xs"
                  p="0"
                  value={typesOfQuestions["numerical-type"][1]}
                  onChange={(event) =>
                    modifyTypesOfQuestions(
                      "numerical-type",
                      1,
                      parseInt(event.target.value)
                    )
                  }
                />
                <Text size="sm">marks each</Text>
              </Group>
            )}

            {questions.map((_, index) => (
              <Question key={index} />
            ))}
          </Stack>
        </Stack>
      )}

      <Group h="5vh" justify="space-between">
        <Radio
          checked={false}
          color="black"
          label={`Generate Assignment ${
            assignmentType === "AI" ? "Manually" : "by AI"
          }`}
          onClick={() => {
            if (assignmentType === "AI") {
              setAssignmentType("Manual");
              setTitle(undefined);
              setInstructions(undefined);
              setTypesOfQuestions({
                "descriptive-type": [0, 0],
                "multiple-correct-type": [0, 0],
                "numerical-type": [0, 0],
                "single-correct-type": [0, 0],
              });
              setHasBeenSelected({
                Descriptive: false,
                MCQ: false,
                Numerical: false,
                SCQ: false,
              });
            } else {
              setAssignmentType("AI");
              setTitle(undefined);
              setInstructions(undefined);
              setTypesOfQuestions({
                "descriptive-type": [0, 0],
                "multiple-correct-type": [0, 0],
                "numerical-type": [0, 0],
                "single-correct-type": [0, 0],
              });
              setHasBeenSelected({
                Descriptive: false,
                MCQ: false,
                Numerical: false,
                SCQ: false,
              });
            }
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
