import React from "react";
import EmptyLayout from "@/components/EmptyLayout";
import { Flex } from "@mantine/core";
import PDF from "@/components/Material/PDF";
import { Worker } from "@react-pdf-viewer/core";
import { NextPageWithLayout } from "@/pages/_app";
import { useRouter } from "next/router";

const pdf: NextPageWithLayout = () => {
  const router = useRouter();
  const post_id = router.query.post_id as string;
  const attachment_id = router.query.attachment_id as string;
  const pdf_url=`https://eduhub-ai.s3.amazonaws.com/posts/${post_id}/${attachment_id}.pdf`;
  return (
    <Flex h="100vh" w="100vw" maw="100%" p="0" gap="0">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <PDF/>
      </Worker>
    </Flex>
  );
};

export default pdf;
pdf.getLayout = EmptyLayout;
