import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

const VideoPlayer = ({videoUrl}:{videoUrl:string}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hls.loadSource(`https://cors-anywhere.herokuapp.com/${videoUrl}`);
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
