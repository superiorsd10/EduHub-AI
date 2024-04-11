import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import { NextPageWithLayout } from "../_app";
import EmptyLayout from "@/components/EmptyLayout";
import LiveControls from "@/components/Live/LiveControls";
import html2canvas from "html2canvas";

const Live: NextPageWithLayout = () => {
  const ToCaptureRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const room_code = router.query.room_code as string;
  const [HMSPrebuilt, setHMSPrebuilt] = useState<any | null>(null);

  useEffect(() => {
    import("@100mslive/roomkit-react")
      .then((module) => {
        setHMSPrebuilt(module.HMSPrebuilt);
      })
      .catch((error) => {
        console.error("Failed to dynamically import HMSPrebuilt:", error);
      });

    const request = window.indexedDB.open("screenshotsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      db.createObjectStore("screenshots", { autoIncrement: true });
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(captureScreenshot, 10000); // Capture every 10 seconds
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
      {HMSPrebuilt && (
        <HMSPrebuilt roomCode={room_code}>
          {ToCaptureRef && <LiveControls />}
        </HMSPrebuilt>
      )}
    </div>
  );
};

Live.getLayout = EmptyLayout;
export default Live;
