import { LoginPayload } from '../../../common/types';

export type Action =
  | {
      type: 'UPDATE_USERNAME';
      username: string;
    }
  | {
      type: 'UPDATE_PASSWORD';
      password: string;
    }
  | {
      type: 'LOADING_BUTTON';
      loading: boolean;
    }
  | {
      type: 'REQUEST_LOGIN';
      payload: LoginPayload;
    }
  | {
      type: 'REQUEST_REGISTER';
    };

export const updateInputUsername = (username: string): Action => {
  return {
    type: 'UPDATE_USERNAME',
    username
  };
};

export const updateInputPassword = (password: string): Action => {
  return {
    type: 'UPDATE_PASSWORD',
    password
  };
};

export const signInLoading = (loading: boolean): Action => {
  return {
    type: 'LOADING_BUTTON',
    loading
  };
};

export const signIn = (payload: LoginPayload): Action => {
  return {
    type: 'REQUEST_LOGIN',
    payload
  };
};
