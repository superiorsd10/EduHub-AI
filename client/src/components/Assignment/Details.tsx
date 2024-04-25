import { Button, Group, Select, Stack, Text } from "@mantine/core";
import React from "react";

type Props = {};

const Details = (props: Props) => {
  return (
    <Stack align="center" h="100%" w="40%" pt="lg" pl='lg' pr='lg'>
      <Button variant="outline" color="black">
        Attach Files
      </Button>
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
    </Stack>
  );
};

export default Details;
