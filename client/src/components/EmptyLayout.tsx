import Head from "next/head";
import { ReactElement } from "react";
import { Stack } from "@mantine/core";

const EmptyLayout = (page:ReactElement) => {
  return (
    <>
      <Stack w="100vw" maw="100%" h="100vh" mb="10vh" pl="5vw" pr="5vw" gap={0}>
        {page}
      </Stack>
    </>
  );
};

export default EmptyLayout;
