import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Collapse,
  Group,
  Stack,
  Text,
  Title,
  rem,
} from "@mantine/core";
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
      <Group mb={5} gap={0}>
        <Text
          mr="auto"
          display={{ base: "none", sm: "none", md: "flex", lg: "flex" }}
          size="xl"
          style={{ fontSize: rem(32), fontWeight: 900 }}
        >
          {question}
        </Text>
        <Text
          mr="auto"
          display={{ base: "flex", sm: "flex", md: "none", lg: "none" }}
          size="xl"
          style={{ fontSize: rem(24), fontWeight: 900 }}
          maw='75vw'
        >
          {question}
        </Text>
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
        <Text color="gray.8">{answer}</Text>
      </Collapse>
    </Stack>
  );
};

export default Faq;
