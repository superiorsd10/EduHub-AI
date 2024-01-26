import React, { useContext } from "react";
import { NextPage } from "next";
import { Avatar, Button, Flex, Group, Image, Stack } from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import Features from "@/components/HomePage/Features/Features";
import { Variants, motion, useAnimationControls } from "framer-motion";
import { AuthContext } from "@/components/Providers/AuthProvider";
import Link from "next/link";
import { IoMdArrowDropup } from "react-icons/io";
import NextLink from "@/utils/NextLink";

const ScrollToTopContainerVariants: Variants = {
  hide: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0 },
};

const index: NextPage = () => {
  const { componentHeight } = useContext(AuthContext);
  const controls = useAnimationControls();
  const { isLoggedIn, isDrawerOpen } = useContext(AuthContext);

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
            radius="lg"
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
            animate={{ width: isDrawerOpen ? "84vw" : "94vw" }}
            transition={{ duration: 0.4 }}
          >
            <Stack w="100%" h={componentHeight} justify="center" align="center">
              <Image
                h="50svh"
                src="/assets/LandingPageIllustration.png"
                style={{ objectFit: "contain" }}
              />
              <Group>
                <NextLink href="#">
                  <Button
                    variant="default"
                    radius="md"
                    color="black"
                    style={{
                      borderColor: "none",
                      borderWidth: "0",
                      bg: "white",
                    }}
                  >
                    Add Hub
                  </Button>
                </NextLink>
                <NextLink href="#">
                  <Button color="black">Join Hub</Button>
                </NextLink>
              </Group>
            </Stack>
          </motion.div>
        </Flex>
      )}
    </Flex>
  );
};

export default index;
