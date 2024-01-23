import React from "react";
import FeatureList from "./FeatureList";
import Feature from "./Feature";
import { Flex, Stack, Title } from "@mantine/core";

const Features: React.FC = () => {
  return (
    <>
      <Title order={1}>Features</Title>
      <Flex direction='column' style={{padding:0}} maw='100%'>
        {FeatureList.map((feature, index) => (
          <Feature
            key={index}
            title={feature.title}
            description={feature.description}
            index={index % 2 ? true : false}
            illustration={feature.illustration}
          ></Feature>
        ))}
      </Flex>
    </>
  );
};

export default Features;
