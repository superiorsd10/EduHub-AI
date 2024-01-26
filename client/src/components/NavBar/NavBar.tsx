import { Avatar, Box, Button, Flex, Group, Image, Menu, Space } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { auth } from "@/firebase/clientApp";
import { AuthContext } from "../Providers/AuthProvider";
import { useContext } from "react";
import { useRouter } from "next/router";
import { useScrollIntoView } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { useSignOut } from "react-firebase-hooks/auth";
import MenuDrawer from "./MenuDrawer";
import UserDrawer from "./UserDrawer";

const NavBar: React.FC = () => {
  const router = useRouter();
  const { email, isDrawerOpen, setIsDrawerOpen, navbarHeight} = useContext(AuthContext);
  const [signOut] = useSignOut(auth);

  return (
    <Flex
      h={navbarHeight}
      pl={email ? "2vw" : "5vw"}
      pr={email ? "2vw" : "5vw"}
      justify="center"
      align="center"
      maw="100%"
      w="100vw"
      pos={email ? 'fixed' : 'static'}
      style={{
        borderBottom: email?"1px solid #DEE2E6":'',
      }}
      gap='sm'
    >
      {email && (
        <Box w="2vw" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        <RxHamburgerMenu size={20}/>
        </Box>
      )}
      {email && <UserDrawer />}

      <Flex h={email?'8vh':'12vh'}>
        <Image
          src={email ? "/assets/LandingPageLogo.png" : "/assets/logo.png"}
          style={{ cursor: "pointer", objectFit: "contain" }}
          onClick={() => router.push("/")}
        ></Image>
      </Flex>
      {!email && (
        <Group visibleFrom="md">
          <Link style={{ textDecoration: "none", color: "black" }} href="/">
            Home
          </Link>
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
      <Group ml="auto" visibleFrom="md">
        {email ? (
          <Group>
             <Box w="2vw" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        <FaPlus size={20}/>
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
          <Group>
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
                component="a"
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
              <Button variant="default" color="black" radius="md">
                Join Today
              </Button>
            </Link>
          </Group>
        )}
      </Group>
      <MenuDrawer />
    </Flex>
  );
};

export default NavBar;
