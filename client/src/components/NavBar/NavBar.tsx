import { Avatar, Button, Flex, Group, Image, Menu, Space } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { auth } from "@/firebase/clientApp";
import { AuthContext } from "../Providers/AuthProvider";
import { useContext } from "react";
import { useRouter } from "next/router";
import { useScrollIntoView } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useSignOut } from "react-firebase-hooks/auth";

const NavBar: React.FC = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [signOut] = useSignOut(auth);

  console.log(authContext);
  return (
    <Flex h="15vh" pl="5vw" pr="5vw" justify="center" maw="100%">
      <Flex>
        <Image
          src="/assets/logo.png"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        ></Image>
      </Flex>
      <Group>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Home
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Features
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          FAQ
        </Link>
        <Link style={{ textDecoration: "none", color: "black" }} href="#">
          Contact
        </Link>
      </Group>
      <Group ml="auto">
        {authContext.email ? (
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <Avatar size="md" style={{ cursor: "pointer" }}>
                {authContext.email[0].toUpperCase()}
              </Avatar>
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
                  bg:"white",
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
    </Flex>
  );
};

export default NavBar;
