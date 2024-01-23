import Head from "next/head";
import { ReactElement } from "react";
import { Stack } from "@mantine/core";

const Layout = (page:ReactElement) => {
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      <Stack w="100vw" maw="100%" h="100vh" mb="10vh" pl="5vw" pr="5vw" gap={0}>
        {page}
      </Stack>
    </>
  );
};

export default Layout;
