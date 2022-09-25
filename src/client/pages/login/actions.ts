import { Action, LoginPayload } from './types';

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

export const signIn = (body: LoginPayload): Action => {
  return {
    type: 'REQUEST_LOGIN',
    body
  };
};
