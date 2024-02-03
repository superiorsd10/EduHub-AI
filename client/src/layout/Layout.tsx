import React, { useContext } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import { Space } from "@mantine/core";
import { AuthContext } from "@/components/Providers/AuthProvider";

const Layout = ({ children }: React.PropsWithChildren) => {
  const { isLoggedIn } = useContext(AuthContext);
  return (
    <>
      <Head>Nikhil's Portfolio</Head>
      <NavBar />
      {isLoggedIn && <Space h="10vh" />}
      {children}
    </>
  );
};

export default Layout;
