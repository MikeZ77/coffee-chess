import axios from 'axios';
import { HttpRequest } from './types';

const sendRequest = <T, P>(request: HttpRequest<P>): Promise<T> => {
  const { endpoint, method, payload = null } = request;
  return axios({
    method: method,
    url: endpoint,
    data: payload
  });
};

export default sendRequest;
