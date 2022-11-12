import { Reducer, HttpRequest, LoginPayload } from '../types';

const { SERVER_FQDN } = process.env;

export const reduceLogin: Reducer = (action, state) => {
  switch (action.type) {
    case 'UPDATE_USERNAME': {
      const { username } = action;
      return { ...state, username };
    }
    case 'UPDATE_PASSWORD': {
      const { password } = action;
      return { ...state, password };
    }
    case 'LOADING_BUTTON': {
      const { loading } = action;
      return { ...state, loading };
    }
    case 'REQUEST_LOGIN': {
      const { payload } = action;
      const pendingRequest: HttpRequest<LoginPayload> = {
        endpoint: SERVER_FQDN + '/api/v1/user/login',
        method: 'POST',
        redirect: 'follow',
        payload
      };
      return { ...state, pendingRequest };
    }
    case 'REQUEST_REGISTER': {
      const pendingRequest: HttpRequest = {
        endpoint: SERVER_FQDN + '/register',
        method: 'GET'
      };
      return { ...state, pendingRequest };
    }
  }
};
