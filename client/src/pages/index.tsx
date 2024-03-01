import React, { useContext } from "react";
import { NextPage } from "next";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import CreateHubModal from "@/components/HomePage/CreateHubModal";
import Features from "@/components/HomePage/Features/Features";
import { Variants, motion, useAnimationControls } from "framer-motion";
import { AuthContext } from "@/components/Providers/AuthProvider";
import Link from "next/link";
import { IoMdArrowDropup } from "react-icons/io";
import NextLink from "@/utils/NextLink";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { Input } from "@mantine/core";

const ScrollToTopContainerVariants: Variants = {
  hide: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0 },
};

const index: NextPage = () => {
  const { componentHeight } = useContext(AuthContext);
  const controls = useAnimationControls();
  const { isLoggedIn, isDrawerOpen } = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      mih={componentHeight}
    >
      {!isLoggedIn ? (
        <>
          <Banner />
          <Features />
          <Faqs />
          <Footer />
          <Avatar
            style={{
              position: "fixed",
              right: "20px",
              bottom: "20px",
              zIndex: 100,
            }}
            radius="xl"
            size="lg"
            p="0"
            bg="black"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <IoMdArrowDropup size="4x" color="white" />
          </Avatar>
        </>
      ) : (
        <Flex w="100vw" maw="100%" h={componentHeight} justify="flex-end">
          <motion.div
            initial={{ width: "94vw" }}
            animate={{ width: isDrawerOpen ? "83vw" : "94vw" }}
            transition={{ duration: 0.4 }}
          >
            {/* <Stack w="100%" h={componentHeight} justify="center" align="center">
              <Image
                h="50svh"
                src="/assets/LandingPageIllustration.png"
                style={{ objectFit: "contain" }}
              />
              <CreateHubModal opened={opened} close={close}/>
              <Group>
                <NextLink href="#">
                  <Button
                    onClick={open}
                    variant="default"
                    radius="md"
                    color="black"
                    style={{
                      borderColor: "none",
                      borderWidth: "0",
                      bg: "white",
                    }}
                  >
                    Create Hub
                  </Button>
                </NextLink>
                <NextLink href="#">
                  <Button color="black" radius='md'>Join Hub</Button>
                </NextLink>
              </Group>
            </Stack> */}
            <Flex w="100%" h={componentHeight} p="lg" gap="lg">
              <Card shadow="sm" padding="lg" radius="md" h='fit-content' w='20%' withBorder>
                <Card.Section h='15vh' bg='red' style={{position:'relative'}}>
                  <Group p='lg'>
                    <Stack>
                      <Text color="white" size='xl'>Cryptography</Text>
                      <Text color="white" size='sm'>Dr. Dhananjoy Dey</Text>
                    </Stack>
                  </Group>
                  <Avatar style={{position:'absolute', right:'10%'}}></Avatar>
                </Card.Section>
                <Stack h='25vh'>
                
                </Stack>
              </Card>
            </Flex>
          </motion.div>
        </Flex>
      )}
    </Flex>
  );
};

export default index;
