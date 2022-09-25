import { Reducer, HttpRequest, LoginPayload } from '../types';

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
      const { body } = action;
      const pendingRequest: HttpRequest<LoginPayload> = {
        endpoint: 'localhost:3000/api/v1/login',
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        redirect: 'follow',
        body
      };
      return { ...state, pendingRequest };
    }
  }
};
