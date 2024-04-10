import React, { useContext } from "react";
import { motion, Variants } from "framer-motion";
import { Flex, Image, Stack, Text, Title } from "@mantine/core";
import { AppContext } from "@/providers/AppProvider";

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
  const { componentHeight } =useContext(AppContext);
  return (
    <Flex
      direction={{
        base: "column-reverse",
        sm: "column-reverse",
        md: index ? "row-reverse" : "row",
        lg: index ? "row-reverse" : "row",
      }}
      w="100vw"
      maw="100%"
      mah={{ base: componentHeight, sm: componentHeight, md: "60svh", lg: "60svh" }}
      pl="5vw"
      pr="5vw"
      mb='10vh'
      gap={{ base: "lg", sm: "lg", md:0, lg:0 }}
    >
      <Stack
        w={{ base: "90vw", sm: "90vw", md: "45vw", lg: "45vw" }}
        bg="white"
        justify="center"
      >
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
        <Text color="gray.8">{description}</Text>
      </Stack>
      <Flex
        w={{ base: "90vw", sm: "90vw", md: "45vw", lg: "45vw" }}
        align="center"
        justify={{
          base: "center",
          sm: "center",
          md: index ? "left" : "right",
          lg: index ? "left" : "right",
        }}
      >
        <Image
          mah={{base:'40svh',sm:'40svh',md:'60svh',lg:'60svh'}}
          src={`/assets/${illustration}.png`}
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
        />
      </Flex>
    </Flex>
  );
};

export default Feature;
