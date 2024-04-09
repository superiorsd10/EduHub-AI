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


const CreatePostModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const {isCreatePostVisible,setIsCreatePostVisible}=useContext(AuthContext);
  const [files, setFiles] = useState<File[]>([]); // State to store an array of files

  const handleFileChange = (newFile: File | null) => {
    if (newFile) {
      setFiles((prevFiles) => [...prevFiles, newFile]);
    }
  };

  useEffect(() => {
    console.log(files);
  }, [files]);

  return (
    <Modal
      opened={opened}
      onClose={() => setIsCreatePostVisible(false)}
      title="Create Post"
      centered
      radius="md"
    >
      <Tabs color="black" defaultValue="first">
        <Tabs.List>
          <Tabs.Tab value="first">Announcement</Tabs.Tab>
          <Tabs.Tab value="second">Material</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="first" pt="xs">
          <Input placeholder="Title" value="Title" radius="md" />
          <Input placeholder="Topic" value="Topic" mt="sm" radius="md" />
          <Textarea
            placeholder="Description"
            value="Description"
            mt="sm"
            mb="sm"
            radius="md"
            autosize
            minRows={4}
            maxRows={4}
          />
        </Tabs.Panel>

        <Tabs.Panel value="second" pt="xs">
          {/* Material content */}
          <Input placeholder="Title" value="Title" radius="md" />
          <Input placeholder="Topic" value="Topic" mt="sm" radius="md" />
          <Textarea
            placeholder="Description"
            value="Description"
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
