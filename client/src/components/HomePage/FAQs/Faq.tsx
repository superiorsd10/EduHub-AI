import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Collapse, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  question: string;
  answer: string;
};

const Faq: React.FC<Props> = ({ question, answer }) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Stack w="90vw">
      <Group mb={5}>
        <Title mr="auto">{question}</Title>
        <ActionIcon onClick={toggle} color="white" bg="white">
          <FontAwesomeIcon icon={faPlus} color="black" size="2x" />
        </ActionIcon>
      </Group>

      <Collapse in={opened}>
        <Text>{answer}</Text>
      </Collapse>
    </Stack>
  );
};

export default Faq;
