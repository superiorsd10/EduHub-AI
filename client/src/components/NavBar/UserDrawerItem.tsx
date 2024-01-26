import NextLink from "@/utils/NextLink";
import { Box, Collapse, Group, Stack } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import React, { ReactNode, useContext, useState } from "react";
import { MdOutlineHub } from "react-icons/md";
import { AuthContext } from "../Providers/AuthProvider";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";

type Props = {
  iconType: React.ElementType;
  name: string;
  href?: string;
  children?: ReactNode;
};

const UserDrawerItem: React.FC<Props> = ({
  iconType,
  name,
  href = "#",
  children,
}) => {
  const { isDrawerOpen } = useContext(AuthContext);
  const [isDropDownVisible, setIsDropDownVisible] = useState<boolean>(false);
  return (
    <Stack gap="0">
      <Group gap="sm" justify="center" align="center">
        <Box style={{zIndex:100}} w="2vw">{React.createElement(iconType, { size: 20 })}</Box>
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "10vw" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Group style={{ overflow: "hidden" }} gap="xs">
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
      <Collapse in={isDropDownVisible}>{children}</Collapse>
    </Stack>
  );
};

export default UserDrawerItem;
