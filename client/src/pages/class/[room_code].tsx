import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import EmptyLayout from "@/components/EmptyLayout";
import LiveControls from "@/components/Live/LiveControls";

const Live: NextPageWithLayout = () => {
  const router = useRouter();
  const room_code = router.query.room_code;
  const [HMSPrebuilt, setHMSPrebuilt] = useState<any | null>(null);

  useEffect(() => {
    import("@100mslive/roomkit-react")
      .then((module) => {
        setHMSPrebuilt(module.HMSPrebuilt);
      })
      .catch((error) => {
        console.error("Failed to dynamically import HMSPrebuilt:", error);
      });
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      {HMSPrebuilt && (
        <HMSPrebuilt roomCode={room_code}>
          <LiveControls/>
        </HMSPrebuilt>
      )}
    </div>
  );
};
Live.getLayout = EmptyLayout;
export default Live;
