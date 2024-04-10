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
import { HubContext } from "@/providers/HubProvider";

const CreatePostModal: React.FC<{
  opened: boolean;
  close: () => void;
  id: string;
}> = ({ opened, close, id }) => {
  const { token } = useContext(AuthContext);
  const { setIsCreatePostVisible,currentHubData,appendPost } = useContext(HubContext);
  const [activeTab, setActiveTab] = useState<string | null>("first");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const encoded_base64 = btoa(id);
  const [title, setTitle] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);


  useEffect(()=>{
    console.log(files);
  },[files])
  const handleCreateHub = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append(
      "type",
      activeTab === "first" ? "announcement" : "material"
    );
    formData.append("title", title);
    formData.append("topic", topic);
    formData.append("description", description);
    files.forEach((file) => {
      formData.append("files", file);
    });

    
    try {
      const resp=await fetch(`http://127.0.0.1:5000/api/${encoded_base64}/create-post`, {
        method: "POST",
        headers: {
          Authorization: `${token}`,
        },
        body: formData,
      });
      const data=await resp.json();
      appendPost(data);
      setIsCreatePostVisible(false);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
    
    setIsLoading(false);
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
          <Input
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            radius="md"
          />
          <Input
            placeholder="Topic"
            value={topic}
            onChange={(event) => setTopic(event.currentTarget.value)}
            mt="sm"
            radius="md"
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
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
                  <FaFile size="22px" />
                </ActionIcon>
              )}
            </FileButton>
          </Group>
        </Tabs.Panel>
      </Tabs>
      <>
        <Group mt="md" justify="flex-end">
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
          <Button
            loading={isLoading}
            color="black"
            radius="md"
            onClick={handleCreateHub}
          >
            Post
          </Button>
        </Group>
      </>
    </Modal>
  );
};

export default CreatePostModal;
