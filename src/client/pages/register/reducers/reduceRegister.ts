import { Reducer, State, HttpRequest, RegisterPayload } from '../types';

const { SERVER_FQDN } = process.env;

export const reduceRegister: Reducer = (action, state): State => {
  switch (action.type) {
    case 'UPDATE_USERNAME': {
      const { username } = action;
      return { ...state, username };
    }
    case 'UPDATE_EMAIL': {
      const { email } = action;
      return { ...state, email };
    }
    case 'UPDATE_PASSWORD': {
      const { password } = action;
      return { ...state, password };
    }
    case 'UPDATE_REPEATED_PASSWORD': {
      const { repeatedPassword } = action;
      return { ...state, repeatedPassword };
    }
    case 'REQUEST_REGISTER': {
      const { payload } = action;
      const pendingRequest: HttpRequest<RegisterPayload> = {
        endpoint: SERVER_FQDN + '/api/v1/user/register',
        method: 'POST',
        redirect: 'follow',
        payload
      };
      return { ...state, pendingRequest };
    }
    default: {
      return state;
    }
  }
};
