import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import { NextPageWithLayout } from "../../../_app";
import EmptyLayout from "@/components/EmptyLayout";
import LiveControls from "@/components/Live/LiveControls";
import html2canvas from "html2canvas";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { HMSRoomProvider } from "@100mslive/react-sdk";
import {
  useHMSStore,
  useHMSActions,
  useHMSNotifications,
} from "@100mslive/react-sdk";

const LiveWithoutContext: NextPageWithLayout = () => {
  const ToCaptureRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const room_code = router.query.room_code as string;
  const notification = useHMSNotifications();
  useEffect(() => {
    if (!notification) {
      return;
    }

    console.log("notification type", notification.type);

    console.log("data", notification.data);
  }, [notification]);

  useEffect(() => {
    const request = window.indexedDB.open("screenshotsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      db.createObjectStore("screenshots", { autoIncrement: true });
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(captureScreenshot, 10000);
    return () => clearInterval(interval);
  }, []);

  const captureScreenshot = () => {
    const element = ToCaptureRef.current;
    if (!element) {
      console.error("Element is not available yet.");
      return;
    }
    console.log("capturing....");
    html2canvas(ToCaptureRef.current as HTMLElement, { useCORS: true }).then(
      (canvas) => {
        canvas.toBlob((blob: any) => {
          saveScreenshotToDB(blob);
        }, "image/png");
      }
    );
  };

  const saveScreenshotToDB = (blob: Blob) => {
    const request = window.indexedDB.open("screenshotsDB", 1);
    request.onsuccess = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      const transaction = db.transaction("screenshots", "readwrite");
      const store = transaction.objectStore("screenshots");
      const addRequest = store.add(blob);
      addRequest.onsuccess = () => {
        console.log("Screenshot saved to IndexedDB");
      };
      addRequest.onerror = (error) => {
        console.error("Error saving screenshot:", error);
      };
    };
  };

  return (
    <div style={{ height: "100vh" }} ref={ToCaptureRef}>
      <HMSPrebuilt roomCode={room_code} />
    </div>
  );
};

const Live: NextPageWithLayout = () => {
  return (
    <HMSRoomProvider>
      <LiveWithoutContext />
    </HMSRoomProvider>
  );
};

Live.getLayout = EmptyLayout;
export default Live;
