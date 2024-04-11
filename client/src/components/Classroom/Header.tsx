import React, {useContext} from "react";
import { Tabs } from "@mantine/core";
import { SlSettings } from "react-icons/sl";
import { MdEmojiPeople } from "react-icons/md";
import { HubContext } from "@/providers/HubProvider";

const Header = () => {
  const { setIsAcceptRequestsVisible } = useContext(HubContext);
  return (
    <Tabs defaultValue="feed" variant="default" color="pink" w="100%"  pt='0.5%'>
      <Tabs.List>
        <Tabs.Tab value="feed">Feed</Tabs.Tab>
        <Tabs.Tab value="hubwork">HubWork</Tabs.Tab>
        <Tabs.Tab value="community">Community</Tabs.Tab>
        <Tabs.Tab value="progress" mr="auto">
          Progress
        </Tabs.Tab>
        <Tabs.Tab value="requests" onClick={()=>setIsAcceptRequestsVisible(true)}>
          <MdEmojiPeople fontSize="20px" />
        </Tabs.Tab>
        <Tabs.Tab value="settings">
          <SlSettings fontSize="20px" />
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default Header;
