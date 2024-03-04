import Banner from "@/components/Classroom/Banner";
import Body from "@/components/Classroom/Body";
import Header from "@/components/Classroom/Header";
import ResizableFlex from "@/utils/ResizableFlex";
import { Stack } from "@mantine/core";
import React, { useEffect, useContext } from "react";
import { AuthContext } from "@/components/Providers/AuthProvider";
import { useRouter } from "next/router";

const classroom = () => {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  useEffect(() => {
    const getHub = async () => {
      const hub_id = router.query.hub_id as string;
      console.log(hub_id.length)
      const response = await fetch(`http://127.0.0.1:5000/api/hub/${hub_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      console.log(data);
    };
    getHub();
  }, []);
  return (
    <ResizableFlex>
      <Stack pl="2%" pr="2%" gap="xl">
        <Header />
        <Banner />
        <Body />
      </Stack>
    </ResizableFlex>
  );
};

export default classroom;
