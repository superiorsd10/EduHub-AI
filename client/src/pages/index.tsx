import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { Avatar, Box, Button, Flex, Image } from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import Features from "@/components/HomePage/Features/Features";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Variants, motion, useAnimationControls, useScroll } from "framer-motion";


const ScrollToTopContainerVariants: Variants = {
  hide: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0 },
};

const index: NextPage = () => {
  const [isFooterInView, setIsFooterInView] = useState<boolean>(false);
  const { scrollYProgress } = useScroll();
  const controls = useAnimationControls();

  const isBrowser = () => typeof window !== 'undefined'; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    return scrollYProgress.on('change', (latestValue) => {
      if (latestValue > 0.05) {
        controls.start('show');
      } else {
        controls.start('hide');
      }
    });
  });
  return (
    <Flex direction="column" align="center">
      <Banner />
      <Features />
      <Faqs />
      <Footer setIsFooterInView={setIsFooterInView} />
      <motion.div
        style={{ position: 'fixed', right: '20px', bottom: '20px' }}
        variants={ScrollToTopContainerVariants}
        initial="hide"
        animate={controls}
        onClick={scrollToTop}>
        <Avatar radius='xl' size='lg' bg='white' p='xs' src='/assets/scroll-to-top.png' style={{ zIndex: '100' }}>
        </Avatar>
      </motion.div>
    </Flex>
  );
};

export default index;
