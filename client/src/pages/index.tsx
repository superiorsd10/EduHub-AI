import React, { useContext, useEffect, useState } from "react";
import { NextPage } from "next";
import { Avatar, Button, Flex, Group, Image, Stack } from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import Features from "@/components/HomePage/Features/Features";
import { AppContext } from "@/providers/AppProvider";
import { IoMdArrowDropup } from "react-icons/io";
import NextLink from "@/utils/NextLink";
import ResizableFlex from "@/utils/ResizableFlex";
import Hub from "@/components/Hub";

const index: NextPage = () => {
  const { componentHeight, setIsCreateHubVisible, fetchHubs, hubList,email, token } =
    useContext(AppContext);
  const [isClassroomEmpty, setIsClassroomEmpty] = useState<boolean>(true);

  useEffect(() => {
    if (email!=null) {
      fetchHubs();
    }
  }, [email]);

  useEffect(()=>{
    setIsClassroomEmpty(
      hubList.student.length + hubList.teacher.length > 0 ? false : true
    );
  },[hubList])

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      mih={componentHeight}
    >
      {!email ? (
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
              // justify="center"
            >
              {hubList?.student.map((hub, id) => (
                <Hub
                  creator_name={hub.creator_name}
                  hub_id={hub.hub_id}
                  name={hub.name}
                  theme_color={hub.theme_color}
                  key={id}
                />
              ))}
              {hubList?.teacher.map((hub, id) => (
                <Hub
                  creator_name={hub.creator_name}
                  hub_id={hub.hub_id}
                  name={hub.name}
                  theme_color={hub.theme_color}
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
