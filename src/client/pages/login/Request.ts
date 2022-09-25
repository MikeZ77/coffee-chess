import { HttpRequest, Dispatch, Payloads } from './types';
import dotenv from 'dotenv';

// const { NOTIFICATION_TIMEOUT_MS } = process.env;

export const sendRequest = <T>(request: HttpRequest<Payloads>): Promise<T> => {
  const { endpoint, ...data } = request;
  let { body = null } = request;
  if (body != null) {
    body = JSON.stringify(body);
  }
  return fetch(endpoint, { ...data, body }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return <Promise<T>>response.json();
  });
};

export const handleResponse = (data, dispatch) => {};

export const hanldeError = (error, dispatch) => {};
