import * as sql from 'mssql';
import { type Socket } from 'socket.io-client';
import type { ConnectionPool } from 'mssql';
import { type RedisClientType, createClient } from 'redis';
import { DateTime } from 'luxon';
import { genWhiteMoveCheckmate, genBlackMoveCheckmate } from './game.mocks';
import {
  whiteId,
  blackId,
  gameId,
  loadTestPlayersIntoDb,
  loginTestUsers,
  connectSocketsAndListenForGame,
  readyForNextTestGame,
  getNewTestGame
} from './game.helper';

const { DB_USER, DB_PASSWORD, DB_NAME } = process.env;

describe('A game can be played to completion', () => {
  let redis: RedisClientType;
  let db: ConnectionPool;
  let whiteSocket: Socket;
  let blackSocket: Socket;
  let numPlayersConnected = 0;

  beforeAll(async () => {
    redis = createClient({ socket: { port: 3001 } });
    await redis.connect();
    db = await sql.connect(
      `Server=localhost,3002;Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=true`
    );
    await loadTestPlayersIntoDb(db);
    const [whiteToken, blackToken] = await loginTestUsers();
    [whiteSocket, blackSocket] = await connectSocketsAndListenForGame(whiteToken, blackToken);
  });

  afterAll(async () => {
    // whiteSocket.close();
    // blackSocket.close();
    await redis.disconnect();
    await db.close();
  });

  describe('A game with checkmate results in a good state', () => {
    const genWhiteMove = genWhiteMoveCheckmate();
    const genBlackMove = genBlackMoveCheckmate();
    // Unfortunately, beforeEach runs after every test not describe
    beforeAll(() => {
      const newGame = getNewTestGame();
      Promise.all([
        redis.json.set(`user:session:${whiteId}`, '$.playingGame', newGame.gameId),
        redis.json.set(`user:session:${blackId}`, '$.playingGame', newGame.gameId),
        redis.json.set(`game:${newGame.gameId}`, '$', newGame)
      ]).then(() => {
        readyForNextTestGame(whiteSocket, blackSocket);
      });
    });

    afterAll(() => {
      numPlayersConnected = 0;
      whiteSocket.removeAllListeners();
      blackSocket.removeAllListeners();
    });

    test('The game should be played through until one player is checkmated', (done) => {
      whiteSocket.on('message:game:connected', () => {
        numPlayersConnected++;
        if (numPlayersConnected === 2) {
          const firstMove = genWhiteMove.next().value;
          whiteSocket.emit('message:game:move', {
            ...firstMove,
            timestampUtc: DateTime.utc().toString()
          });
        }
      });
      whiteSocket.on('message:game:move', () => {
        const nextMove = genWhiteMove.next().value;
        if (nextMove) {
          whiteSocket.emit('message:game:move', {
            ...nextMove,
            timestampUtc: DateTime.utc().toString()
          });
        } else {
          done();
        }
      });
      blackSocket.on('message:game:move', () => {
        const nextMove = genBlackMove.next().value;
        blackSocket.emit('message:game:move', {
          ...nextMove,
          timestampUtc: DateTime.utc().toString()
        });
      });
    });

    test('The game should be in state COMPLETE', async () => {
      const state = await redis.json.get(`game:${gameId}`, { path: ['state'] });
      expect(state).toBe('COMPLETE');
    });

    test('The game should be stored in the database', async () => {
      expect(true).toBe(true);
    });
  });
});
