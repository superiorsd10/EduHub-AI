import React, { useContext } from "react";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";

import { useDisclosure } from "@mantine/hooks";
import {
  Drawer,
  Box,
  Avatar,
  Stack,
  Group,
  Text,
  Divider,
} from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faBars,
  faBolt,
  faList,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

import { AuthContext } from "../Providers/AuthProvider";
import NextLink from "@/utils/NextLink";

const MobileDrawer = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const { isLoggedIn } = useContext(AuthContext);
  const [signOut] = useSignOut(auth);

  return (
    <Box
      ml="auto"
      display={{ base: "flex", sm: "flex", md: "none", lg: "none" }}
    >
      <Drawer opened={opened} onClose={close} title="EduHub-AI">
        <Stack>
          <NextLink href="#">
            <Group>
              <FontAwesomeIcon icon={faBolt} size="xl" />
              <Text size="xl">Features</Text>
            </Group>
          </NextLink>
          <NextLink href="#">
            <Group>
              <FontAwesomeIcon icon={faList} size="xl" />
              <Text size="xl">FAQs</Text>
            </Group>
          </NextLink>
          <NextLink href="#">
            <Group>
              <FontAwesomeIcon icon={faAddressBook} size="xl" />
              <Text size="xl">Contact</Text>
            </Group>
          </NextLink>
          <Divider />
          {!isLoggedIn ? (
            <Stack>
              <NextLink href="signin">
                <Group>
                  <Text size="xl">Sign In</Text>
                </Group>
              </NextLink>
              <NextLink href="#">
                <Group>
                  <Text size="xl">Sign Up</Text>
                </Group>
              </NextLink>
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
      <Avatar onClick={open}>
        <FontAwesomeIcon icon={faBars} />
      </Avatar>
    </Box>
  );
};

export default MobileDrawer;
