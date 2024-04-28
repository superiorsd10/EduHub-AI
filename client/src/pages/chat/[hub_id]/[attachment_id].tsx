import React from "react";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "@/pages/_app";
import EmptyLayout from "@/components/EmptyLayout";
import { Flex } from "@mantine/core";
import { Worker } from "@react-pdf-viewer/core";
import PDF from "@/components/Material/PDF";

const chat = () => {
  const router = useRouter();
  const { hub_id, attachment_id } = router.query;
  const base64hub_id = btoa(hub_id as string);

  let unique_filename = attachment_id + ".pdf";
  let file_key = `posts/${base64hub_id}/${unique_filename}`;
  let file_url = `https://d2zvmtskygrsot.cloudfront.net/${file_key}`;

  return (
    <Flex mah="100vh" h="100vh" w="100vw" maw="100%" p="0" gap="0">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <PDF hubId={hub_id as string} attachmentId={attachment_id as string}/>
      </Worker>
    </Flex>
  );
};

export default chat;
chat.getLayout = EmptyLayout;
