import { Flex, Image, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { motion, Variants } from "framer-motion";

type Props = {
  index: boolean;
  title: string;
  description: string;
  illustration: string;
};

const headingVariants: Variants = {
  offscreen: {
    y: 20,
  },
  onscreen: {
    y: 0,
    rotate: 0,
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0,
      mass: 2,
    },
  },
};

const Feature = ({ index, title, description, illustration }: Props) => {
  return (
    <Flex
      direction={{
        sm: "column",
        md: "column-reverse",
        lg: index ? "row-reverse" : "row",
      }}
      w="100vw"
      maw="100%"
      h="60vh"
      pl="5vw"
      pr="5vw"
    >
      <Stack w="45vw" bg="white" justify="center">
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.8 }}
        >
          <motion.div variants={headingVariants}>
            <Title order={3} size="h3">
              {title}
            </Title>
          </motion.div>
        </motion.div>
        <Text color="gray.7">{description}</Text>
      </Stack>
      <Flex w="45vw" align="center" justify={index ? "left" : "right"}>
        <Image
          h="60vh"
          src={`/assets/${illustration}.png`}
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      </Flex>
    </Flex>
  );
};

export default Feature;
