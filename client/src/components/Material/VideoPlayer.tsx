import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

const VideoPlayer = ({videoUrl}:{videoUrl:string}) => {
  console.log(videoUrl);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    

    return () => {
      hls.destroy();
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} controls />
    </div>
  );
};

export default VideoPlayer;
