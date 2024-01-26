import React, { useContext, useEffect, useState } from "react";
import { useHover } from "@mantine/hooks";
import { AuthContext } from "../Providers/AuthProvider";
import { Stack, AppShell } from "@mantine/core";

import { MdOutlineHub } from "react-icons/md";
import { LuPencilLine } from "react-icons/lu";
import { TfiBlackboard } from "react-icons/tfi";
import { SlSettings } from "react-icons/sl";
import { IoCalendar } from "react-icons/io5";

import UserDrawerItem from "./UserDrawerItem";
import UserDrawerDropdown from "./UserDrawerDropdown";

type DropDownElement = {
  text: string;
  href: string;
};

const UserDrawer = () => {
  const { isDrawerOpen } = useContext(AuthContext);
  const { hovered, ref } = useHover();
  const [isDrawerTemporarilyOpen, setIsDrawerTemporarilyOpen] =
    useState<boolean>(false);
  useEffect(() => {
    if (!isDrawerOpen) setIsDrawerTemporarilyOpen(hovered);
  }, [hovered]);

  const dropdownElementsEnrolled: DropDownElement[] = [
    { text: "Cryptography", href: "#" },
    { text: "Discrete Mathematics", href: "#" },
  ];
  const dropdownElementsTeaching: DropDownElement[] = [
    { text: "What not to do in life?", href: "#" },
  ];

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
      <AppShell.Navbar ref={ref}>
        <Stack gap="lg" pl="2vw" pr="2vw" pt="2vw">
          <UserDrawerItem isDrawerTemporarilyOpen={isDrawerTemporarilyOpen} iconType={MdOutlineHub} name="Hubs" />
          <UserDrawerItem  isDrawerTemporarilyOpen={isDrawerTemporarilyOpen} iconType={LuPencilLine} name="Enrolled">
            <UserDrawerDropdown DropDownElements={dropdownElementsEnrolled} />
          </UserDrawerItem>
          <UserDrawerItem isDrawerTemporarilyOpen={isDrawerTemporarilyOpen} iconType={TfiBlackboard} name="Teaching">
            <UserDrawerDropdown DropDownElements={dropdownElementsTeaching} />
          </UserDrawerItem>
          <UserDrawerItem isDrawerTemporarilyOpen={isDrawerTemporarilyOpen} iconType={IoCalendar} name="Calender" />
          <UserDrawerItem isDrawerTemporarilyOpen={isDrawerTemporarilyOpen} iconType={SlSettings} name="Settings" />
        </Stack>
      </AppShell.Navbar>
    </AppShell>
  );
};

export default UserDrawer;
