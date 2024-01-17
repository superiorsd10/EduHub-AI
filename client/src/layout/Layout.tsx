import React from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Head>Nikhil's Portfolio</Head>
      <NavBar />
      {children}
    </>
  );
};

export default Layout;
