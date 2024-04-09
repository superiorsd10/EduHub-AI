import React, { useContext, useEffect, useState } from "react";
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
import CreateHubModal from "@/components/Modals/CreateHubModal";
import Features from "@/components/HomePage/Features/Features";
import { Variants, motion, useAnimationControls } from "framer-motion";
import { AuthContext } from "@/providers/AuthProvider";
import Link from "next/link";
import { IoMdArrowDropup } from "react-icons/io";
import NextLink from "@/utils/NextLink";
import { useDisclosure } from "@mantine/hooks";
import ResizableFlex from "@/utils/ResizableFlex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import Hub from "@/components/Hub";

type Hub = {
  creator_name: string;
  hub_id: string;
  name: string;
  photo_url: string;
};

type Hubs = {
  student: Hub[];
  teacher: Hub[];
};

const index: NextPage = () => {
  const { componentHeight, isCreateHubVisible, setIsCreateHubVisible } =
    useContext(AuthContext);
  const { isLoggedIn, isDrawerOpen, token } = useContext(AuthContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [hubList, setHubList] = useState<Hubs>();
  const [isClassroomEmpty, setIsClassroomEmpty] = useState<boolean>(true);

  useEffect(() => {
    const getHubs = async () => {
      const response = await fetch("http://127.0.0.1:5000/api/get-hubs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      const data = await response.json();
      const hubs: Hubs = data.data[0];

      setHubList(hubs);
      setIsClassroomEmpty(
        hubs.student.length + hubs.teacher.length > 0 ? false : true
      );
    };
    if (isLoggedIn) getHubs();
  }, [isLoggedIn]);

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
          {isClassroomEmpty ? (
            <Stack w="100%" h={componentHeight} justify="center" align="center">
              <Image
                h="50svh"
                src="/assets/LandingPageIllustration.png"
                style={{ objectFit: "contain" }}
              />

              <Group>
                <NextLink href="#">
                  <Button
                    onClick={() => setIsCreateHubVisible(true)}
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
                  <Button color="black" radius="md">
                    Join Hub
                  </Button>
                </NextLink>
              </Group>
            </Stack>
          ) : (
            <Flex
              w="100%"
              h={componentHeight}
              p="lg"
              gap="lg"
              wrap="wrap"
              justify=""
            >
              {hubList?.student.map((hub, id) => (
                <Hub
                  creator_name={hub.creator_name}
                  hub_id={hub.hub_id}
                  name={hub.name}
                  photo_url={hub.photo_url}
                  key={id}
                />
              ))}
              {hubList?.teacher.map((hub, id) => (
                <Hub
                  creator_name={hub.creator_name}
                  hub_id={hub.hub_id}
                  name={hub.name}
                  photo_url={hub.photo_url}
                  key={hubList.student.length + id}
                />
              ))}
            </Flex>
          )}
        </ResizableFlex>
      )}
    </Flex>
  );
};

export default index;
