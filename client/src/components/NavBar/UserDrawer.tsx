import React, { useContext, useEffect, useState } from "react";
import { useHover } from "@mantine/hooks";
import { AuthContext } from "../Providers/AuthProvider";
import { Stack, AppShell } from "@mantine/core";

import { MdOutlineHub } from "react-icons/md";
import { LuPencilLine } from "react-icons/lu";
import { TfiBlackboard } from "react-icons/tfi";
import { SlSettings } from "react-icons/sl";
import { IoCalendar } from "react-icons/io5";
import { GiStarSwirl } from "react-icons/gi";

import UserDrawerItem from "./UserDrawerItem";
import UserDrawerDropdown from "./UserDrawerDropdown";
import UpgradePlan from "../UpgradePlan";

type DropDownElement = {
  text: string;
  href: string;
};

const UserDrawer = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    isDrawerTemporarilyOpen,
    setIsDrawerTemporarilyOpen,
  } = useContext(AuthContext);
  const { hovered, ref } = useHover();

  useEffect(() => {
    if (!isDrawerOpen) {
      setIsDrawerTemporarilyOpen(hovered);
    }
  }, [hovered]);

  const dropdownElementsEnrolled: DropDownElement[] = [
    { text: "Cryptography", href: "#" },
    { text: "Discrete Mathematics", href: "#" },
  ];
  const dropdownElementsTeaching: DropDownElement[] = [
    { text: "What not to do in life?", href: "#" },
  ];

  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] =
    useState<boolean>(false);

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
        <Stack gap="lg" p="2vw" h="100%">
          <UserDrawerItem iconType={MdOutlineHub} name="Hubs" />
          <UserDrawerItem iconType={LuPencilLine} name="Enrolled">
            <UserDrawerDropdown DropDownElements={dropdownElementsEnrolled} />
          </UserDrawerItem>
          <UserDrawerItem iconType={TfiBlackboard} name="Teaching">
            <UserDrawerDropdown DropDownElements={dropdownElementsTeaching} />
          </UserDrawerItem>
          <UserDrawerItem iconType={IoCalendar} name="Calender" />
          <UserDrawerItem iconType={SlSettings} name="Settings" />
          <Stack style={{ flex: 1 }}></Stack>
          <UserDrawerItem
            iconType={GiStarSwirl}
            name="Upgrade Plan"
            onClick={() => {
              if (!isUpgradePlanModalOpen) setIsUpgradePlanModalOpen(true);
            }}
          />
          <UpgradePlan
            isOpen={isUpgradePlanModalOpen}
            setIsOpen={setIsUpgradePlanModalOpen}
          />
        </Stack>
      </AppShell.Navbar>
    </AppShell>
  );
};

export default UserDrawer;
