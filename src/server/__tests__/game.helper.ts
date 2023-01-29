import axios from 'axios';
import type { ConnectionPool } from 'mssql';
import { io, type Socket } from 'socket.io-client';

const { SERVER_FQDN } = process.env;

export const whiteId = 'EE5824EC-796E-4679-B262-146D0913320A';
export const blackId = 'EE5824EC-796E-4679-B262-146D0913320B';
const whiteUsername = 'player_white';
const blackUsername = 'player_black';
const whiteRating = 1600;
const blackRating = 1600;

export const loadTestPlayersIntoDb = async (db: ConnectionPool) => {
  await db.query(
    `INSERT INTO app.base.users (user_id, email, username, password, activated, register_date) VALUES
      ('${whiteId}', 'player_white@coffeechess_test.com', '${whiteUsername}', '$2a$10$.GtITQP6GcT0iBH/xLsMhumfEd046XfmzGYRGFMEZXdei3tj7zeKK', 1, GETDATE()),
      ('${blackId}', 'player_black@coffeechess_test.com', '${blackUsername}', '$2a$10$.GtITQP6GcT0iBH/xLsMhumfEd046XfmzGYRGFMEZXdei3tj7zeKK', 1, GETDATE());
			INSERT INTO app.base.ratings (user_id, game_type_id, rating, last_change) VALUES
		  ('${whiteId}', 1, ${whiteRating}, GETDATE()),
		  ('${whiteId}', 2, ${whiteRating}, GETDATE()),
		  ('${whiteId}', 3, ${whiteRating}, GETDATE()),
		  ('${blackId}', 1, ${blackRating}, GETDATE()),
		  ('${blackId}', 2, ${blackRating}, GETDATE()),
		  ('${blackId}', 3, ${blackRating}, GETDATE());`
  );
};

export const loginTestUsers = async (): Promise<string[]> => {
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

  const whiteCookie = <string[]>whiteLogin.headers['set-cookie'];
  const blackCookie = <string[]>blackLogin.headers['set-cookie'];
  return [
    whiteCookie[0].split('=')[1].split(';')[0],
    blackCookie[0].split('=')[1].split(';')[0]
  ];
};

export const connectSocketsAndListenForGame = async (
  whiteToken: string,
  blackToken: string
): Promise<Socket[]> => {
  const [whiteSocket, blackSocket] = [
    io('http://localhost:3000', {
      extraHeaders: {
        cookie: `access_token=${whiteToken}`
      }
    }),
    io('http://localhost:3000', {
      extraHeaders: {
        cookie: `access_token=${blackToken}`
      }
    })
  ];
  const p1Connection = new Promise<null>((resolve) =>
    whiteSocket.on('connect', () => {
      resolve(null);
    })
  );
  const p2Connect = new Promise<null>((resolve) =>
    blackSocket.on('connect', () => {
      resolve(null);
    })
  );
  await Promise.all([p1Connection, p2Connect]);
  return [whiteSocket, blackSocket];
};

export const readyForNextTestGame = async (
  whiteSocket: Socket,
  blackSocket: Socket
): Promise<void> => {
  await Promise.all([
    whiteSocket.emit('message:game:ready', { ready: true }),
    blackSocket.emit('message:game:ready', { ready: true })
  ]);
};

export const getNewTestGame = () => {
  return {
    gameId: 'aa9a19a2-9487-41b9-bd76-f08f75572e8f',
    userWhite: whiteUsername,
    userWhiteId: whiteId,
    ratingWhite: whiteRating,
    userBlack: blackUsername,
    userBlackId: blackId,
    ratingBlack: blackRating,
    watching: [],
    type: '5+0',
    whiteTime: 300000,
    blackTime: 300000,
    state: 'PENDING',
    position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pendingDrawOfferFrom: null,
    history: [],
    gameChat: [],
    result: null,
    startTime: null
  };
};
