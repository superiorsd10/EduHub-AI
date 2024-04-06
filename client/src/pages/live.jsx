import React, { useState, useEffect } from 'react'
import { NextPage } from 'next';

const data = {
  name: 'new-room-1662723668',
  description: 'This is a sample description for the room',
  template_id: '660ff95848b3dd31b94ff239'
}

const live = () => {
  const [HMSPrebuilt, setHMSPrebuilt] = useState(null);

  useEffect(() => {
    // Dynamically import HMSPrebuilt when the component mounts
    import('@100mslive/roomkit-react').then((module) => {
      setHMSPrebuilt(module.HMSPrebuilt);
    }).catch((error) => {
      console.error('Failed to dynamically import HMSPrebuilt:', error);
    });
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      {HMSPrebuilt && <HMSPrebuilt roomCode="rfg-qayt-zvb" />}
    </div>
  )
}

export default live