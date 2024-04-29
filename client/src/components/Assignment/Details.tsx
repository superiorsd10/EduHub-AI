import { Button, Checkbox, Group, Select, Stack, Text } from "@mantine/core";
import React from "react";

type Props = {};

const Details = (props: Props) => {
  return (
    <Stack align="center" h="100%" w="40%" pt="lg" pl='lg' pr='lg'>
      <Group w='100%' justify="space-between">
        <Text>Points</Text>
        <Select
          data={["Cryptography", "Discrete Mathematics"]}
          searchable
          placeholder="Ungraded"
          nothingFoundMessage="Nothing found..."
          checkIconPosition="left"
          maxDropdownHeight={200}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
        ></Select>
      </Group>
      <Group w='100%' justify="space-between">
        <Text>Due</Text>
        <Select
          data={["Cryptography", "Discrete Mathematics"]}
          searchable
          placeholder="No due date"
          nothingFoundMessage="Nothing found..."
          checkIconPosition="left"
          maxDropdownHeight={200}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
        ></Select>
      </Group>
      <Group w='100%' justify="space-between">
        <Text>Topic</Text>
        <Select
          data={["Cryptography", "Discrete Mathematics"]}
          searchable
          placeholder="No topic"
          nothingFoundMessage="Nothing found..."
          checkIconPosition="left"
          maxDropdownHeight={200}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
        ></Select>
      </Group>
      <Group w='100%' justify="space-between">
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
      <Group w='100%' justify="space-between">
        <Text>Enable Automatic Grading</Text>
        <Checkbox checked={true} color="black"></Checkbox>
      </Group>
      <Group w='100%' justify="space-between">
        <Text>Enable Automatic Feedback</Text>
        <Checkbox checked={true} color="black"></Checkbox>
      </Group>
      <Group w='100%' justify="space-between">
        <Text>Enable Plagraism Checker</Text>
        <Checkbox checked={true} color="black"></Checkbox>
      </Group>
    </Stack>
  );
};

export default Details;
