import React, { useState, useRef } from "react";
import { Group, Stack, ActionIcon } from "@mantine/core";
import { motion } from "framer-motion";
import { MdKeyboardArrowRight } from "react-icons/md";
import ChatWithPDF from "./ChatWithPDF";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { RenderZoomProps } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

const PDF = () => {
  const toolbarPluginInstance = toolbarPlugin();
  const zoomPluginInstance = zoomPlugin();

  const { Toolbar } = toolbarPluginInstance;
  const { Zoom } = zoomPluginInstance;

  const [isFullPDF, setIsFullPDF] = useState<boolean>(true);

  return (
    <Group w="100%" h="100vh" gap="0" p="0" mah="100vh">
      <motion.div
        initial={{ width: "98%", height: "100%" }}
        animate={{ width: isFullPDF ? "98%" : "49%" }}
        transition={{ duration: 0.4 }}
      >
        <Stack mah="100vh" h="100vh" w="100%" maw="100%">
          <Toolbar />
          <Stack h="93vh">
            <Viewer
              plugins={[toolbarPluginInstance, zoomPluginInstance]}
              fileUrl="./dummy.pdf"
            />
          </Stack>
        </Stack>
      </motion.div>
      <Stack h="100%" p="0" gap="0" justify="center">
        <Zoom>
          {(props: RenderZoomProps) => (
            <ActionIcon
              bg="black"
              onClick={() => {
                setIsFullPDF(!isFullPDF);
                if (isFullPDF) props.onZoom(1);
              }}
            >
              <MdKeyboardArrowRight />
            </ActionIcon>
          )}
        </Zoom>
      </Stack>
      <motion.div
        initial={{ width: "0%", height: "100%", opacity: "0" }}
        animate={{
          width: isFullPDF ? "0%" : "49%",
          opacity: isFullPDF ? "0" : "1",
          display: isFullPDF ? "none" : "flex",
        }}
        transition={{ duration: 0.4 }}
      >
        <Stack
          h="100%"
          w="100%"
          p="0"
          gap="0"
          justify="center"
          style={{ flex: 1 }}
        ></Stack>
        <ChatWithPDF />
      </motion.div>
    </Group>
  );
};

export default PDF;