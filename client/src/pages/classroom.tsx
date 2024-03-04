import Banner from "@/components/Classroom/Banner";
import Body from "@/components/Classroom/Body";
import Header from "@/components/Classroom/Header";
import ResizableFlex from "@/utils/ResizableFlex";
import { Stack } from "@mantine/core";
import React from "react";

type Props = {};

const classroom = (props: Props) => {
  return (
    <ResizableFlex>
      <Stack pl='2%' pr='2%' gap='xl'>
        <Header />
        <Banner />
        <Body />
      </Stack>
    </ResizableFlex>
  );
};

export default classroom;
