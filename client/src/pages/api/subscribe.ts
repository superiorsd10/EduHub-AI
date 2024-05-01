import Redis from 'ioredis';

export default async function handler(req:any, res:any) {
  if (req.method === 'GET') {
    const { id } = req.query;
    console.log(id);
    const key=`generate_assignment_id_${id}`
    console.log(key)
    
    const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL as string);

    redis.subscribe(key, (err, count) => {
      if (err) {
        console.error('Error subscribing to channel', err);
        return res.status(500).json({ error: 'Error subscribing to channel' });
      }
      console.log(`Subscribed to ${count} channel.`);
    });

    redis.on('message', (channel, message) => {
      console.log(`Received message ${message} from channel ${channel}`);
      
      const parsedMessage = JSON.parse(message);
      if (parsedMessage.id === id) {
        console.log('Received message with desired ID:', parsedMessage);
        res.status(200).json(parsedMessage); // Send response here
        redis.unsubscribe();
        redis.quit();
      }
    });

    req.on('close', () => {
      redis.unsubscribe();
      redis.quit();
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
