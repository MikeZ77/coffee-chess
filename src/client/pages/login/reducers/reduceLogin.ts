import { Reducer, HttpRequest, LoginPayload } from 'common/types';
import { State } from '../state';
import { Action } from '../actions/actions';

const { SERVER_FQDN } = process.env;

export const reduceLogin: Reducer<State, Action> = (action, state) => {
  switch (action.type) {
    case 'UPDATE_USERNAME': {
      let { username } = action;
      username = username.trim();
      return { ...state, username };
    }
    case 'UPDATE_PASSWORD': {
      let { password } = action;
      password = password.trim();
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
    default: {
      return state;
    }
  }
};
