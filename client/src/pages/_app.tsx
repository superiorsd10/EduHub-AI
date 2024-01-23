import "@mantine/core/styles.css";

import type { AppProps } from "next/app";
import { createTheme, MantineProvider, rem } from "@mantine/core";
import Layout from "@/layout/Layout";
import localFont from "next/font/local";
import "../firebase/clientApp";
import { AuthProvider } from "@/components/Providers/AuthProvider";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
const geistRegular = localFont({
  src: "../../public/font/Geist/Geist/Geist-Regular.woff2",
});
const geistBold = localFont({
  src:"../../public/font/Geist/Geist/Geist-Bold.woff2",
})

const theme = createTheme({
  /** Put your mantine theme override here */
  components: {
    Text: {},
    Title: {},
  },
  fontFamily: geistRegular.style.fontFamily,
  headings: {
    fontFamily: geistBold.style.fontFamily,
    sizes: {
      h1: {
        fontSize: rem(48),
      },
      h2: {
        fontSize: rem(42),
      },
      h3: {
        fontSize: rem(36),
      },
    },
  },
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout;
  if (getLayout === undefined)
    return (
      <main>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </MantineProvider>
        </AuthProvider>
      </main>
    );
  else
    return (
      <main>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <Component {...pageProps} />
          </MantineProvider>
        </AuthProvider>
      </main>
    );
}
