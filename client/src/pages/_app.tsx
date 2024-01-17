import "@mantine/core/styles.css";

import type { AppProps } from "next/app";
import { createTheme, MantineProvider } from "@mantine/core";
import Layout from "@/layout/Layout";



const theme = createTheme({
  /** Put your mantine theme override here */
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
      <MantineProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </main>
  );
}
