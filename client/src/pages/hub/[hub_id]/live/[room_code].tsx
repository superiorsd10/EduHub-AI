import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { NextPageWithLayout } from "../../../_app";
import EmptyLayout from "@/components/EmptyLayout";
import html2canvas from "html2canvas";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { AppContext } from "@/providers/AppProvider";
import { HubContext, HubProvider } from "@/providers/HubProvider";

const LiveWithoutContext: NextPageWithLayout = () => {
  const [hasJoined, setHasJoined] = useState(false);
  const ToCaptureRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const room_code = router.query.room_code as string;
  const hub_id = router.query.hub_id as string;
  const { token, email } = useContext(AppContext);
  const { currentHubData, fetchHubData, roomId } = useContext(HubContext);

  useEffect(() => {
    if (hub_id && email) {
      fetchHubData(hub_id, token);
    }
  }, []);

  const role = currentHubData?.role;
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const request = window.indexedDB.open("screenshotsDB", 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      if (!db.objectStoreNames.contains("screenshots")) {
        db.createObjectStore("screenshots", { autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      const db = (event.target as any).result as IDBDatabase;
    };
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };
  }, []);

  const captureScreenshot = () => {
    const element = ToCaptureRef.current;
    if (!element) return;
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
      const transaction = db.transaction(["screenshots"], "readwrite");
      const store = transaction.objectStore("screenshots");
      const addRequest = store.add({ blob, hub_id });
      addRequest.onsuccess = () => {
        console.log("Screenshot saved to IndexedDB");
      };
      addRequest.onerror = (error) => {
        console.error("Error saving screenshot:", error);
      };
    };
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };
  };

  const handleJoin = () => {
    if (role === "teacher" && !hasJoined) {
      console.log("User joined as a teacher, start capturing screenshots");
      const id = setInterval(captureScreenshot, 10000);
      setIntervalId(id);
      setHasJoined(true);
    }
  };

  const sendFrames = async (formData: any) => {
    console.log("sencing frames...")
    fetch("http://127.0.0.1:5000/api/process-image-files", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Screenshots uploaded successfully");
        } else {
          console.error("Error uploading screenshots");
        }
      })
      .catch((error) => {
        console.error("Error uploading screenshots:", error);
      });
  };

  const handleLeave = async () => {
    if (role === "teacher") {
      console.log("User left as a teacher, stop capturing screenshots");
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Retrieve all screenshots for the current hub_id
      const request = window.indexedDB.open("screenshotsDB", 1);
      request.onsuccess = (event) => {
        const db = (event.target as any).result as IDBDatabase;
        const transaction = db.transaction(["screenshots"], "readonly");
        const store = transaction.objectStore("screenshots");
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const screenshots = getAllRequest.result.filter(
            (item: any) => item.hub_id === hub_id
          );
          const screenshotsArray = screenshots.map((item: any) => item.blob);
          console.log("Retrieved screenshots:", screenshotsArray);

          const formData = new FormData();
          formData.append("room_id", room_code);
          screenshotsArray.forEach((blob, index) => {
            formData.append(
              "image_files",
              new File([blob], `screenshot_${index}.png`)
            );
          });

          sendFrames(formData);
        };
        getAllRequest.onerror = (error) => {
          console.error("Error retrieving screenshots:", error);
        };
      };
      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
      };

      setHasJoined(false);
    }
  };

  return (
    <div style={{ height: "100vh" }} ref={ToCaptureRef}>
      <HMSPrebuilt
        roomCode={room_code}
        onJoin={handleJoin}
        onLeave={handleLeave}
      ></HMSPrebuilt>
    </div>
  );
};

const Live: NextPageWithLayout = () => {
  return (
    <HubProvider>
      <LiveWithoutContext />
    </HubProvider>
  );
};

Live.getLayout = EmptyLayout;
export default Live;
