import type { RedisClientType } from 'redis';

const initGameSearchQueues = (client: RedisClientType) => {
  const oneMinute = 'game:queue:1+0';
  const fiveMinute = 'game:queue:5+0';
  const fifteenMinute = 'game:queue:15+0';
  const dummyValue = 'DUMMY';

  return Promise.all([
    client.exists(oneMinute).then((exists) => {
      if (!exists) {
        client.rPush(oneMinute, dummyValue);
      }
    }),
    client.exists(fiveMinute).then((exists) => {
      if (!exists) {
        client.rPush(fiveMinute, dummyValue);
      }
    }),
    client.exists(fifteenMinute).then((exists) => {
      if (!exists) {
        client.rPush(fifteenMinute, dummyValue);
      }
    })
  ]);
};

export default initGameSearchQueues;
