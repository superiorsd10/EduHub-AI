import Redis from 'ioredis';

export default async function handler(req:any, res:any) {
  if (req.method === 'GET') {
    const { id } = req.query;
    const key = `generate_assignment_id_${id}`;

    const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL as string);

    const subscriptionPromise = new Promise((resolve, reject) => {
      redis.subscribe(key, (err, count) => {
        if (err) {
          console.error('Error subscribing to channel', err);
          reject(err);
        }
        console.log(`Subscribed to ${count} channel.`);
      });

      redis.on('message', (channel, message) => {
        console.log(`Received message ${message} from channel ${channel}`);
        
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.id === id) {
          console.log('Received message with desired ID:', parsedMessage);
          resolve(parsedMessage);
          redis.unsubscribe();
          redis.quit();
        }
      });

      req.on('close', () => {
        redis.unsubscribe();
        redis.quit();
        reject(new Error('Request closed'));
      });
    });

    try {
      const data = await subscriptionPromise;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Assignment not generated" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
