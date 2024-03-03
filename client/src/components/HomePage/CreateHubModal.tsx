import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Create Hub"
      centered
      radius="md"
    >
      <Input placeholder="Hub Name" radius="md" />
      <Input placeholder="Section" mt="sm" radius="md" />
      <Textarea
        placeholder="Description"
        mt="sm"
        mb="sm"
        radius="md"
        autosize
        minRows={4}
        maxRows={4}
      />
      <Group mt="sm" justify="flex-end">
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
        <Button color="black" radius="md">
          <NextLink href="#" color="white">
            {" "}
            Create
          </NextLink>
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateHubModal;
