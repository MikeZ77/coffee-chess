import axios from 'axios';
import * as sql from 'mssql';
import type { ConnectionPool } from 'mssql';
import { type RedisClientType, createClient } from 'redis';
import { encode, decode } from 'jwt-simple';
import { DateTime } from 'luxon';

const { SERVER_FQDN, JWT_SECRET, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

describe('Authentication and authorization', () => {
  let redis: RedisClientType;
  let db: ConnectionPool;
  let activationToken: string;
  let token: string;
  let userId: string;
  beforeAll(async () => {
    redis = createClient({ socket: { port: 3001 } });
    await redis.connect();
    db = await sql.connect(
      `Server=localhost,3002;Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=true`
    );
  });

  test('The user should be able to register an account given valid information', async () => {
    const response = await axios.post(`${SERVER_FQDN}/api/v1/user/register`, {
      username: 'testuser1',
      password: 'myNewPass$123',
      email: 'testemail@civikli.com'
    });
    expect(response.status).toBe(201);
  });

  test('The user should have an activation token created', async () => {
    const activationKeys = await redis.keys('user:activation:*');
    expect(activationKeys).toHaveLength(1);
    const [activationKey] = activationKeys;
    [activationToken] = activationKey.split(':').slice(-1);
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/activate/${activationToken}`);
    expect(response.status).toBe(200);
    userId = <string>await redis.get(activationKey);
    expect(userId).not.toBeNull();
  });

  test('The user should be able to login and be granted a token', async () => {
    const response = await axios.post(`${SERVER_FQDN}/api/v1/user/login`, {
      username: 'testuser1',
      password: 'myNewPass$123'
    });
    expect(response.status).toBe(200);
    const cookies = response.headers['set-cookie'];
    expect(cookies).toHaveLength(1);
    const [cookie] = <string[]>cookies;
    token = cookie.split('=')[1].split(';')[0];
  });

  test('The user can access a protected endpoint using their token', async () => {
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/test`, {
      headers: {
        Cookie: `access_token=${token};`
      }
    });
    expect(response.status).toBe(200);
  });

  test('A user session should exist after logging in', async () => {
    const userSession = await redis.exists(`user:session:${userId}`);
    expect(userSession).toBe(1);
  });

  test('An unauthenticated user should get redirected back to login', async () => {
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/test`);
    expect(response.request.path).toBe('/login');
    expect(response.status).toBe(200);
  });

  test('An expired token should get redirected back to login', async () => {
    const tokenInfo = decode(token, JWT_SECRET);
    const issued = DateTime.now().minus({ hours: 1 }).toString();
    const expires = DateTime.now().minus({ minutes: 10 }).toString();
    const expiredToken = encode({ ...tokenInfo, issued, expires }, JWT_SECRET);
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/test`, {
      headers: {
        Cookie: `access_token=${expiredToken};`
      }
    });
    expect(response.request.path).toBe('/login');
    expect(response.status).toBe(200);
  });

  test('A token which is within the refresh interval should be renewed', async () => {
    const tokenInfo = decode(token, JWT_SECRET);
    const issued = DateTime.now().minus({ hours: 1 }).toString();
    const expires = DateTime.now().plus({ minutes: 10 }).toString();
    const tokenToRenew = encode({ ...tokenInfo, issued, expires }, JWT_SECRET);
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/test`, {
      headers: {
        Cookie: `access_token=${tokenToRenew};`
      }
    });
    expect(response.status).toBe(200);
    const cookies = response.headers['set-cookie'];
    const [cookie] = <string[]>cookies;
    const renewedToken = cookie.split('=')[1].split(';')[0];
    expect(renewedToken).not.toEqual(token);
  });

  test('The user should be able to sign out', async () => {
    const response = await axios.post(
      `${SERVER_FQDN}/api/v1/user/logout`,
      {},
      {
        headers: {
          Cookie: `access_token=${token};`
        }
      }
    );
    expect(response.status).toBe(200);
    const userSession = await redis.exists(`user:session:${userId}`);
    expect(userSession).toBe(0);
  });

  afterAll(async () => {
    await redis.del(`user:activation:${activationToken}`);
    await db.query(
      `DELETE base.ratings WHERE user_id='${userId}'; DELETE base.users WHERE user_id='${userId}';`
    );
    await redis.disconnect();
    await db.close();
  });
});
