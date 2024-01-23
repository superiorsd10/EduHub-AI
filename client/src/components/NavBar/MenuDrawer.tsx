import { useDisclosure } from "@mantine/hooks";
import {
  Drawer,
  Button,
  Box,
  Avatar,
  Stack,
  Group,
  Text,
  Divider,
} from "@mantine/core";
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faBars,
  faBolt,
  faClose,
  faList,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "../Providers/AuthProvider";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";

const MenuDrawer = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [signOut] = useSignOut(auth);

  return (
    <Box
      ml="auto"
      display={{ base: "flex", sm: "flex", md: "none", lg: "none" }}
    >
      <Drawer opened={opened} onClose={close} title="EduHub-AI">
        <Stack>
          <Link href="#" style={{ textDecoration: "none", color: "black" }}>
            <Group>
              <FontAwesomeIcon icon={faBolt} size="xl" />
              <Text size="xl">Features</Text>
            </Group>
          </Link>
          <Link href="#" style={{ textDecoration: "none", color: "black" }}>
            <Group>
              <FontAwesomeIcon icon={faList} size="xl" />
              <Text size="xl">FAQs</Text>
            </Group>
          </Link>
          <Link href="#" style={{ textDecoration: "none", color: "black" }}>
            <Group>
              <FontAwesomeIcon icon={faAddressBook} size="xl" />
              <Text size="xl">Contact</Text>
            </Group>
          </Link>
          <Divider />
          {!authContext.email ? (
            <Stack>
              <Link
                href="signin"
                style={{ textDecoration: "none", color: "black" }}
              >
                <Group>
                  <Text size="xl">Sign In</Text>
                </Group>
              </Link>
              <Link
                href="#"
                style={{ textDecoration: "none", color: "black" }}
                
              >
                <Group>
                  <Text size="xl">Sign Up</Text>
                </Group>
              </Link>
            </Stack>
          ) : (
            <Group onClick={() => signOut()}>
              <FontAwesomeIcon icon={faRightToBracket} size="xl" color="red" />
              <Text size="xl" color="red">
                Sign Out
              </Text>
            </Group>
          )}
        </Stack>
      </Drawer>

      {/* <Button onClick={open}>Open Drawer</Button> */}
      <Avatar onClick={open}>
        <FontAwesomeIcon icon={faBars} />
      </Avatar>
    </Box>
  );
};

export default MenuDrawer;
