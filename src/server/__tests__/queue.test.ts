import * as sql from 'mssql';
import axios, { AxiosError } from 'axios';
import type { ConnectionPool } from 'mssql';
import { type RedisClientType, createClient } from 'redis';
import {
  playerOneId,
  playerTwoId,
  playerThreeId,
  loadTestPlayersIntoDbForQueue,
  loginTestQueueUsers,
  cleanupQueueUsers
} from './helper';

const { DB_USER, DB_PASSWORD, DB_NAME, SERVER_FQDN } = process.env;

describe('Players can be paired in the queue', () => {
  let redis: RedisClientType;
  let db: ConnectionPool;
  let playerOneHeader: Object;
  let playerTwoHeader: Object;
  let playerThreeHeader: Object;
  /* 
        player_one => 1600
        player_two => 1500
        player_three => 2000
        QUEUE_RATING_MATCH => 300
    */
  beforeAll(async () => {
    redis = createClient({ socket: { port: 3001 } });
    await redis.connect();
    db = await sql.connect(
      `Server=localhost,3002;Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=true`
    );
    await loadTestPlayersIntoDbForQueue(db);
    const [playerOneToken, playerTwoToken, playerThreeToken] = await loginTestQueueUsers();
    playerOneHeader = { headers: { Cookie: `access_token=${playerOneToken};` } };
    playerTwoHeader = { headers: { Cookie: `access_token=${playerTwoToken};` } };
    playerThreeHeader = { headers: { Cookie: `access_token=${playerThreeToken};` } };
  });

  afterAll(async () => {
    await db.query(cleanupQueueUsers);
    await db.close();
    await redis.del([
      `user:session:${playerOneId}`,
      `user:session:${playerTwoId}`,
      `user:session:${playerThreeId}`
    ]);
    await redis.disconnect();
  });

  describe('Two players should be paired based on their elo rating and env QUEUE_RATING_MATCH', () => {
    beforeAll(async () => {
      await Promise.all([
        axios.post(`${SERVER_FQDN}/api/v1/game/search/5+0`, {}, playerOneHeader),
        axios.post(`${SERVER_FQDN}/api/v1/game/search/5+0`, {}, playerThreeHeader)
      ]);
    });

    test('player_one (1500) and player_three (2000) should not be paired', async () => {
      // Unfortunately we need to give the server some time to create the pairing.
      await new Promise<void>((resolve) =>
        setTimeout(async () => {
          const [playerOneGame, playerThreeGame] = await Promise.all([
            redis.json.get(`user:session:${playerOneId}`, { path: ['playingGame'] }),
            redis.json.get(`user:session:${playerThreeId}`, { path: ['playingGame'] })
          ]);
          expect(playerOneGame).toBeNull();
          expect(playerThreeGame).toBeNull();
          resolve();
        }, 3500)
      );
    });

    test('player_one (1500) and player_two (1600) should be paired', async () => {
      await axios.post(`${SERVER_FQDN}/api/v1/game/search/5+0`, {}, playerTwoHeader);
      await new Promise<void>((resolve) =>
        setTimeout(async () => {
          const [playerOneGame, playerTwoGame] = await Promise.all([
            redis.json.get(`user:session:${playerOneId}`, { path: ['playingGame'] }),
            redis.json.get(`user:session:${playerTwoId}`, { path: ['playingGame'] })
          ]);
          expect(playerOneGame).not.toBeNull();
          expect(playerTwoGame).not.toBeNull();
          resolve();
        }, 3500)
      );
    });

    test('A player who is in SEARCHING state should not be able to queue again', async () => {
      try {
        await axios.post(`${SERVER_FQDN}/api/v1/game/search/15+0`, {}, playerThreeHeader);
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          expect(error.response?.status).toBe(500);
        }
      }
    });

    test('A player who is in SEARCHING state should be able to cancel their search for the same time control', async () => {
      const response = await axios.delete(
        `${SERVER_FQDN}/api/v1/game/search/5+0`,
        playerThreeHeader
      );
      expect(response.status).toBe(200);
    });
  });
});
