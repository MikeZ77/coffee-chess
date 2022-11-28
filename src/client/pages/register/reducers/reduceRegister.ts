import { Reducer, HttpRequest, RegisterPayload } from '../../../common/types';
import { State } from '../state';
import { Action } from '../actions/actions';

const { SERVER_FQDN } = process.env;

export const reduceRegister: Reducer<State, Action> = (
  action,
  state
): State => {
  switch (action.type) {
    case 'UPDATE_USERNAME': {
      let { username } = action;
      username = username.trim();
      return { ...state, username };
    }
    case 'UPDATE_EMAIL': {
      let { email } = action;
      email = email.trim();
      return { ...state, email };
    }
    case 'UPDATE_PASSWORD': {
      let { password } = action;
      password = password.trim();
      return { ...state, password };
    }
    case 'UPDATE_REPEATED_PASSWORD': {
      let { repeatedPassword } = action;
      repeatedPassword = repeatedPassword.trim();
      return { ...state, repeatedPassword };
    }
    case 'LOADING_REGISTER': {
      const { loading } = action;
      return { ...state, loading };
    }
    case 'REQUEST_REGISTER': {
      const { payload } = action;
      const pendingRequest: HttpRequest<RegisterPayload> = {
        endpoint: SERVER_FQDN + '/api/v1/user/register',
        method: 'POST',
        payload
      };
      return { ...state, pendingRequest };
    }
    default: {
      return state;
    }
  }
};
