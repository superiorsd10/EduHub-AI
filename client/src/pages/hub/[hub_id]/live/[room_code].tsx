import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import html2canvas from "html2canvas";
import { NextPageWithLayout } from "../../../_app";
import EmptyLayout from "@/components/EmptyLayout";
import { HMSPrebuilt } from "@100mslive/roomkit-react";
import { AppContext } from "@/providers/AppProvider";
import { HubContext, HubProvider } from "@/providers/HubProvider";

const LiveWithoutContext: NextPageWithLayout = () => {
  const router = useRouter();
  const [hasJoined, setHasJoined] = useState(false);
  const ToCaptureRef = useRef<HTMLDivElement>(null);

  const hub_id = router.query.hub_id as string;
  const room_code = router.query.room_code as string;

  const { token, email } = useContext(AppContext);
  const { currentHubData, fetchHubData, roomId, recordingData } = useContext(HubContext);

  useEffect(() => {
    if (hub_id && email) fetchHubData(hub_id, token);
  }, []);

  const role = currentHubData?.role;
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const request = window.indexedDB.open(`screenshotsDB_${hub_id}`, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      if (!db.objectStoreNames.contains("screenshots")) {
        db.createObjectStore("screenshots", { autoIncrement: true });
      }
    };
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };
  }, []);

  const captureScreenshot = () => {
    const element = ToCaptureRef.current;
    if (!element) return;
    html2canvas(ToCaptureRef.current as HTMLElement, { useCORS: true }).then(
      (canvas) => {
        canvas.toBlob((blob: any) => {
          saveScreenshotToDB(blob);
        }, "image/png");
      }
    );
  };

  const saveScreenshotToDB = (blob: Blob) => {
    const request = window.indexedDB.open(`screenshotsDB_${hub_id}`, 1);
    request.onsuccess = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      const transaction = db.transaction(["screenshots"], "readwrite");
      const store = transaction.objectStore("screenshots");
  
      // Using the current timestamp as a unique ID
      const screenshotId = Date.now(); 
  
      const addRequest = store.add({ id: screenshotId, blob });
      addRequest.onsuccess = () => {
        console.log("Screenshot saved to IndexedDB with ID:", screenshotId);
      };
      addRequest.onerror = (error) => {
        console.error("Error saving screenshot:", error);
      };
    };
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
    };
  };

  const handleJoin = async () => {
    if (role === "teacher" && !hasJoined) {
      await fetch(`http://127.0.0.1:5000/api/${hub_id}/create-recording`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          title: recordingData?.title,
          topic: recordingData?.topic,
          description: recordingData?.description,
          room_id:roomId
        }),
      });
      console.log("User joined as a teacher, start capturing screenshots");
      const id = setInterval(captureScreenshot, 10000);
      setIntervalId(id);
      setHasJoined(true);
    }
  };

  const sendFrames = async (formData: any) => {
    console.log("sencing frames...");
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
  
      const request = window.indexedDB.open(`screenshotsDB_${hub_id}`, 1);
      request.onsuccess = (event) => {
        const db = (event.target as any).result as IDBDatabase;
        const transaction = db.transaction(["screenshots"], "readwrite");
        const store = transaction.objectStore("screenshots");
        const getAllRequest = store.getAll();
  
        getAllRequest.onsuccess = () => {
          const screenshots = getAllRequest.result;
          const formData = new FormData();
          formData.append("room_id", roomId as string);
          let counter = 0;
          screenshots.forEach((item: any, index: number) => {
            if (counter === 10) return;
            const fileName = `SCR-${new Date().toISOString().slice(0, 10)}-${index + 1}.png`;
            formData.append("image_files", new File([item.blob], fileName, { type: "image/png" }));
            ++counter;
          });
  
          sendFrames(formData);
  
          const deleteTransaction = db.transaction(["screenshots"], "readwrite");
          const deleteStore = deleteTransaction.objectStore("screenshots");
          screenshots.forEach((item) => {
            console.log(item.id)
            if (item.id !== undefined && item.id !== null) {
              deleteStore.delete(item.id);
            }
          });
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
