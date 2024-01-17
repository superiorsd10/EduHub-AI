import React from "react";
import { NextPage } from "next";
import { Flex } from "@mantine/core";
import Banner from "@/components/HomePage/Banner";
import Faqs from "@/components/HomePage/FAQs/Faqs";
import Footer from "@/components/HomePage/Footer";
import Features from "@/components/HomePage/Features/Features";

const index:NextPage = () => {
  return (
    <Flex direction="column" align="center">
      <Banner />
      <Features />
      <Faqs />
      <Footer />
    </Flex>
  );
};

export default index;
