import {
  Button,
  Group,
  List,
  Modal,
  Select,
  Stack,
  Tabs,
  Textarea,
} from "@mantine/core";
import React, { useContext, useState } from "react";
import { AssignmentContext } from "@/providers/AssignmentProvider";
import Markdown from "markdown-to-jsx";
import { AppContext } from "@/providers/AppProvider";



// let markdownText: markdownTextType = {
//   medium:
//     "*Object Oriented Programming\n=====================================\n\nConceptual Questions\n\n### Single-Correct-Type Questions (3 points each)\n\n1. What is the main purpose of abstraction in object-oriented programming?\n\t a) To hide implementation details\n\t* b) To expose implementation details\n\t* c) To reduce code duplication\n\t* d) To increase code complexity\n\n(3 points)\n\n2. Which of the following is an example of encapsulation?\n\t* a) A public method accessing a private variable\n\t* b) A private method accessing a public variable\n\t* c) A class having multiple inheritance\n\t* d) A class having a single constructor\n\n(3 points)\n\n3. What is the benefit of using abstraction in object-oriented programming?\n\t* a) It makes the code more complex\n\t* b) It makes the code more modular and reusable\n\t* c) It makes the code more difficult to maintain\n\t* d) It makes the code more prone to errors\n\n(3 points)\n\n### Multiple-Correct-Type Questions (4 points each)\n\n1. What are the advantages of encapsulation in object-oriented programming? (Select all that apply)\n\t* a) Hides implementation details\n\t* b) Exposes implementation details\n\t* c) Improves code modularity\n\t* d) Reduces code reusability\n\n(4 points)\n\n2. What are the principles of object-oriented programming that abstraction and encapsulation are related to? (Select all that apply)\n\t* a) Inheritance\n\t* b) Polymorphism\n\t* c) Abstraction\n\t* d) Encapsulation\n\n(4 points)\n\n",
// };

const PreviewAssignment = () => {
  const { isPreviewAssignmentVisible, setIsPreviewAssignmentVisible, id,markdown } =
    useContext(AssignmentContext);
  const { token } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState(null);
  const [makeChanges, setMakeChanges] = useState(false);
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState("medium")
  const [instructions, setInstructions] = useState("");

  const handleMakeChanges = async () => {
    try {
      const req = await fetch(
        `http://127.0.0.1:5000/api/make-changes-to-assignment/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            changes_prompt: instructions,
            assignment_difficulty: selectedDifficultyLevel,
          }),
        }
      );
      const res = await req.json();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      opened={isPreviewAssignmentVisible}
      onClose={() => {
        setIsPreviewAssignmentVisible(false);
      }}
      title="Create Assignment"
      withCloseButton={false}
      size="75%"
      centered
      zIndex={10001}
    >
      {!makeChanges ? (
        <Stack>
          {markdown}
          <Group>
            <Button
              color="black"
              onClick={() => setIsPreviewAssignmentVisible(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button bg="black" onClick={() => setMakeChanges(true)}>
              Make Changes
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Textarea
            placeholder="Changes needed"
            minRows={3}
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
          />
          <Group gap="0">
            <Button
              variant="outline"
              color={selectedDifficultyLevel === "easy" ? "white" : "gray.7"}
              bg={selectedDifficultyLevel === "easy" ? "gray.7" : "white"}
              style={{
                border: "2px solid #ADB5BD",
                borderRadius: 0,
                borderTopLeftRadius: "10%",
                borderBottomLeftRadius: "10%",
              }}
              pl="md"
              pr="md"
              onClick={() => setSelectedDifficultyLevel("easy")}
            >
              Easy
            </Button>
            <Button
              variant="outline"
              color={selectedDifficultyLevel === "medium" ? "white" : "gray.7"}
              bg={selectedDifficultyLevel === "medium" ? "gray.7" : "white"}
              style={{
                border: "2px solid #ADB5BD",
                borderLeft: "0px",
                borderRadius: 0,
              }}
              pl="md"
              pr="md"
              onClick={() => setSelectedDifficultyLevel("medium")}
            >
              Medium
            </Button>
            <Button
              variant="outline"
              color={selectedDifficultyLevel === "hard" ? "white" : "gray.7"}
              bg={selectedDifficultyLevel === "hard" ? "gray.7" : "white"}
              style={{
                border: "2px solid #ADB5BD",
                borderLeft: "0px",
                borderRadius: 0,
                borderTopRightRadius: "10%",
                borderBottomRightRadius: "10%",
              }}
              pl="md"
              pr="md"
              onClick={() => setSelectedDifficultyLevel("hard")}
            >
              Hard
            </Button>
          </Group>
          <Group>
            <Button
              color="black"
              onClick={() => setMakeChanges(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button bg="black" onClick={() => setMakeChanges(true)}>
              Make Changes
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default PreviewAssignment;
