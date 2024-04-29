import { Group, Stack } from "@mantine/core";
import React, { useState } from "react";
import { Select } from "@mantine/core";
import EditableSCQ from "./EditableSCQ";
import EditableDescriptive from "./EditableDescriptive";
import EditableNumerical from "./EditableNumerical";
import EditableMCQ from "./EditableMCQ";

const Question = () => {
  const [value, setValue] = useState<string>("Single Correct");

  const renderEditableComponent = () => {
    switch (value) {
      case "Single Correct":
        return <EditableSCQ />;
      case "Multiple Choice":
        return <EditableMCQ />;
      case "Descriptive":
        return <EditableDescriptive />;
      case "Numerical":
        return <EditableNumerical />;
      default:
        return <EditableSCQ/>;
    }
  };

  return (
    <Group h="20vh" w="100%" gap={0} justify="space-between">
      <Stack w="60%" h="100%">
        {renderEditableComponent()}
      </Stack>
      <Stack w="35%" h="100%">
        <Select
          placeholder="Pick value"
          data={["Single Correct", "Multiple Choice", "Descriptive", "Numerical"]}
          searchable
          value={value}
          onChange={setValue}
        />
      </Stack>
    </Group>
  );
};

export default Question;
