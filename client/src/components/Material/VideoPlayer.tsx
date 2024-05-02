import React, {  useEffect, useState } from "react";

const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const [video, setVideo] = useState("");

  useEffect(() => {
    const fetchM3U8File = async () => {
      try {
        const response = await fetch(videoUrl);
        const text = await response.text();
        console.log(text)
        const lines = text.split("\n");
        // Assuming the URL you want is in the fourth line
        if (lines.length >= 7 && lines[6].trim().startsWith("http")) {
          setVideo(lines[6].trim());
          console.log(lines[6].trim())
        } else {
          console.error("Invalid .m3u8 file");
        }
      } catch (error) {
        console.error("Error fetching .m3u8 file", error);
      }
    };

    fetchM3U8File();
  }, []);

  return (
    <div style={{width:'100%'}}>
      <video style={{width:'90%'}} src={video} controls />
    </div>
  );
};

export default VideoPlayer;
