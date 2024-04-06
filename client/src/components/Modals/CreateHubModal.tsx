import NextLink from "@/utils/NextLink";
import { Button, Group, Input, Modal, Textarea } from "@mantine/core";
import { AuthContext } from "../../providers/AuthProvider";
import { useContext, useState } from "react";

const CreateHubModal: React.FC<{ opened: boolean; close: () => void }> = ({
  opened,
  close,
}) => {
  const [hubName, setHubName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const { token,setIsCreateHubVisible } = useContext(AuthContext);

  const handleCreateHub = async () => {
    setLoading(true);
    try {
      const URL = 'https://api.100ms.live/v2/room-codes/room/6610f313e4bed7263690583b'
      const token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTIzODY2NTUsImV4cCI6MTcxMjk5MTQ1NSwianRpIjoiZTZmOTU5YTUtZjBiZS00MDU1LTgyZWMtNDNiYTczODJhZmFlIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MTIzODY2NTUsImFjY2Vzc19rZXkiOiI2NjBmY2I1NWJhYmMzM2YwMGU0YWI5NjcifQ.v5rvaQdUfGk0Gp-ENFdqdc1lJ_Gq9JAPPqefTT1J3EQ'
    const resp2=await fetch(URL,{
      method:'POST',
      headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    const redata=await resp2.json();
      const resp=await fetch('http://127.0.0.1:5000/api/create-hub',{
        method:'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, 
        },
        body: JSON.stringify({
          hub_name: hubName,
          section: section,
          description: description,
          email: "fuck@fuck.fuck",
          room_code_teacher: redata.data[0].code,
          room_code_ta: redata.data[2].code,
          room_code_student: redata.data[3].code,
        }),
      });
      const print=await resp.json();
      console.log(print);
      setIsCreateHubVisible(false);
    }
    catch (error){
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={()=>setIsCreateHubVisible(false)}
      title="Create Hub"
      centered
      radius="md"
    >
      <Input
        placeholder="Hub Name"
        value={hubName}
        onChange={(event) => setHubName(event.currentTarget.value)}
        radius="md"
      />
      <Input
        placeholder="Section"
        value={section}
        onChange={(event) => setSection(event.currentTarget.value)}
        mt="sm"
        radius="md"
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
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
        <Button loading={loading} color="black" radius="md" onClick={handleCreateHub}>
          Create
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateHubModal;
