// import ABC from "@/components/ABC";
import React from "react";
import { NextPageWithLayout } from "./_app";
import EmptyLayout from "@/components/EmptyLayout";
import { Flex } from "@mantine/core";
import PDF from "@/components/Material/PDF";
import { Worker } from "@react-pdf-viewer/core";

const chat: NextPageWithLayout = () => {
  return (
    <Flex mah='100vh' h="100vh" w="100vw" maw="100%" p="0" gap="0">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <PDF />
      </Worker>
    </Flex>
  );
};

export default chat;
chat.getLayout = EmptyLayout;
