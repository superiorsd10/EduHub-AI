import React, { useEffect, useState, useContext } from "react";
import NextLink from "@/utils/NextLink";
import {
  Button,
  Group,
  Input,
  Modal,
  Textarea,
  Tabs,
  ActionIcon,
} from "@mantine/core";
import { FileButton } from "@mantine/core";
import { FaFile, FaGoogleDrive } from "react-icons/fa";
import { AuthContext } from "@/providers/AuthProvider";

const CreatePostModal: React.FC<{
  opened: boolean;
  close: () => void;
  id: string;
}> = ({ opened, close, id }) => {
  const { isCreatePostVisible, setIsCreatePostVisible } =
    useContext(AuthContext);
  const encoded_base64 = btoa(id);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string | null>("first");

  const handleCreateHub = async () => {
    const { token, setIsCreateHubVisible } = useContext(AuthContext);
    try {
      await fetch(`http://127.0.0.1:5000/api/${id}/create-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          "type":activeTab=="first"?"announcement":"material",
          "title":title,
          "topic":topic,
          "description":description
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (newFile: File | null) => {
    if (newFile) {
      setFiles((prevFiles) => [...prevFiles, newFile]);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setIsCreatePostVisible(false)}
      title="Create Post"
      centered
      radius="md"
      zIndex={100001}
    >
      <Tabs
        color="black"
        defaultValue="first"
        value={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab value="first">Announcement</Tabs.Tab>
          <Tabs.Tab value="second">Material</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="first" pt="xs">
          <Input
            placeholder="Title"
            value={title}
            radius="md"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
          <Input
            placeholder="Topic"
            value={topic}
            mt="sm"
            radius="md"
            onChange={(event) => setTopic(event.currentTarget.value)}
          />
          <Textarea
            placeholder="Description"
            value={description}
            mt="sm"
            mb="sm"
            radius="md"
            autosize
            minRows={4}
            maxRows={4}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="second" pt="xs">
          {/* Material content */}
          <Input placeholder={title} value="Title" radius="md" />
          <Input placeholder={topic} value="Topic" mt="sm" radius="md" />
          <Textarea
            placeholder="Description"
            value={description}
            mt="sm"
            mb="sm"
            radius="md"
            autosize
            minRows={4}
            maxRows={4}
          />
          <Group justify="flex-end">
            {/* File buttons */}
            <FileButton onChange={(event) => handleFileChange(event)}>
              {(props) => (
                <ActionIcon
                  {...props}
                  color="gray.6"
                  size="xl"
                  style={{ borderRadius: "50%" }}
                >
                  <FaGoogleDrive size="22px" />
                </ActionIcon>
              )}
            </FileButton>
            <FileButton onChange={(event) => handleFileChange(event)}>
              {(props) => (
                <ActionIcon
                  {...props}
                  color="gray.6"
                  size="xl"
                  style={{ borderRadius: "50%" }}
                >
                  <FaFile size="22px" />
                </ActionIcon>
              )}
            </FileButton>
          </Group>
        </Tabs.Panel>
      </Tabs>
      <>
        <Group mt="md" justify="flex-end">
          {/* Buttons */}
          <Button
            onClick={close}
            variant="default"
            radius="md"
            color="black"
            style={{
              borderColor: "none",
              borderWidth: "0",
              bg: "white",
            }}
          >
            <NextLink href="#">Cancel</NextLink>
          </Button>
          <Button loading={false} color="black" radius="md">
            Post
          </Button>
        </Group>
      </>
    </Modal>
  );
};

export default CreatePostModal;
