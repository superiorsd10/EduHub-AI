import Banner from "@/components/Classroom/Banner";
import Body from "@/components/Classroom/Body";
import Header from "@/components/Classroom/Header";
import ResizableFlex from "@/utils/ResizableFlex";
import { Stack } from "@mantine/core";
import React, { useEffect, useContext } from "react";
import { AppContext } from "@/providers/AppProvider";
import { HubProvider, HubContext } from "@/providers/HubProvider";
import { useRouter } from "next/router";
import CreatePostModal from "@/components/Modals/CreatePost";
import AcceptRequests from "@/components/Modals/AcceptRequests";

const HubWithoutContext = () => {
  const router = useRouter();
  const hub_id = router.query.hub_id as string;
  const { token,email } = useContext(AppContext);
  const { currentHubData, fetchHubData, isCreatePostVisible, setIsCreatePostVisible } = useContext(HubContext);

  useEffect(() => {
    if (hub_id && email) fetchHubData(hub_id, token);
  }, [router, hub_id,email]);

  return (
    <ResizableFlex>
      <CreatePostModal
        opened={isCreatePostVisible}
        close={() => {
          setIsCreatePostVisible(false);
        }}
        id={hub_id}
      />
      <AcceptRequests id={hub_id}/>
      <Stack pl="2%" pr="2%" gap="xl">
        <Header />
        {currentHubData != null && (
          <Banner title={currentHubData!.introductory.name} />
        )}
        {currentHubData != null && (
          <Body
            introductory={currentHubData!.introductory}
            paginatedData={currentHubData!.paginated}
            role={currentHubData.role}
          />
        )}
      </Stack>
    </ResizableFlex>
  );
};

const Hub = () => {
  return (
    <HubProvider>
      <HubWithoutContext />
    </HubProvider>
  );
};

export default Hub;
