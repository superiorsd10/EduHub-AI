import React, { useContext, useEffect } from "react";
import { Stack, AppShell, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MdOutlineHub } from "react-icons/md";
import { LuPencilLine } from "react-icons/lu";
import { TfiBlackboard } from "react-icons/tfi";
import { SlSettings } from "react-icons/sl";
import { IoCalendar } from "react-icons/io5";
import { AuthContext } from "../Providers/AuthProvider";
import UserDrawerItem from "./UserDrawerItem";
import UserDrawerDropdown from "./UserDrawerDropdown";

const UserDrawer = () => {
  const { isDrawerOpen } = useContext(AuthContext);
  const [opened, { toggle }] = useDisclosure(isDrawerOpen);
  type DropDownElement = {
    text:string;
    href:string;
}
  const dropdownElementsEnrolled: DropDownElement[] = [
    { text: "Cryptography", href: "#" },
    { text: "Discrete Mathematics", href: "#" },
  ];
  const dropdownElementsTeaching: DropDownElement[] = [
    { text: "What not to do in life?", href: "#" }
  ];

  useEffect(() => {
    toggle();
  }, [isDrawerOpen]);

  return (
    <AppShell
      header={{ height: "10vh" }}
      navbar={{
        width: "auto",
        breakpoint: "sm",
        collapsed: { mobile: false, desktop: false },
      }}
      zIndex={100}
    >
      <AppShell.Navbar>
        <Stack gap="lg" pl="2vw" pr="2vw" pt="2vw">
          <UserDrawerItem iconType={MdOutlineHub} name="Hubs" />
          <UserDrawerItem iconType={LuPencilLine} name="Enrolled">
            <UserDrawerDropdown DropDownElements={dropdownElementsEnrolled}/>
          </UserDrawerItem>
          <UserDrawerItem iconType={TfiBlackboard} name="Teaching" >
            <UserDrawerDropdown DropDownElements={dropdownElementsTeaching}/>
          </UserDrawerItem>
          <UserDrawerItem iconType={IoCalendar} name="Calender" />
          <UserDrawerItem iconType={SlSettings} name="Settings" />
        </Stack>
      </AppShell.Navbar>
    </AppShell>
  );
};

export default UserDrawer;
