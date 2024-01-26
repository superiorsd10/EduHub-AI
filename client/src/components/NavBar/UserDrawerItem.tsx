import React, { ReactNode, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Providers/AuthProvider";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";

import { Box, Collapse, Group, Stack } from "@mantine/core";
import NextLink from "@/utils/NextLink";

type Props = {
  iconType: React.ElementType;
  name: string;
  href?: string;
  children?: ReactNode;
  isDrawerTemporarilyOpen: boolean;
};

const UserDrawerItem: React.FC<Props> = ({
  iconType,
  name,
  href = "#",
  children,
  isDrawerTemporarilyOpen,
}) => {

  const { isDrawerOpen } = useContext(AuthContext);
  const [isDropDownVisible, setIsDropDownVisible] = useState<boolean>(false);
  return (
    <Stack gap="0">
      <Group gap="sm" justify="center" align="center" >
        <Box style={{ zIndex: 100 }} w="2vw">
          {React.createElement(iconType, { size: 20 })}
        </Box>
        <AnimatePresence>
          {(isDrawerOpen || isDrawerTemporarilyOpen) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "10vw" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Group gap="xs">
                <NextLink href={href}>{name}</NextLink>
                {children && (
                  <Box
                    w="2vw"
                    ml="auto"
                    style={{ alignItems: "flex-end", justifyContent: "center" }}
                    onClick={() => setIsDropDownVisible(!isDropDownVisible)}
                  >
                    {isDropDownVisible ? (
                      <IoMdArrowDropdown size={20} />
                    ) : (
                      <IoMdArrowDropright size={20} />
                    )}
                  </Box>
                )}
              </Group>
            </motion.div>
          )}
        </AnimatePresence>
      </Group>
      {(isDrawerOpen || isDrawerTemporarilyOpen) && <Collapse in={isDropDownVisible}>{children}</Collapse>}
    </Stack>
  );
};

export default UserDrawerItem;
