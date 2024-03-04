import React, { useContext, useEffect } from "react";
import { NextPage } from "next";
import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
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
import { auth } from "@/firebase/clientApp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import ResizableFlex from "@/utils/ResizableFlex";

const ScrollToTopContainerVariants: Variants = {
  hide: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0 },
};

const index: NextPage = () => {
  const { componentHeight } = useContext(AuthContext);
  const controls = useAnimationControls();
  const { isLoggedIn, isDrawerOpen, token } = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(()=>{
    const getHubs= async ()=>{
      const response=await fetch('http://127.0.0.1:5000/api/get-hubs',{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, 
        },
      });
      
      const hubs = await response.json();
      console.log(hubs)
    }
    if(isLoggedIn) getHubs();
  },[isLoggedIn])

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
        <ResizableFlex>
            <Stack w="100%" h={componentHeight} justify="center" align="center">
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
            </Stack>
            {/* <Flex w="100%" h={componentHeight} p="lg" gap="lg">
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                h="fit-content"
                w="20%"
                withBorder
              >
                <Card.Section
                  h="15vh"
                  bg="orange"
                  style={{ position: "relative" }}
                  withBorder
                >
                  <Group p="md" style={{position:'relative'}}>
                    <Stack >
                      <Group justify="space-between">
                        <Text color="white" size="xl">
                          Cryptography
                        </Text>
                        <FontAwesomeIcon
                          icon={faEllipsisVertical}
                          size="xl"
                          style={{
                            color: "#ffffff",
                            position: "absolute",
                            right: "10%",
                          }}
                        />
                      </Group>
                      <Text color="white" size="sm">
                        Dr. Dhananjoy Dey
                      </Text>
                    </Stack>
                  </Group>
                  <Divider
                    my="xs"
                    label={
                      <Avatar
                        size="lg"
                        src={auth.currentUser?.photoURL}
                        style={{marginRight:'-30%'}}
                      ></Avatar>
                    }
                  />
                </Card.Section>
                <Stack h="25vh"></Stack>
              </Card>
            </Flex> */}
          </ResizableFlex>
      )}
    </Flex>
  );
};

export default index;
