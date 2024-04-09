import {
  Box,
  Center,
  Flex,
  Group,
  Input,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { FaLocationArrow } from "react-icons/fa";
import Markdown from "markdown-to-jsx";
import { AuthContext } from "../../providers/AuthProvider";
import { useContext } from "react";

type Chat = {
  type: "Send" | "Received";
  message: string;
};

const ChatWithPDF = () => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom on initial load and whenever chats change
  useEffect(() => {
    scrollToBottom();
  }, [chats]);
  const { token } = useContext(AuthContext);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      setChats(JSON.parse(savedChats));
      scrollToBottom();
    }
  }, []);

  const handleMessageSend = async () => {
    let msg = currentMessage;
    setChats((prevChats: any) => {
      const newChats = [
        ...prevChats,
        {
          type: "Send",
          message: currentMessage,
        },
      ];
      localStorage.setItem("chats", JSON.stringify(newChats));
      return newChats;
    });
    setCurrentMessage("");
    setIsLoading(true);
    const response = await fetch(
      "http://127.0.0.1:5000/api/chat-with-material/90b9d96d-7beb-4fe7-9830-66a693c22de8",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          query: msg,
        }),
      }
    );
    const body = await response.json();
    const respmsg = body.message;
    setChats((prevChats: any) => {
      const newChats = [
        ...prevChats,
        {
          type: "Received",
          message: respmsg,
        },
      ];
      localStorage.setItem("chats", JSON.stringify(newChats));
      return newChats;
    });
    setIsLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleMessageSend();
    }
  };

  return (
    <Stack p="lg" w="100%" mah="100%">
      <Title size="h4">Chat With PDF</Title>
      <Stack
        w="100%"
        mah="100%"
        style={{ overflowY: "auto" }}
        pr="md"
        ref={chatContainerRef}
      >
        {chats.map(({ type, message }: Chat) => {
          return (
            <Box
              maw="100%"
              pt="xs"
              pb="xs"
              pl="lg"
              pr="lg"
              style={{ borderRadius: "16px" }}
              bg={type === "Received" ? "gray.2" : "red.9"}
              miw="0"
              w="fit-content"
              ml={type === "Send" ? "auto" : ""}
              mr={type === "Received" ? "auto" : ""}
            >
              <Text
                maw="100%"
                c={type === "Received" ? "black" : "white"}
                p="0"
                w="fit-content"
                style={{ wordWrap: "break-word" }}
              >
                <Markdown>{message}</Markdown>
              </Text>
            </Box>
          );
        })}
        {isLoading && (
          <Box
            maw="100%"
            pt="xs"
            pb="xs"
            pl="lg"
            pr="lg"
            style={{ borderRadius: "16px" }}
            miw="0"
            w="fit-content"
            mr="auto"
            pos="relative"
          >
            <LoadingOverlay
              visible={true}
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 0 }}
              loaderProps={{ color: "red", type: "bars" }}
            />
          </Box>
        )}
      </Stack>
      <Group w="100%" gap={0} mt="auto">
        <Input
          p="0"
          placeholder="Ask any question"
          value={currentMessage}
          onChange={(event) => setCurrentMessage(event.currentTarget.value)}
          w="92%"
          onKeyDown={handleKeyPress}
        />
        <Flex
          h="100%"
          w="8%"
          bg="red.9"
          style={{ borderRadius: "3px", cursor: "pointer" }}
          justify="center"
          align="center"
          onClick={handleMessageSend}
        >
          <FaLocationArrow size="20" color="white" />
        </Flex>
      </Group>
    </Stack>
  );
};

export default ChatWithPDF;
