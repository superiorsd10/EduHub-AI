// utils/redis.js

import Redis from "ioredis";

const redis = new Redis("localhost:6379");

export async function subscribeToChannel(
  channelName: string,
  callback: (channel: string, message: string) => void
) {
  await redis.subscribe(channelName);
  redis.on("message", (channel: string, message: string) => {
    callback(channel, message);
  });
}

export async function unsubscribeFromChannel(channelName:string) {
  await redis.unsubscribe(channelName);
}

export default redis;
