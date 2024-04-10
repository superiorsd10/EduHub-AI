import { AppContext } from "@/providers/AppProvider";
import { Flex } from "@mantine/core";
import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";

const ResizableFlex = ({children}:{children?: ReactNode}) => {
  const { componentHeight } = useContext(AppContext);
  const { isDrawerOpen, isDrawerTemporarilyOpen } = useContext(AppContext);
  return (
    <Flex w="100vw" maw="100%" h={componentHeight} justify="flex-end">
      <motion.div
        initial={{ width: "93vw" }}
        animate={{ width: (isDrawerOpen || isDrawerTemporarilyOpen) ? "82vw" : "93vw" }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </Flex>
  );
};

export default ResizableFlex;
