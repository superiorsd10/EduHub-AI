import {
  Box,
  Center,
  Flex,
  Group,
  Input,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React from "react";
import { LuArrowBigRight } from "react-icons/lu";
import Markdown, { compiler } from 'markdown-to-jsx'
import { render } from 'react-dom'

const ChatWithPDF = () => {
  return (
    <Stack p="lg" w="100%">
      <Title size="h4">ChatWithPDF With PDF</Title>
      <Stack style={{ flex: 1 }}>
        <Box >
          <Markdown ># You got it babe!</Markdown>
        </Box>
      </Stack>
      <Input
        p="0"
        placeholder="Your email"
        rightSection={
          <Flex
            w="100%"
            h="100%"
            bg="pink.7"
            style={{ borderRadius: "8px", cursor: "pointer" }}
            justify="center"
            align="center"
          >
            <LuArrowBigRight size="24" color="white" />
          </Flex>
        }
      />
    </Stack>
  );
};

export default ChatWithPDF;
