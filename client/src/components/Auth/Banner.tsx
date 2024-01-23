import { Flex, Image } from "@mantine/core";
import React from "react";

const Banner:React.FC<{imageSrc:string}> = ({imageSrc}) => {
  return (
    <Flex w="45vw">
      <Image
        src={imageSrc}
        fallbackSrc="https://placehold.co/600x400?text=Placeholder"
      />
    </Flex>
  );
};

export default Banner;
