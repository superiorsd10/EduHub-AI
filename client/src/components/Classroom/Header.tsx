import NextLink from "@/utils/NextLink";
import { Button, Divider, Group, Stack, Tabs } from "@mantine/core";
import React from "react";
import { SlSettings } from "react-icons/sl";

type Props = {};

const Header = (props: Props) => {
  return (
    <Tabs defaultValue="feed" variant="default" color="pink" w="100%"  pt='0.5%'>
      <Tabs.List>
        <Tabs.Tab value="feed">Feed</Tabs.Tab>
        <Tabs.Tab value="hubwork">HubWork</Tabs.Tab>
        <Tabs.Tab value="community">Community</Tabs.Tab>
        <Tabs.Tab value="progress" mr="auto">
          Progress
        </Tabs.Tab>
        <Tabs.Tab value="settings">
          <SlSettings fontSize="20px" />
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
};

export default Header;
