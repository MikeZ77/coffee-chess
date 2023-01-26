import axios from 'axios';
import * as sql from 'mssql';
import { io, type Socket } from 'socket.io-client';
import type { ConnectionPool } from 'mssql';
import { type RedisClientType, createClient } from 'redis';

const { DB_USER, DB_PASSWORD, DB_NAME, SERVER_FQDN } = process.env;

describe('A game can be played to completion', () => {
  let redis: RedisClientType;
  let db: ConnectionPool;
  let whiteSocket: Socket;
  let blackSocket: Socket;
  let whiteToken: string;
  let blackToken: string;

  beforeAll(async () => {
    // Create users in the database
    db = await sql.connect(
      `Server=localhost,3002;Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=true`
    );

    const whiteUserId = 'EE5824EC-796E-4679-B262-146D0913320A';
    const blackUserId = 'EE5824EC-796E-4679-B262-146D0913320B';
    const whiteUsername = 'player_white';
    const blackUsername = 'player_black';
    await db.query(
      `INSERT INTO app.base.users (user_id, email, username, password, activated, register_date) VALUES
      ('${whiteUserId}', 'player_white@coffeechess_test.com', '${whiteUsername}', '$2a$10$.GtITQP6GcT0iBH/xLsMhumfEd046XfmzGYRGFMEZXdei3tj7zeKK', 1, GETDATE()),
      ('${blackUserId}', 'player_black@coffeechess_test.com', '${blackUsername}', '$2a$10$.GtITQP6GcT0iBH/xLsMhumfEd046XfmzGYRGFMEZXdei3tj7zeKK', 1, GETDATE());
			INSERT INTO app.base.ratings (user_id, game_type_id, rating, last_change) VALUES
		  ('${whiteUserId}', 1, 1600, GETDATE()),
		  ('${whiteUserId}', 2, 1600, GETDATE()),
		  ('${whiteUserId}', 3, 1600, GETDATE()),
		  ('${blackUserId}', 1, 1600, GETDATE()),
		  ('${blackUserId}', 2, 1600, GETDATE()),
		  ('${blackUserId}', 3, 1600, GETDATE());`
    );

    // Login to create user object in redis and get auth token
    const [whiteLogin, blackLogin] = await Promise.all([
      axios.post(`${SERVER_FQDN}/api/v1/user/login`, {
        username: 'player_white',
        password: 'myNewPass$1123'
      }),
      axios.post(`${SERVER_FQDN}/api/v1/user/login`, {
        username: 'player_black',
        password: 'myNewPass$1123'
      })
    ]);

    const whiteCookie = whiteLogin.headers['set-cookie'];
    const blackCookie = blackLogin.headers['set-cookie'];
    [whiteToken] = <string[]>whiteCookie;
    [blackToken] = <string[]>blackCookie;

    // Init remaining connections
    whiteSocket = io({
      extraHeaders: {
        cookie: whiteToken
      }
    });
    blackSocket = io({
      extraHeaders: {
        cookie: blackToken
      }
    });
    redis = createClient({ socket: { port: 3001 } });
    await redis.connect();
  });

  beforeEach(async () => {
    const whiteHeader = [{}, { headers: { Cookie: whiteToken } }];
    const blackHeader = [{}, { headers: { Cookie: blackToken } }];
    await Promise.all([
      axios.post(`${SERVER_FQDN}/api/v1/game/search/5+0`, ...whiteHeader),
      axios.post(`${SERVER_FQDN}/api/v1/game/search/5+0`, ...blackHeader)
    ]);
  });

  describe('A game can end by checkmate', () => {
    test('placeholder', async () => {
      expect(true).toBe(true);
    });
  });
});
