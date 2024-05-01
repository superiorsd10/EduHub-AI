import { AssignmentContext } from "@/providers/AssignmentProvider";
import {
  Button,
  Checkbox,
  Group,
  Input,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import React, { useContext } from "react";

const Details = () => {
  const {
    points,
    topic,
    setTopic,
    isAutomaticFeedbackEnabled,
    isEnabledPlagriasmChecker,
    isAutomaticGradingEnabled,
    setIsAutomaticFeedbackEnabled,
    setIsEnabledPlagriasmChecker,
    setIsAutomaticGradingEnabled,
  } = useContext(AssignmentContext);
  return (
    <Stack align="center" h="100%" w="40%" pt="lg" pl="lg" pr="lg">
      <Group w="100%" justify="space-between">
        <Text>Points</Text>
        <Text>{points}</Text>
      </Group>
      <Group w="100%" justify="space-between">
        <Text>Due</Text>
        <DateTimePicker placeholder="Pick date and time" />
      </Group>
      <Group w="100%" justify="space-between">
        <Text>Topic</Text>
        <Input placeholder="Topic" value={topic} onChange={(e)=>setTopic(e.target.value)} ></Input>
      </Group>
      <Group w="100%" justify="space-between">
        <Text>Schedule</Text>
        <Select
          data={["Cryptography", "Discrete Mathematics"]}
          searchable
          placeholder="Immediate"
          nothingFoundMessage="Nothing found..."
          checkIconPosition="left"
          maxDropdownHeight={200}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
        ></Select>
      </Group>
      <Group w="100%" justify="space-between" mt="md">
        <Text>Enable Automatic Grading</Text>
        <Checkbox checked={isAutomaticGradingEnabled} onClick={()=>setIsAutomaticGradingEnabled(!isAutomaticGradingEnabled)} color="black"></Checkbox>
      </Group>
      <Group w="100%" justify="space-between" mt="md">
        <Text>Enable Automatic Feedback</Text>
        <Checkbox checked={isAutomaticFeedbackEnabled} onChange={()=>setIsAutomaticFeedbackEnabled(!isAutomaticFeedbackEnabled)} color="black"></Checkbox>
      </Group>
      <Group w="100%" justify="space-between" mt="md">
        <Text>Enable Plagraism Checker</Text>
        <Checkbox checked={isEnabledPlagriasmChecker} onChange={()=>setIsEnabledPlagriasmChecker(!isEnabledPlagriasmChecker)} color="black"></Checkbox>
      </Group>
    </Stack>
  );
};

export default Details;
