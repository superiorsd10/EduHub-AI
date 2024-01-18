import "@mantine/core/styles.css";

import type { AppProps } from "next/app";
import { createTheme, MantineProvider, rem } from "@mantine/core";
import Layout from "@/layout/Layout";
import localFont from 'next/font/local'
const geist=localFont({src:'../../public/font/Geist/Geist/Geist-Regular.woff2'})

const theme = createTheme({
  /** Put your mantine theme override here */
  components: {
    Text: {

    },
    Title: {
    }
  },
  fontFamily: geist.style.fontFamily,
  headings: {
    sizes: {
      h1: {
        fontSize:rem(48)
      },
      h2: {
        fontSize:rem(42)
      },
      h3: {
        fontSize:rem(36)
      }
    }
  }
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
