import { HttpRequest, Dispatch, Payloads } from './types';
// import { signInLoading } from './actions';
import { toast } from 'bulma-toast';
import axios from 'axios';

export const sendRequest = <T>(request: HttpRequest<Payloads>): Promise<T> => {
  const { endpoint, method, redirect, payload = null } = request;
  return axios({
    method: method,
    url: endpoint,
    data: payload
  });
};

export const hanldeError = (error: Error, dispatch: Dispatch) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      toast({
        message: error.response.data,
        type: 'is-danger',
        position: 'bottom-center',
        dismissible: true,
        pauseOnHover: true
      });
      //   dispatch(signInLoading(false));
    }
  }
};
