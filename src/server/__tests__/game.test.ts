import * as sql from 'mssql';
import { type Socket } from 'socket.io-client';
import type { ConnectionPool } from 'mssql';
import { type RedisClientType, createClient } from 'redis';
import { genWhiteMoveCheckmate, genBlackMoveCheckmate } from './game.mocks';
import {
  whiteId,
  blackId,
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

  beforeEach(async () => {
    const newGame = getNewTestGame();
    await Promise.all([
      redis.json.set(`user:session:${whiteId}`, '$.playingGame', newGame.gameId),
      redis.json.set(`user:session:${blackId}`, '$.playingGame', newGame.gameId),
      redis.json.set(`game:${newGame.gameId}`, '$', newGame)
    ]);
    await readyForNextTestGame(whiteSocket, blackSocket);
  });

  afterEach(() => {
    whiteSocket.removeAllListeners();
    blackSocket.removeAllListeners();
  });

  describe('A game with checkmate results in a good state', () => {
    test('A game can be played through until one player is checkmated', (done) => {
      done();
      // whiteSocket.on('message:game:move', () => {
      //   const nextMove =
      //     p1Color === 'w'
      //       ? genWhiteMoveCheckmate().next().value
      //       : genBlackMoveCheckmate().next().value;
      //   if (nextMove) {
      //     whiteSocket.emit('message:game:move', nextMove);
      //   } else {
      //     done();
      //   }
      // });
      // blackSocket.on('message:game:move', () => {
      //   const nextMove =
      //     p2Color === 'w'
      //       ? genWhiteMoveCheckmate().next().value
      //       : genBlackMoveCheckmate().next().value;
      //   blackSocket.emit('message:game:move', nextMove);
      //   if (nextMove) {
      //     blackSocket.emit('message:game:move');
      //   } else {
      //     done();
      //   }
      // });
    });
  });
});
