import axios, { AxiosResponse } from 'axios';
import { HttpRequest, Payloads } from './types';

const sendRequest = <T>(
  request: HttpRequest<Payloads>
): Promise<AxiosResponse<T>> => {
  const { endpoint, method, payload = null } = request;
  return axios<T>({
    method: method,
    url: endpoint,
    data: payload
  });
};

export default sendRequest;
