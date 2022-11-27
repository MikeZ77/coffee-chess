import { RegisterPayload } from '../../../common/types';

export type Action =
  | { type: 'UPDATE_USERNAME'; username: string }
  | { type: 'UPDATE_EMAIL'; email: string }
  | { type: 'UPDATE_PASSWORD'; password: string }
  | { type: 'UPDATE_REPEATED_PASSWORD'; repeatedPassword: string }
  | { type: 'LOADING_REGISTER'; loading: boolean }
  | { type: 'REQUEST_REGISTER'; payload: RegisterPayload };

export const updateInputUsername = (username: string): Action => {
  return {
    type: 'UPDATE_USERNAME',
    username
  };
};

export const updateInputEmail = (email: string): Action => {
  return {
    type: 'UPDATE_EMAIL',
    email
  };
};

export const updateInputPassword = (password: string): Action => {
  return {
    type: 'UPDATE_PASSWORD',
    password
  };
};

export const updateInputRepeatedPassword = (
  repeatedPassword: string
): Action => {
  return {
    type: 'UPDATE_REPEATED_PASSWORD',
    repeatedPassword
  };
};

export const registerLoading = (loading: boolean): Action => {
  return {
    type: 'LOADING_REGISTER',
    loading
  };
};

export const register = (payload: RegisterPayload): Action => {
  return {
    type: 'REQUEST_REGISTER',
    payload
  };
};
