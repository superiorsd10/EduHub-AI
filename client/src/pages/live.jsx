import React, { useState, useEffect } from 'react'

const live = () => {
  const URL = 'https://api.100ms.live/v2/room-codes/room/6610f313e4bed7263690583b'
  const [HMSPrebuilt, setHMSPrebuilt] = useState(null);

  const fetchRoomInfo = async()=>{
    const token='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3MTIzODY2NTUsImV4cCI6MTcxMjk5MTQ1NSwianRpIjoiZTZmOTU5YTUtZjBiZS00MDU1LTgyZWMtNDNiYTczODJhZmFlIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE3MTIzODY2NTUsImFjY2Vzc19rZXkiOiI2NjBmY2I1NWJhYmMzM2YwMGU0YWI5NjcifQ.v5rvaQdUfGk0Gp-ENFdqdc1lJ_Gq9JAPPqefTT1J3EQ'
    const resp=await fetch(URL,{
      method:'POST',
      headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    const redata=await resp.json();
    console.log(redata);
  }
  useEffect(()=>{
      fetchRoomInfo();
  })
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