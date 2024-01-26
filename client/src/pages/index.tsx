import React, { useContext, useEffect, useState } from "react";
import { NextPage } from "next";
import { Avatar, Box, Button, Flex, Image } from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import Features from "@/components/HomePage/Features/Features";
import {
  Variants,
  motion,
  useAnimationControls,
  useScroll,
} from "framer-motion";
import { AuthContext } from "@/components/Providers/AuthProvider";

const ScrollToTopContainerVariants: Variants = {
  hide: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0 },
};

const index: NextPage = () => {
  const {componentHeight} = useContext(AuthContext);
  const [isFooterInView, setIsFooterInView] = useState<boolean>(false);
  const { scrollYProgress } = useScroll();
  const controls = useAnimationControls();
  const { email, isDrawerOpen, setIsDrawerOpen } = useContext(AuthContext);

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    return scrollYProgress.on("change", (latestValue) => {
      if (latestValue > 0.05) {
        controls.start("show");
      } else {
        controls.start("hide");
      }
    });
  });
  return (
    <Flex direction="column" align="center" justify="center" mih={componentHeight}>
      {!email ? (
        <>
          <Banner />
          <Features />
          <Faqs />
          <Footer setIsFooterInView={setIsFooterInView} />
          <motion.div
            style={{ position: "fixed", right: "20px", bottom: "20px" }}
            variants={ScrollToTopContainerVariants}
            initial="hide"
            animate={controls}
            onClick={scrollToTop}
          >
            <Avatar
              radius="xl"
              size="lg"
              bg="white"
              p="xs"
              src="/assets/scroll-to-top.png"
              style={{ zIndex: "100" }}
            ></Avatar>
          </motion.div>
        </>
      ) : (
        <Flex w="100vw" maw="100%" h={componentHeight} justify="flex-end">
          <motion.div
            initial={{ width: "94vw" }}
            animate={{ width: isDrawerOpen ? "84vw" : "94vw" }}
            transition={{ duration: 0.3 }}
          >
            <Flex w="100%" h={componentHeight} justify="center" align="center">
              <Image h="50svh" src="/assets/LandingPageIllustration.png" />
            </Flex>
          </motion.div>
        </Flex>
      )}
    </Flex>
  );
};

export default index;
