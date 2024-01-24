import React from "react";
import FeatureList from "./FeatureList";
import Feature from "./Feature";
import { Box, Stack, Title } from "@mantine/core";

const Features: React.FC = () => {
  return (
    <>
      <Title id="features" style={{ textAlign: "center" }} order={1}>Features</Title>
      {FeatureList.map((feature, index) => (
        <Feature
          key={index}
          title={feature.title}
          description={feature.description}
          index={index % 2 ? true : false}
          illustration={feature.illustration}
        ></Feature>
      ))}
    </>
  );
};

export default Features;
