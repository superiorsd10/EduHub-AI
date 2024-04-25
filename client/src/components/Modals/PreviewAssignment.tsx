import { List, Modal, Stack } from "@mantine/core";
import React, { useContext } from "react";
import { AssignmentContext } from "@/providers/AssignmentProvider";
import MCQ from "../Assignment/MCQ";
import MultiSelectMCQ from "../Assignment/MultipleSelectMCQ";
import Descriptive from "../Assignment/Descriptive";

const PreviewAssignment = () => {
  const { isPreviewAssignmentVisible, setIsPreviewAssignmentVisible } =
    useContext(AssignmentContext);
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
      <Stack gap='md'>
        <MCQ
          questionNumber={1}
          title="What are you doing?"
          options={[
            "Nothing",
            "Go fuck yourself",
            "None of your business",
            "Wasting life",
          ]}
        />
        <MultiSelectMCQ
          questionNumber={2}
          title="Why did you choose engineering?"
          options={[
            "Aur koi option nhi tha",
            "Gaand mara bc",
            "No comments",
            "I'd like to quit this test",
          ]}
        />
        <Descriptive questionNumber={3} title="Zindagi mein kuch kara hai?"/>
      </Stack>
    </Modal>
  );
};

export default PreviewAssignment;
