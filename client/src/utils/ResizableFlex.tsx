import { AuthContext } from "@/components/Providers/AuthProvider";
import { Flex } from "@mantine/core";
import { motion } from "framer-motion";
import { ReactNode, useContext } from "react";

const ResizableFlex = ({children}:{children?: ReactNode}) => {
  const { componentHeight } = useContext(AuthContext);
  const { isLoggedIn, isDrawerOpen, isDrawerTemporarilyOpen } = useContext(AuthContext);
  return (
    <Flex w="100vw" maw="100%" h={componentHeight} justify="flex-end">
      <motion.div
        initial={{ width: "94vw" }}
        animate={{ width: (isDrawerOpen || isDrawerTemporarilyOpen) ? "83vw" : "94vw" }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </Flex>
  );
};

export default ResizableFlex;
