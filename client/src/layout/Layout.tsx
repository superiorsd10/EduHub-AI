import React, { useContext } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import { Space } from "@mantine/core";
import { AppContext } from "@/providers/AppProvider";
import CreateHubModal from "@/components/Modals/CreateHub";
import CreatePostModal from "@/components/Modals/CreatePost";
import JoinhubModal from "@/components/Modals/JoinHub";

const Layout = ({ children }: React.PropsWithChildren) => {
  const {
    isLoggedIn,
    isCreateHubVisible,
    setIsCreateHubVisible,
    navbarHeight,
  } = useContext(AppContext);
  return (
    <>
      <Head>Nikhil's Portfolio</Head>
      <NavBar />
      {isLoggedIn && <Space h={navbarHeight} />}
      {isLoggedIn && (
        <CreateHubModal
          opened={isCreateHubVisible}
          close={() => {
            setIsCreateHubVisible(false);
          }}
        />
      )}
      {isLoggedIn && <JoinhubModal opened={true} close={() => {}} />}
      {children}
    </>
  );
};

export default Layout;
