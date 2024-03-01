import React, { ReactNode, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../Providers/AuthProvider";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { useHover } from '@mantine/hooks';

import { Box, Collapse, Group, Stack } from "@mantine/core";
import NextLink from "@/utils/NextLink";

type Props = {
  iconType: React.ElementType;
  name: string;
  href?: string;
  children?: ReactNode;
  isDrawerTemporarilyOpen: boolean;
  onClick?: ()=>void;
};

const UserDrawerItem: React.FC<Props> = ({
  iconType,
  name,
  href = "#",
  children,
  isDrawerTemporarilyOpen,
  onClick
}) => {
  const { hovered, ref } = useHover();
  const { isDrawerOpen } = useContext(AuthContext);
  useEffect(() => {
    if (!isDrawerOpen && !isDrawerTemporarilyOpen) setIsDropDownVisible(false);
  }, [isDrawerOpen, isDrawerTemporarilyOpen]);
  const [isDropDownVisible, setIsDropDownVisible] = useState<boolean>(false);
  return (
    <Stack gap="0" ref={ref} bg={hovered?'#DEE2E6':'white'} style={{cursor:'pointer'}} onClick={()=>{
      if(onClick) onClick()
    }}>
      <Group gap="sm" justify="center" align="center" h='2vw'>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            width: "2vw",
            height:'2vw'
          }}
        >
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
              <Group gap="xs" justify="space-between" align="center">
                <NextLink href={href}>{name}</NextLink>
                {children && (
                  <Box
                    w="2vw"
                    h='100%'
                    style={{
                      display:'flex',
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
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
      {(isDrawerOpen || isDrawerTemporarilyOpen) && (
        <Collapse in={isDropDownVisible}>{children}</Collapse>
      )}
    </Stack>
  );
};

export default UserDrawerItem;
