import React, { useEffect } from "react";
import {
  useHMSStore,
  useHMSActions,
  useHMSNotifications,
} from "@100mslive/react-sdk";

const LiveControls = () => {
  const hmsActions = useHMSActions();
  
  const hmsNotifications = useHMSNotifications();
  useEffect(()=>{
    console.log("notification",hmsNotifications?.type)
  },[hmsNotifications])
  return <></>;
};

export default LiveControls;
