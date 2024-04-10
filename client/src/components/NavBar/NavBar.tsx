import React, { useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { AppContext } from "../../providers/AppProvider";

import { Avatar, Box, Button, Flex, Group, Image, Menu } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";

import MobileDrawer from "./MobileDrawer";
import UserDrawer from "./UserDrawer";
import NextLink from "@/utils/NextLink";

const NavBar: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, isDrawerOpen, setIsDrawerOpen, navbarHeight, isCreateHubVisible,setIsCreateHubVisible } =
    useContext(AppContext);
  const [signOut] = useSignOut(auth);

  return (
    <Flex
      h={navbarHeight}
      pl={isLoggedIn ? "2vw" : "5vw"}
      pr={isLoggedIn ? "2vw" : "5vw"}
      justify="center"
      align="center"
      maw="100%"
      w="100vw"
      bg='white'
      pos={isLoggedIn ? "fixed" : "static"}
      style={{
        borderBottom: isLoggedIn ? "1px solid #DEE2E6" : "",
        zIndex:10000000000000000000
      }}
      gap="md"

    >
      {isLoggedIn && (
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            width: "2vw",
            height: "2vw",
          }}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          <RxHamburgerMenu size={20} />
        </Box>
      )}
      {isLoggedIn && <UserDrawer />}

      <Flex h={isLoggedIn ? "8vh" : "12vh"}>
        <Image
          src={isLoggedIn ? "/assets/LandingPageLogo.png" : "/assets/logo.png"}
          style={{ cursor: "pointer", objectFit: "contain" }}
          onClick={() => router.push("/")}
        ></Image>
      </Flex>
      {!isLoggedIn && (
        <Group visibleFrom="md" gap="md">
          <NextLink href="/">Home</NextLink>
          <Link
            href="/#features"
            onClick={(e) => {
              e.preventDefault();
              const featuresElement = document.getElementById("features");
              if (featuresElement) {
                featuresElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{
              textDecoration: "none",
              color: "black",
              cursor: "pointer",
            }}
          >
            Features
          </Link>
          <Link
            href="/#faqs"
            onClick={(e) => {
              e.preventDefault();
              const faqsElement = document.getElementById("faqs");
              if (faqsElement) {
                faqsElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            FAQ
          </Link>
          <Link
            href="/#footer"
            onClick={(e) => {
              e.preventDefault();
              const footerElement = document.getElementById("footer");
              if (footerElement) {
                footerElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{ textDecoration: "none", color: "black" }}
          >
            Contact
          </Link>
        </Group>
      )}
      <Group ml="auto" visibleFrom="md" gap="md">
        {isLoggedIn ? (
          <Group gap="md">
            <Box w="2vw" style={{ cursor: "pointer" }} onClick={() => {setIsCreateHubVisible(true)}}>
              <FaPlus size={20} />
            </Box>
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <Avatar
                  size="md"
                  style={{ cursor: "pointer" }}
                  src={auth.currentUser?.photoURL}
                ></Avatar>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  color="red"
                  leftSection={<FontAwesomeIcon icon={faRightFromBracket} />}
                  onClick={() => signOut()}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ) : (
          <Group gap="md">
            <Link
              href="/signin"
              passHref
              style={{
                textDecoration: "none",
                fontWeight: "bolder",
                color: "#2E2E2E",
              }}
            >
              <Button
                variant="default"
                radius="md"
                // component="a"
                color="black"
                style={{
                  borderColor: "none",
                  borderWidth: "0",
                  bg: "white",
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" passHref>
              <Button
                variant="default"
                color="black"
                radius="md"
                style={{ borderColor: "black" }}
              >
                Join Today
              </Button>
            </Link>
          </Group>
        )}
      </Group>
      <MobileDrawer />
    </Flex>
  );
};

export default NavBar;
