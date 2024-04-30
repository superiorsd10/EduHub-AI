import { List, Modal, Stack, Tabs } from "@mantine/core";
import React, { useContext, useState } from "react";
import { AssignmentContext } from "@/providers/AssignmentProvider";
import Markdown from "markdown-to-jsx";

const markdownText = {
  medium:
    "*Object Oriented Programming\n=====================================\n\nConceptual Questions\n\n### Single-Correct-Type Questions (3 points each)\n\n1. What is the main purpose of abstraction in object-oriented programming?\n\t a) To hide implementation details\n\t* b) To expose implementation details\n\t* c) To reduce code duplication\n\t* d) To increase code complexity\n\n(3 points)\n\n2. Which of the following is an example of encapsulation?\n\t* a) A public method accessing a private variable\n\t* b) A private method accessing a public variable\n\t* c) A class having multiple inheritance\n\t* d) A class having a single constructor\n\n(3 points)\n\n3. What is the benefit of using abstraction in object-oriented programming?\n\t* a) It makes the code more complex\n\t* b) It makes the code more modular and reusable\n\t* c) It makes the code more difficult to maintain\n\t* d) It makes the code more prone to errors\n\n(3 points)\n\n### Multiple-Correct-Type Questions (4 points each)\n\n1. What are the advantages of encapsulation in object-oriented programming? (Select all that apply)\n\t* a) Hides implementation details\n\t* b) Exposes implementation details\n\t* c) Improves code modularity\n\t* d) Reduces code reusability\n\n(4 points)\n\n2. What are the principles of object-oriented programming that abstraction and encapsulation are related to? (Select all that apply)\n\t* a) Inheritance\n\t* b) Polymorphism\n\t* c) Abstraction\n\t* d) Encapsulation\n\n(4 points)\n\n",
};

const PreviewAssignment = () => {
  const { isPreviewAssignmentVisible, setIsPreviewAssignmentVisible } =
    useContext(AssignmentContext);
  const [activeTab, setActiveTab] = useState<string | null>("first");
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
      <Tabs
        color="black"
        defaultValue="first"
        value={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab value="easy">Easy</Tabs.Tab>
          <Tabs.Tab value="medium">Medium</Tabs.Tab>
          <Tabs.Tab value="hard">Hard</Tabs.Tab>
        </Tabs.List>
        {/* {markdownText.} */}
        {/* <Tabs.Panel value="easy">
          <Markdown>{markdownText.easy}</Markdown>
        </Tabs.Panel> */}
        <Tabs.Panel value="medium">
          <Markdown>{markdownText.medium}</Markdown>
        </Tabs.Panel>
        {/* <Tabs.Panel value="hard">
          <Markdown>{markdownText.hard}</Markdown>
        </Tabs.Panel> */}
      </Tabs>
    </Modal>
  );
};

export default PreviewAssignment;
