import { HttpRequest, Dispatch, Payloads } from './types';
import { AxiosResponse } from 'axios';
import { toast } from 'bulma-toast';
import { registerLoading } from './actions';
import axios from 'axios';

const { SERVER_FQDN } = process.env;

// TODO: Response interface/type should be passed as type into Axios.
export const sendRequest = <T>(
  request: HttpRequest<Payloads>
): Promise<AxiosResponse> => {
  const { endpoint, method, payload = null } = request;
  return axios({
    method: method,
    url: endpoint,
    data: payload
  });
};

export const handleResponse = (response: AxiosResponse) => {
  localStorage.setItem('REGISTRATION_COMPLETE', response.data.message);
  window.location.assign(`${SERVER_FQDN}/login`);
};

export const hanldeError = (error: Error, dispatch: Dispatch) => {
  if (axios.isAxiosError(error)) {
    dispatch(registerLoading(false));
    if (error.response) {
      toast({
        message: error.response.data,
        type: 'is-danger',
        position: 'bottom-center',
        dismissible: true,
        pauseOnHover: true,
        duration: 3000
      });
    }
  }
};
