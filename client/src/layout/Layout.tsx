import React, { useContext } from "react";
import Head from "next/head";
import NavBar from "@/components/NavBar/NavBar";
import { Space } from "@mantine/core";
import { AuthContext } from "@/providers/AuthProvider";
import CreateHubModal from "@/components/Modals/CreateHubModal";
import CreatePostModal from "@/components/Modals/CreatePost";

const Layout = ({ children }: React.PropsWithChildren) => {
  const { isLoggedIn, isCreateHubVisible, setIsCreateHubVisible,isCreatePostVisible,setIsCreatePostVisible } =
    useContext(AuthContext);
  return (
    <>
      <Head>Nikhil's Portfolio</Head>
      <NavBar />
      {isLoggedIn && <Space h="10vh" />}
      {isLoggedIn && (
        <CreateHubModal
          opened={isCreateHubVisible}
          close={() => {
            setIsCreateHubVisible(false);
          }}
        />
      )}
      {children}
    </>
  );
};

export default Layout;
