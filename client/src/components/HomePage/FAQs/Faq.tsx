import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Collapse, Group, Stack, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React, { useEffect } from "react";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

type Props = {
  question: string;
  answer: string;
  index: number;
  openedIndex: number;
  setOpenedIndex: (index: number) => void;
};

const Faq: React.FC<Props> = ({
  question,
  answer,
  index,
  openedIndex,
  setOpenedIndex,
}) => {
  useEffect(() => {
    if (openedIndex != index) {
      if (opened) toggle();
    } else if (!opened) toggle();
  }, [openedIndex]);
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Stack w="90vw">
      <Group mb={5}>
        <Title mr="auto" size="h3">
          {question}
        </Title>
        <ActionIcon
          onClick={() => {
            setOpenedIndex(index);
            toggle();
          }}
          color="white"
          bg="white"
        >
          <FontAwesomeIcon
            icon={opened ? faMinus : faPlus}
            color="black"
            size="2x"
          />
        </ActionIcon>
      </Group>

      <Collapse in={opened}>
        <Text color="gray.7">{answer}</Text>
      </Collapse>
    </Stack>
  );
};

export default Faq;
