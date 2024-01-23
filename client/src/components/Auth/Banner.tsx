import { Flex, Image } from "@mantine/core";
import React from "react";

const Banner:React.FC<{imageSrc:string}> = ({imageSrc}) => {
  return (
    <Flex h={{base:'85svh',sm:'40svh',md:'85svh',lg:'85svh'}} maw={{base:'90vw',sm:'90vw',md:'45vw',lg:'45vw'}} visibleFrom="sm" m='auto'>
      <Image
        style={{objectFit:'contain'}}
        src={imageSrc}
        fallbackSrc="https://placehold.co/600x400?text=Placeholder"
      />
    </Flex>
  );
};

export default Banner;
