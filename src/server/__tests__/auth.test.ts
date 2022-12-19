import axios from 'axios';
import { type RedisClientType, createClient } from 'redis';
import { encode, decode } from 'jwt-simple';
import { DateTime } from 'luxon';

const { SERVER_FQDN, JWT_SECRET } = process.env;

describe('Authentication and authorization', () => {
  let redis: RedisClientType;
  let token: string;
  beforeAll(async () => {
    redis = createClient({ socket: { port: 3001 } });
    await redis.connect();
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
    const [activationToken] = activationKey.split(':').slice(-1);
    const response = await axios.get(`${SERVER_FQDN}/api/v1/user/activate/${activationToken}`);
    expect(response.status).toBe(200);
  });

  test('The user should be able to login and be granted a token', async () => {
    const response = await axios.post(`${SERVER_FQDN}/api/v1/user/login`, {
      username: 'testuser1',
      password: 'myNewPass$123'
    });
    expect(response.status).toBe(200);
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeTruthy();
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
    const [sessionKey] = await redis.keys('user:session:*');
    expect(sessionKey).toBeTruthy();
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
    // Waiting one signout endpoint to be implemented.
    console.log();
  });

  afterAll(async () => {
    await redis.disconnect();
  });
});
